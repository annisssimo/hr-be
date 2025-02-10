import { User, users } from '../database/models';
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from '../../../constants';
import { RegisterInputParams } from '../../endpoints/auth/register/register.schema';

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
}
