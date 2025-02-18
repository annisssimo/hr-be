import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';

import { User, users } from '../database/models';
import { ERROR_MESSAGES, PROVIDERS } from '../../../constants';
import { RegisterInputParams } from '../../endpoints/auth/register/register.schema';
import { UpdateInputParams } from '../../endpoints/userUpdate/user-update.schema';

@Injectable()
export class UsersService {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase) {}

    public async createUser(newUser: RegisterInputParams): Promise<User> {
        const hashedPassword = await hash(newUser.password, 8);
        try {
            const [resultingUser] = (await this.drizzle
                .insert(users)
                .values({ ...newUser, password: hashedPassword })
                .returning()) as User[];
            return resultingUser;
        } catch (error) {
            throw new InternalServerErrorException(ERROR_MESSAGES.SERVER_ERROR + error.message);
        }
    }

    public async update(userId: string, updateData: Partial<UpdateInputParams>): Promise<User> {
        if (updateData.password) {
            updateData.password = await hash(updateData.password, 8);
        }

        const [updatedUser] = (await this.drizzle
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning()) as User[];

        return updatedUser;
    }
}
