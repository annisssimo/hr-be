import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SQL, inArray, ilike, or, and, asc, desc, count, eq } from 'drizzle-orm';
import { PROVIDERS } from '../../../constants';
import { CreateResumeDto, ResumesListParams } from '../../endpoints/resumes/resumes.schema';
import { resumes } from '../database/models/resumes';

@Injectable()
export class ResumesService {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase) {}

    public async list(params: ResumesListParams) {
        const { includeCount, limit, offset, search, filters, sort } = params;

        const whereOption = this.buildWhereOptions({ search, filters });
        const order = this.buildOrder(sort);

        let totalCount: number | undefined = undefined;
        if (includeCount) {
            totalCount = await this.getResumesCount(whereOption);
        }

        const resumesList = await this.drizzle
            .select()
            .from(resumes)
            .where(whereOption)
            .orderBy(...order)
            .limit(limit ?? 10)
            .offset(offset ?? 0);

        return {
            data: resumesList,
            metadata: {
                count: totalCount,
                limit: limit ?? 10,
                offset: offset ?? 0,
            },
        };
    }

    public async create(data: CreateResumeDto) {
        const [newResume] = await this.drizzle
            .insert(resumes)
            .values({
                ...data,
                skills: JSON.stringify(data.skills),
                experience: JSON.stringify(data.experience),
                education: JSON.stringify(data.education),
                filePath: data.filePath || null,
            })
            .returning();

        return newResume;
    }

    public async delete(resumeId: string) {
        await this.drizzle.delete(resumes).where(eq(resumes.id, resumeId));
    }

    private async getResumesCount(whereOption?: SQL<unknown>): Promise<number | undefined> {
        const countResult = await this.drizzle
            .select({ count: count() })
            .from(resumes)
            .where(whereOption);

        return countResult[0]?.count ?? undefined;
    }

    private buildWhereOptions({
        search,
        filters,
    }: Pick<ResumesListParams, 'search' | 'filters'>): SQL | undefined {
        const whereClauses: SQL[] = [];

        if (filters?.candidateId) {
            whereClauses.push(inArray(resumes.candidateId, [filters.candidateId]));
        }
        if (filters?.title) {
            whereClauses.push(inArray(resumes.title, [filters.title]));
        }

        if (search) {
            const searchConditions = [
                ilike(resumes.skills, `%${search}%`),
                ilike(resumes.experience, `%${search}%`),
                ilike(resumes.education, `%${search}%`),
            ];

            const orCondition = or(...searchConditions);

            if (orCondition) {
                whereClauses.push(orCondition);
            }
        }

        return whereClauses.length ? and(...whereClauses) : undefined;
    }

    private buildOrder(sort?: { field: string; order: string }[]): SQL[] {
        return (
            sort?.map(({ field, order }) =>
                order === 'asc' ? asc(resumes[field]) : desc(resumes[field]),
            ) ?? [asc(resumes.createdAt)]
        );
    }
}
