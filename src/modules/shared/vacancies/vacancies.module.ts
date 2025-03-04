import { Module } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from '../../endpoints/vacancies/vacancies.controller';
import { ProvidersModule } from '../database/providers/providers.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JWTModule } from '../jwt/jwt.module';

@Module({
    imports: [ProvidersModule, JWTModule],
    controllers: [VacanciesController],
    providers: [VacanciesService, NodePgDatabase],
})
export class VacanciesModule {}
