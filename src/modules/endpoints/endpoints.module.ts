import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/shared/users/users.module';
import { RegisterController } from './auth/register/register.controller';
import { ProvidersModule } from '../shared/database/providers/providers.module';

@Module({
    imports: [UsersModule, ProvidersModule],
    controllers: [RegisterController],
})
export class EndpointsModule {}
