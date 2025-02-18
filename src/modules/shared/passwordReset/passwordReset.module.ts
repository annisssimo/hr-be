import { Module } from '@nestjs/common';
import { PasswordResetService } from '../../shared/passwordReset/passwordReset.service';
import { UsersService } from '../../shared/users/users.service';
import { MailService } from '../../shared/passwordReset/mail.service';
import { ProvidersModule } from '../database/providers/providers.module';
import { PasswordResetController } from '../../endpoints/auth/passwordReset/passwordReset.controller';
import { PasswordRequestResetController } from '../../endpoints/auth/passwordRequestReset/passwordRequestReset.controller';

@Module({
    imports: [ProvidersModule],
    controllers: [PasswordResetController, PasswordRequestResetController],
    providers: [PasswordResetService, UsersService, MailService],
    exports: [PasswordResetService],
})
export class PasswordResetModule {}
