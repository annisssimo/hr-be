import { z } from 'zod';

export const RegisterSchema = z.object({
    firstName: z
        .string()
        .min(1)
        .max(11)
        .regex(
            new RegExp('^[a-zA-Z]+$'),
            'First name must contain only letters and have length between 1 and 11',
        ),
    lastName: z
        .string()
        .min(2)
        .max(15)
        .regex(
            new RegExp('^[a-zA-Z]+$'),
            'Last name must contain only letters and have length between 2 and 15',
        ),
    email: z.string().email('Invalid email format').min(1),
    password: z
        .string()
        .min(8)
        .max(20)
        .regex(
            new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,20}$'),
            'Password must be between 8 and 20 characters long and contain one letter and one digit',
        ),
});

export type RegisterInputParams = z.infer<typeof RegisterSchema>;
