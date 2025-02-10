import { Module } from '@nestjs/common';
import { ProvidersModule } from '../database/providers/providers.module';
import { DrizzleProvider } from '../database/providers/drizzle.provider';
import { UsersService } from './users.service';
import { JWTModule } from '../jwt/jwt.module';

@Module({
    imports: [ProvidersModule, JWTModule],
    providers: [DrizzleProvider, UsersService],
    exports: [UsersService],
})
export class UsersModule {}
