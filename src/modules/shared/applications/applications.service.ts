import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PROVIDERS } from '../../../constants';
import { Application, applications, vacancies, resumes, users } from '../database/models';
import { CreateApplicationDto } from '../../endpoints/applications/applications.schema';

@Injectable()
export class ApplicationsService {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase) {}

    public async createApplication({
        candidateId,
        vacancyId,
        resumeId,
        coverLetter,
        source,
    }: CreateApplicationDto): Promise<Application> {
        const [resume] = await this.db
            .select()
            .from(resumes)
            .where(eq(resumes.id, resumeId))
            .limit(1);

        if (!resume || resume.candidateId !== candidateId) {
            throw new Error('Resume not found');
        }

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
            ...item.applications,
            vacancyTitle: item.vacancies.title,
            skills: item.vacancies.skills,
            location: item.vacancies.location,
            salary: item.vacancies.salary,
            candidateName: `${item.users.firstName} ${item.users.lastName}`,
            resumeTitle: item.resumes.title,
        }));
    }

    public async getApplicationById(id: string): Promise<Application | null> {
        const [application] = await this.db
            .select()
            .from(applications)
            .where(eq(applications.id, id));
        return application || null;
    }

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

    public async getRankedApplicationsForVacancy(
        vacancyId: string,
    ): Promise<ExtendedApplication[]> {
        const [vacancy] = await this.db
            .select()
            .from(vacancies)
            .where(eq(vacancies.id, vacancyId))
            .limit(1);

        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        const applicationsData = await this.db
            .select()
            .from(applications)
            .innerJoin(resumes, eq(applications.resumeId, resumes.id))
            .innerJoin(users, eq(resumes.candidateId, users.id))
            .innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            .where(eq(applications.vacancyId, vacancyId));

        const rankedApplications = applicationsData.map((item) => {
            const resumeSkills = item.resumes.skills || [];
            const vacancySkills = vacancy.skills || [];
            const matchCount = resumeSkills.filter((skill) => vacancySkills.includes(skill)).length;
            const matchPercentage =
                vacancySkills.length > 0
                    ? parseFloat(((matchCount / vacancySkills.length) * 100).toFixed(2))
                    : 0;

            return {
                ...item.applications,
                candidateName: `${item.users.firstName} ${item.users.lastName}`,
                resumeTitle: item.resumes.title,
                vacancyTitle: item.vacancies.title,
                skills: item.vacancies.skills,
                location: item.vacancies.location,
                salary: item.vacancies.salary,
                matchCount,
                matchPercentage,
            };
        });

        rankedApplications.sort((a, b) => b.matchPercentage - a.matchPercentage);

        return rankedApplications;
    }

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
    matchCount?: number;
    matchPercentage?: number;
}

export type ExtendedApplication = Application & ApplicationDetails;
