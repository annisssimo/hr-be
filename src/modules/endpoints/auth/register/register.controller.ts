import { Controller, Post, Body, UsePipes, ConflictException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from '../../../../constants';
import { users } from '../../../shared/database/models/users';
import { UsersService } from '../../../shared/users/users.service';
import { ZodValidationPipe } from '../../../validation/validation.pipe';
import { RegisterSchema, RegisterInputParams } from './register.schema';

@Controller('v1/auth/register')
@UsePipes(new ZodValidationPipe(RegisterSchema))
export class RegisterController {
    constructor(
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
        private readonly usersService: UsersService,
    ) {}

    @Post()
    public async register(@Body() body: RegisterInputParams) {
        const [existingUser] = await this.drizzle
            .select()
            .from(users)
            .where(eq(users.email, body.email));

        if (existingUser) {
            throw new ConflictException('Email is already in use');
        }

        return this.usersService.createUser(body);
    }
}
