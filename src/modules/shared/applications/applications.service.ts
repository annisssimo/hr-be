import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from '../../../constants';
import { Application, applications } from '../database/models';

@Injectable()
export class ApplicationsService {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase) {}

    // Создание заявки
    public async createApplication(candidateId: string, vacancyId: string): Promise<Application> {
        const [newApplication] = await this.db
            .insert(applications)
            .values({ candidateId, vacancyId })
            .returning();
        return newApplication;
    }

    // Получение всех заявок
    public async getAllApplications(): Promise<Application[]> {
        return this.db.select().from(applications);
    }

    // Получение заявки по ID
    public async getApplicationById(id: string): Promise<Application | null> {
        const [application] = await this.db
            .select()
            .from(applications)
            .where(eq(applications.id, id));
        return application || null;
    }

    // Получение заявок кандидата
    public async getApplicationsByCandidateId(candidateId: string): Promise<Application[]> {
        return this.db.select().from(applications).where(eq(applications.candidateId, candidateId));
    }

    // Обновление статуса заявки
    public async updateApplicationStatus(
        id: string,
        status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
    ): Promise<Application | null> {
        const [updatedApplication] = await this.db
            .update(applications)
            .set({ status })
            .where(eq(applications.id, id))
            .returning();
        return updatedApplication || null;
    }

    // Удаление заявки
    public async deleteApplication(id: string): Promise<boolean> {
        const result = await this.db.delete(applications).where(eq(applications.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
    }
}
