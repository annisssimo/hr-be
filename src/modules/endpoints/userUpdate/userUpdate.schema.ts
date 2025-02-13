import { z } from 'zod';
import { USER_STATUS, USER_ROLE } from '../../../constants';

export const UpdateSchema = z.object({
    firstName: z.string().max(255).optional(),
    lastName: z.string().max(255).optional(),
    email: z.string().email().max(255).optional(),
    managerId: z.string().uuid().optional(),
    password: z.string().min(8).max(255).optional(),
    avatar: z.string().max(255).optional(),
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.PENDING, USER_STATUS.ARCHIVED]).optional(),
    role: z.enum([USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER]).optional(),
});

export type UpdateInputParams = z.infer<typeof UpdateSchema>;
