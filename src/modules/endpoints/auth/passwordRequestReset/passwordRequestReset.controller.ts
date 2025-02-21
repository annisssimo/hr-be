import {
    Controller,
    Post,
    Body,
    Injectable,
    Inject,
    UsePipes,
    HttpException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { PasswordResetService } from '../../../shared/passwordReset/passwordReset.service';
import { ERROR_MESSAGES, HTTP_CODES, PROVIDERS, USER_STATUS } from '../../../../constants';
import { MailService } from '../../../shared/mail/mail.service';
import { User, users } from '../../../shared/database/models/users';
import { ZodValidationPipe } from '../../../validation/validation.pipe';
import {
    PasswordRequestResetParams,
    PasswordRequestResetSchema,
} from '../passwordRequestReset/passwordRequestReset.schema';

@Injectable()
@Controller('v1/auth/password-reset')
@UsePipes(new ZodValidationPipe(PasswordRequestResetSchema))
export class PasswordRequestResetController {
    constructor(
        private readonly passwordResetService: PasswordResetService,
        private readonly mailService: MailService,
        @Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase,
    ) {}

    @Post('request')
    public async requestReset(@Body() body: PasswordRequestResetParams) {
        const [user] = (await this.db
            .select()
            .from(users)
            .where(
                and(eq(users.email, body.email), eq(users.status, USER_STATUS.ACTIVE)),
            )) as User[];
        if (!user) {
            throw new HttpException(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
        }

        if (!user) {
            throw new HttpException(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
        }

        try {
            const token = await this.passwordResetService.generateResetToken(user.id);
            const resetLink = this.generateResetLink(token);
            await this.mailService.sendPasswordResetEmail(
                user.email,
                user.firstName,
                user.lastName,
                resetLink,
            );
        } catch (error) {
            console.error(ERROR_MESSAGES.PASSWORD_RESET_FAILED, error);
            throw new HttpException(ERROR_MESSAGES.SERVER_ERROR, HTTP_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    private generateResetLink(token: string): string {
        return `${process.env.FRONTEND_PROD_BASE_URL}/auth/new-password?token=${token}`;
    }
}
