import { z } from 'zod';

export const CreateVacancyDtoSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().min(1, 'Description is required').max(2000),
    skills: z.array(z.string()),
    location: z.string().max(255).nullable().optional(),
    salary: z.number().int().positive().nullable().optional(),
    managerId: z.string().uuid('Manager ID must be a valid UUID'),
});

export const UpdateVacancyDtoSchema = CreateVacancyDtoSchema.partial();

export type CreateVacancyDto = z.infer<typeof CreateVacancyDtoSchema>;
export type UpdateVacancyDto = z.infer<typeof UpdateVacancyDtoSchema>;
