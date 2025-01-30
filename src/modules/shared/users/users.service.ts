import { User, users } from 'src/modules/shared/database/models';
import { Injectable, Inject } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from 'src/constants';
import { RegisterInputParams } from 'src/modules/endpoints/auth/register/register.schema';

@Injectable()
export class UsersService {
    constructor(
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
        private readonly jwtService: JwtService,
    ) {}

    public async createUser(newUser: RegisterInputParams): Promise<string> {
        const hashedPassword = await hash(newUser.password, 8);
        const registeredUsers = await this.drizzle
            .insert(users)
            .values({ ...newUser, password: hashedPassword })
            .returning();

        return this.generateToken(registeredUsers[0]);
    }

    private generateToken(user: User) {
        const payload = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
        return this.jwtService.sign(payload);
    }
}
