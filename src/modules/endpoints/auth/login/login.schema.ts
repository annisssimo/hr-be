import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
});

export type LoginInputParameters = z.infer<typeof LoginSchema>;
