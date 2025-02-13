import { hash } from 'bcryptjs';
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { User, users } from '../database/models';
import { PROVIDERS } from '../../../constants';
import { RegisterInputParams } from '../../endpoints/auth/register/register.schema';
import { UpdateInputParams } from '../../endpoints/userUpdate/userUpdate.schema';

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
            throw new InternalServerErrorException('Unexpected error - ' + error.message);
        }
    }

    public async update(userId: string, updateData: Partial<UpdateInputParams>): Promise<User> {
        const [updatedUser] = (await this.drizzle
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning()) as User[];

        return updatedUser;
    }
}
