import { z } from 'zod';

export const PasswordRequestResetSchema = z.object({
    email: z.string().email('Invalid email format').min(1),
});

export type PasswordRequestResetParams = z.infer<typeof PasswordRequestResetSchema>;
