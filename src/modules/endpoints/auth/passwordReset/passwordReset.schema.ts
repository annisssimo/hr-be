import { z } from 'zod';

export const PasswordResetSchema = z.object({
    token: z.string().uuid('Invalid token format'),
    newPassword: z
        .string()
        .min(8)
        .max(20)
        .regex(
            new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,20}$'),
            'Password must be between 8 and 20 characters long and contain one letter and one digit',
        ),
});

export type PasswordResetParams = z.infer<typeof PasswordResetSchema>;
