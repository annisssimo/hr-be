import { z } from 'zod';
import { USER_STATUS } from '../../../constants';

export const UsersListSchema = z.object({
    limit: z.number().min(1).max(100).default(10).optional(),
    offset: z.number().min(0).default(0).optional(),
    includeCount: z.boolean().optional(),
    filters: z
        .object({
            id: z.string().array().optional(),
            status: z
                .array(z.enum([USER_STATUS.ACTIVE, USER_STATUS.ARCHIVED, USER_STATUS.PENDING]))
                .nonempty()
                .optional(),
            managerId: z.string().array().optional(),
        })
        .optional(),
    filtersOr: z
        .object({
            isAdmin: z.boolean().optional(),
            isManager: z.boolean().optional(),
            isEmployee: z.boolean().optional(),
        })
        .optional(),
    search: z.string().optional(),
    sort: z
        .array(
            z.object({
                field: z.enum(['firstName', 'lastName', 'email']),
                order: z.enum(['asc', 'desc']),
            }),
        )
        .optional(),
});

export type UsersListParams = z.infer<typeof UsersListSchema>;
