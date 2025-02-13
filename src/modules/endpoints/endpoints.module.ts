import { Module } from '@nestjs/common';

import { UsersModule } from '../shared/users/users.module';
import { RegisterController } from './auth/register/register.controller';
import { ProvidersModule } from '../shared/database/providers/providers.module';
import { JWTModule } from '../shared/jwt/jwt.module';
import { LoginController } from './auth/login/login.controller';
import { UsersListController } from './usersList/usersList.controller';
import { UserUpdateController } from './userUpdate/userUpdate.controller';

@Module({
    imports: [UsersModule, ProvidersModule, JWTModule],
    controllers: [RegisterController, LoginController, UsersListController, UserUpdateController],
})
export class EndpointsModule {}
