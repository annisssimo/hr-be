import { Module } from '@nestjs/common';

import { ProvidersModule } from '../database/providers/providers.module';
import { DrizzleProvider } from '../database/providers/drizzle.provider';
import { UsersService } from './users.service';

@Module({
    imports: [ProvidersModule],
    providers: [DrizzleProvider, UsersService],
    exports: [UsersService],
})
export class UsersModule {}
