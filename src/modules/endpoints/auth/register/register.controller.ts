import { eq } from 'drizzle-orm';
import {
    Post,
    Body,
    ConflictException,
    Inject,
    Res,
    InternalServerErrorException,
    UseGuards,
} from '@nestjs/common';
import { Controller } from '../../../../decorators/controller.decorator';
import { Response } from 'express';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from '../../../../constants';
import { users } from '../../../shared/database/models/users';
import { UsersService } from '../../../shared/users/users.service';
import { RegisterSchema, RegisterInputParams } from './register.schema';
import { ControllerGuard } from '../../../../guards/controller.guard';

@UseGuards(ControllerGuard)
@Controller('v1/auth/register', { validationSchema: RegisterSchema })
export class RegisterController {
    constructor(
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
        private readonly usersService: UsersService,
    ) {}

    @Post()
    public async register(@Body() body: RegisterInputParams, @Res() res: Response) {
        const [existingUser] = await this.drizzle
            .select()
            .from(users)
            .where(eq(users.email, body.email));

        if (existingUser) {
            throw new ConflictException('Email is already in use');
        }
        const result = await this.usersService.createUser(body);
        if (!result) {
            throw new InternalServerErrorException('User already exists');
        }
        return res.status(204).send();
    }
}
