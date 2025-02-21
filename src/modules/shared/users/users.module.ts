import { Module } from '@nestjs/common';

import { ProvidersModule } from '../database/providers/providers.module';
import { DrizzleProvider } from '../database/providers/drizzle.provider';
import { UsersService } from './users.service';
import { JWTModule } from '../jwt/jwt.module';
import { UsersReadService } from './users-read.service';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [ProvidersModule, JWTModule, MailModule],
    providers: [DrizzleProvider, UsersService, UsersReadService, MailService],
    exports: [UsersService, UsersReadService],
})
export class UsersModule {}
