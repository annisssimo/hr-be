import { Module } from '@nestjs/common';

import { UsersModule } from '../shared/users/users.module';
import { RegisterController } from './auth/register/register.controller';
import { ProvidersModule } from '../shared/database/providers/providers.module';
import { LoginController } from './auth/login/login.controller';
import { UserUpdateController } from './userUpdate/user-update.controller';
import { UsersListController } from './usersList/users-list.controller';
import { ChangePasswordController } from './profile/changePassword/changePassword.controller';
import { PasswordResetController } from './auth/passwordReset/passwordReset.controller';
import { MailService } from '../shared/mail/mail.service';
import { PasswordResetService } from '../shared/passwordReset/passwordReset.service';
import { UsersService } from '../shared/users/users.service';
import { PasswordResetModule } from '../shared/passwordReset/passwordReset.module';
import { PasswordRequestResetController } from './auth/passwordRequestReset/passwordRequestReset.controller';
import { JWTModule } from '../shared/jwt/jwt.module';

@Module({
    imports: [UsersModule, ProvidersModule, PasswordResetModule, JWTModule],
    controllers: [
        RegisterController,
        LoginController,
        UsersListController,
        UserUpdateController,
        ChangePasswordController,
        PasswordResetController,
        PasswordRequestResetController,
    ],
    providers: [PasswordResetService, UsersService, MailService],
})
export class EndpointsModule {}
