import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Vacancy, vacancies } from '../database/models/vacancies';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from '../../../constants';
import { users } from '../database/models';

@Injectable()
export class VacanciesService {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase) {}

    // Создание новой вакансии
    public async createVacancy(vacancyData: Omit<Vacancy, 'id' | 'createdAt'>): Promise<Vacancy> {
        const [manager] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, vacancyData.managerId));

        if (!manager) {
            throw new NotFoundException('Manager not found');
        }

        const [newVacancy] = await this.db.insert(vacancies).values(vacancyData).returning();
        return newVacancy;
    }

    // Получение списка всех вакансий
    public async getAllVacancies(): Promise<Vacancy[]> {
        return this.db.select().from(vacancies);
    }

    // Получение вакансии по ID
    public async getVacancyById(id: string): Promise<Vacancy | null> {
        const [vacancy] = await this.db.select().from(vacancies).where(eq(vacancies.id, id));
        return vacancy || null;
    }

    // Обновление вакансии
    public async updateVacancy(id: string, vacancyData: Partial<Vacancy>): Promise<Vacancy | null> {
        const [updatedVacancy] = await this.db
            .update(vacancies)
            .set(vacancyData)
            .where(eq(vacancies.id, id))
            .returning();
        return updatedVacancy || null;
    }

    // Удаление вакансии
    public async deleteVacancy(id: string): Promise<boolean> {
        const result = await this.db.delete(vacancies).where(eq(vacancies.id, id));
        return (result.rowCount ?? 0) > 0;
    }
}
