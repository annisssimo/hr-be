import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ProvidersModule } from '../database/providers/providers.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JWTModule } from '../jwt/jwt.module';
import { ApplicationsController } from '../../endpoints/applications/applications.controller';

@Module({
    imports: [ProvidersModule, JWTModule],
    controllers: [ApplicationsController],
    providers: [ApplicationsService, NodePgDatabase],
})
export class ApplicationsModule {}
