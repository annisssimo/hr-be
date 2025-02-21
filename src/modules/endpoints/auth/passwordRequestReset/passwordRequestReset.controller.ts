import {
    Controller,
    Post,
    Body,
    Injectable,
    Inject,
    UsePipes,
    HttpException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { PasswordResetService } from '../../../shared/passwordReset/passwordReset.service';
import { MailService } from '../../../shared/passwordReset/mail.service';
import { ERROR_MESSAGES, HTTP_CODES, PROVIDERS } from '../../../../constants';
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
            .where(eq(users.email, body.email))) as User[];

        if (!user) {
            throw new HttpException(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
        }

        try {
            const token = await this.passwordResetService.generateResetToken(user.id);
            const resetLink = this.generateResetLink(token);
            await this.sendPasswordResetEmail(user, resetLink);
        } catch (error) {
            console.error(ERROR_MESSAGES.PASSWORD_RESET_FAILED, error);
            throw new HttpException(ERROR_MESSAGES.SERVER_ERROR, HTTP_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    private generateResetLink(token: string): string {
        return `${process.env.FRONTEND_PROD_BASE_URL}/auth/new-password?token=${token}`;
    }

    private async sendPasswordResetEmail(user: User, resetLink: string): Promise<void> {
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.5; text-align: center;">
                <h1 style="color: #004DD7; font-size: 24px; margin-bottom: 20px;">Hello, ${user.firstName} ${user.lastName}</h1>
                <p>We have received a request to change a password to your account.</p>
                <p>Click the button below to change your password:</p>
                <div style="margin: 25px 0;">
                    <a href="${resetLink}" 
                        style="background-color: #004DD7; 
                                color: white; 
                                padding: 12px 25px; 
                                text-decoration: none; 
                                border-radius: 4px; 
                                font-weight: bold;
                                display: inline-block;">
                        CHANGE PASSWORD
                    </a>
                </div>
                <p>or follow the link:<br>
                <a href="${resetLink}" 
                    style="color: #004DD7; word-break: break-all;">
                    ${resetLink}
                </a></p>
                <p style="margin-top: 30px;">If you did not send the request, just ignore this email, and no changes will occur in your account.</p>
                <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
                <div style="font-size: 0.9em; color: #666;">
                    <p>Best regards,<br>Sunmait Team</p>
                    <p>Privacy Policy © Sunmait Technologies, 2022–2025.</p>
                </div>
            </div>
        `;
        await this.mailService.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: emailContent,
        });
    }
}
