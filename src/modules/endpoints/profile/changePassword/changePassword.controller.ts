import { eq } from 'drizzle-orm';
import {
    Body,
    Controller,
    Inject,
    NotFoundException,
    Put,
    Res,
    UnauthorizedException,
    UsePipes,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcryptjs';
import { Response } from 'express';

import { ERROR_MESSAGES, HTTP_CODES, PROVIDERS } from '../../../../constants';
import { UsersService } from '../../../shared/users/users.service';
import { ChangePasswordInputParams, ChangePasswordSchema } from './changePassword.schema';
import { users } from '../../../shared/database/models';
import { ZodValidationPipe } from '../../../validation/validation.pipe';

@Controller('v1/profile')
export class ChangePasswordController {
    constructor(
        @Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase,
        private readonly usersService: UsersService,
    ) {}

    @Put('change-password')
    @UsePipes(new ZodValidationPipe(ChangePasswordSchema))
    public async changePassword(@Body() body: ChangePasswordInputParams, @Res() res: Response) {
        const [user] = await this.db.select().from(users).where(eq(users.id, body.userId));

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const isPasswordValid = await bcrypt.compare(body.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_OLD_PASSWORD);
        }

        if (body.newPassword === body.oldPassword) {
            return res.status(HTTP_CODES.BAD_REQUEST).send(ERROR_MESSAGES.SAME_PASSWORD);
        }

        await this.usersService.update(body.userId, { password: body.newPassword });

        return res.status(HTTP_CODES.OK).send({ message: 'Password changed successfully' });
    }
}
