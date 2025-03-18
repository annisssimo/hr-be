import { z } from 'zod';

export const ResumesListSchema = z.object({
    limit: z.number().min(1).max(100).default(10).optional(),
    offset: z.number().min(0).default(0).optional(),
    includeCount: z.boolean().optional(),
    filters: z
        .object({
            candidateId: z.string().uuid('Candidate ID must be a valid UUID').optional(),
            title: z.string().optional(),
            skills: z.string().optional(),
            experience: z.string().optional(),
            education: z.string().optional(),
        })
        .optional(),
    search: z.string().optional(),
    sort: z
        .array(
            z.object({
                field: z.enum(['createdAt', 'updatedAt', 'skills', 'experience', 'education']),
                order: z.enum(['asc', 'desc']), // Порядок сортировки
            }),
        )
        .optional(),
});

export const CreateResumeSchema = z.object({
    candidateId: z.string().uuid(),
    title: z.string().min(1, 'Название резюме обязательно'),
    skills: z.array(z.string()),
    experience: z.string().optional(),
    education: z.string().optional(),
    filePath: z.string().optional(),
});

export type ResumesListParams = z.infer<typeof ResumesListSchema>;
export type CreateResumeDto = z.infer<typeof CreateResumeSchema>;
