import { Module } from '@nestjs/common';

import { ProvidersModule } from '../shared/database/providers/providers.module';
import { UsersModule } from '../shared/users/users.module';
import { RegisterController } from './auth/register/register.controller';

@Module({
    imports: [UsersModule, ProvidersModule],
    controllers: [RegisterController],
})
export class EndpointsModule {}
