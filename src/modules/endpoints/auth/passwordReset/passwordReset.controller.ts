import {
    Controller,
    Body,
    Injectable,
    Inject,
    UsePipes,
    BadRequestException,
    Put,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { PasswordResetService } from '../../../shared/passwordReset/passwordReset.service';
import { UsersService } from '../../../shared/users/users.service';
import { MailService } from '../../../shared/passwordReset/mail.service';
import { ERROR_MESSAGES, PROVIDERS } from '../../../../constants';
import { ZodValidationPipe } from '../../../validation/validation.pipe';
import { PasswordResetParams, PasswordResetSchema } from './passwordReset.schema';

@Injectable()
@Controller('v1/auth/password-reset')
@UsePipes(new ZodValidationPipe(PasswordResetSchema))
export class PasswordResetController {
    constructor(
        private readonly passwordResetService: PasswordResetService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
        @Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase,
    ) {}

    @Put('reset')
    public async resetPassword(@Body() body: PasswordResetParams) {
        const userId = await this.passwordResetService.validateResetToken(body.token);
        if (!userId) throw new BadRequestException(ERROR_MESSAGES.TOKEN_INVALID);
        await this.usersService.update(userId, { password: body.newPassword });
        await this.passwordResetService.deleteResetToken(body.token);
    }
}
