import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from '../../../constants';
import { Application, applications, vacancies, resumes, users } from '../database/models';
import { CreateApplicationDto } from '../../endpoints/applications/applications.schema';

@Injectable()
export class ApplicationsService {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase) {}

    // Создание заявки
    public async createApplication({
        candidateId,
        vacancyId,
        resumeId,
        coverLetter,
        source,
    }: CreateApplicationDto): Promise<Application> {
        // Проверяем, существует ли резюме и принадлежит ли оно кандидату
        const [resume] = await this.db
            .select()
            .from(resumes)
            .where(eq(resumes.id, resumeId))
            .limit(1);

        if (!resume || resume.candidateId !== candidateId) {
            throw new Error('Resume not found');
        }

        // Создаем заявку
        const [newApplication] = await this.db
            .insert(applications)
            .values({
                candidateId,
                vacancyId,
                resumeId,
                coverLetter,
                source,
            })
            .returning();

        return newApplication;
    }

    public async getAllApplications(): Promise<ExtendedApplication[]> {
        const result = await this.db
            .select()
            .from(applications)
            .innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            .innerJoin(resumes, eq(applications.resumeId, resumes.id))
            .innerJoin(users, eq(resumes.candidateId, users.id));

        return result.map((item) => ({
            ...item.applications, // Основные данные заявки
            vacancyTitle: item.vacancies.title, // Название вакансии
            skills: item.vacancies.skills, // Навыки вакансии
            location: item.vacancies.location, // Локация вакансии
            salary: item.vacancies.salary, // Зарплата вакансии
            candidateName: `${item.users.firstName} ${item.users.lastName}`, // Имя кандидата
            resumeTitle: item.resumes.title, // Название резюме
        }));
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
    public async getApplicationsByCandidateId(candidateId: string): Promise<ExtendedApplication[]> {
        const result = await this.db
            .select()
            .from(applications)
            .innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            .where(eq(applications.candidateId, candidateId));

        return result.map((item) => ({
            ...item.applications,
            vacancyTitle: item.vacancies.title,
            skills: item.vacancies.skills,
            location: item.vacancies.location,
            salary: item.vacancies.salary,
        }));
    }

    public async getApplicationsByVacancyId(vacancyId: string): Promise<ExtendedApplication[]> {
        const result = await this.db
            .select()
            .from(applications)
            .innerJoin(resumes, eq(applications.resumeId, resumes.id))
            .innerJoin(users, eq(resumes.candidateId, users.id))
            .innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            .where(eq(applications.vacancyId, vacancyId));

        return result.map((item) => ({
            ...item.applications,
            candidateName: `${item.users.firstName} ${item.users.lastName}`,
            resumeTitle: item.resumes.title,
            vacancyTitle: item.vacancies.title,
            skills: item.vacancies.skills,
            location: item.vacancies.location,
            salary: item.vacancies.salary,
        }));
    }

    // Ранжирование резюме по количеству совпадений навыков
    public async getRankedResumesForVacancy(vacancyId: string) {
        const [vacancy] = await this.db
            .select()
            .from(vacancies)
            .where(eq(vacancies.id, vacancyId))
            .limit(1);

        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        const candidateResumes = await this.db
            .select({
                resume: resumes,
                matchCount: sql<number>`(
                    SELECT COUNT(*) 
                    FROM unnest(${resumes.skills}) AS skill 
                    WHERE skill = ANY(${vacancy.skills})
                )`,
            })
            .from(resumes)
            .orderBy(desc(sql`matchCount`));

        return candidateResumes;
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

interface ApplicationDetails {
    vacancyTitle: string;
    skills: string[];
    location: string | null;
    salary: number | null;
}

export type ExtendedApplication = Application & ApplicationDetails;
