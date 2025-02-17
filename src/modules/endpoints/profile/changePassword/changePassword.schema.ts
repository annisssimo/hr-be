import { z } from 'zod';

export const ChangePasswordSchema = z.object({
    userId: z.string().uuid(),
    oldPassword: z
        .string()
        .min(8)
        .max(20)
        .regex(
            new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,20}$'),
            'Password must be between 8 and 20 characters long and contain one letter and one digit',
        ),
    newPassword: z
        .string()
        .min(8)
        .max(20)
        .regex(
            new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,20}$'),
            'Password must be between 8 and 20 characters long and contain one letter and one digit',
        ),
});

export type ChangePasswordInputParams = z.infer<typeof ChangePasswordSchema>;
