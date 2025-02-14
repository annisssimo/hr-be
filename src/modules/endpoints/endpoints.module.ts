import { Module } from '@nestjs/common';

import { UsersModule } from '../shared/users/users.module';
import { RegisterController } from './auth/register/register.controller';
import { ProvidersModule } from '../shared/database/providers/providers.module';
import { JWTModule } from '../shared/jwt/jwt.module';
import { LoginController } from './auth/login/login.controller';
import { UserUpdateController } from './userUpdate/user-update.controller';
import { UsersListController } from './usersList/users-list.controller';

@Module({
    imports: [UsersModule, ProvidersModule, JWTModule],
    controllers: [RegisterController, LoginController, UsersListController, UserUpdateController],
})
export class EndpointsModule {}
