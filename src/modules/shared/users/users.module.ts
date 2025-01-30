import { DrizzleProvider } from './../database/providers/drizzle.provider';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ProvidersModule } from 'src/modules/shared/database/providers/providers.module';

@Module({
    imports: [ProvidersModule],
    providers: [DrizzleProvider, UsersService],
    exports: [UsersService],
})
export class UsersModule {}
