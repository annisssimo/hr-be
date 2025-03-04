import { z } from 'zod';

export const CreateApplicationDtoSchema = z.object({
    candidateId: z.string().uuid('Candidate ID must be a valid UUID'),
    vacancyId: z.string().uuid('Vacancy ID must be a valid UUID'),
});

export type CreateApplicationDto = z.infer<typeof CreateApplicationDtoSchema>;

export const UpdateApplicationStatusDtoSchema = z.object({
    status: z.enum(['pending', 'reviewed', 'accepted', 'rejected'], {
        required_error: 'Status is required',
        invalid_type_error: 'Status must be one of: pending, reviewed, accepted, rejected',
    }),
});

export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusDtoSchema>;
