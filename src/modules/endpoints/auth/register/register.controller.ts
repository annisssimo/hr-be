import { ZodValidationPipe } from '../../../validation/validation.pipe';
import { Controller, Post, Body, UsePipes, ConflictException, Inject } from '@nestjs/common';
import { users } from 'src/modules/shared/database/models';
import { UsersService } from 'src/modules/shared/users/users.service';
import {
    RegisterInputParams,
    RegisterSchema,
} from 'src/modules/endpoints/auth/register/register.schema';
import { eq } from 'drizzle-orm';
import { PROVIDERS } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

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
            throw new ConflictException('Email already in use');
        }
        return this.usersService.createUser(body);
    }
}
