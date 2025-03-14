import { Module } from '@nestjs/common';
import { ResumesController } from '../../endpoints/resumes/resumes.controller';
import { ProvidersModule } from '../database/providers/providers.module';
import { ResumesService } from './resumes.service';
import { JWTModule } from '../jwt/jwt.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Module({
    imports: [ProvidersModule, JWTModule],
    controllers: [ResumesController],
    providers: [ResumesService, NodePgDatabase],
})
export class ResumesModule {}
