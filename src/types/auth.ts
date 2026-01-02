import * as z from 'zod';
import { JwtPayload } from 'jsonwebtoken';

/**
 * Strong password regex:
 * - Must be 8 or more characters long.
 * - Must contain at least one lowercase letter (a-z).
 * - Must contain at least one uppercase letter (A-Z).
 * - Must contain at least one digit (0-9).
 * - Must contain at least one special character (!@#$%^&*-).
 */
const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*-]).{8,}$/;

const password = z
    .string()
    .min(8, { error: 'Password must be at least 8 characters long' })
    .regex(strongPasswordRegex, {
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    });

export const LoginSchema = z.object({
    email: z.email({ error: 'Invalid email or password' }),
    password: z.string().min(8, 'Invalid email or password'),
});

export const RegisterSchema = z.object({
    firstName: z
        .string()
        .min(2, { error: 'Firstname must be at least 2 chars long' })
        .max(20, { error: 'Firstname cannot be more than 20 chars long' }),
    lastName: z
        .string()
        .min(2, { error: 'Lastname must be at least 2 chars long' })
        .max(20, { error: 'Lastname cannot be more than 20 chars long' }),
    email: z.email(),
    password: password,
    phone: z.string().transform((v) => (v === '' ? undefined : v)),
});

export interface AuthPayload extends JwtPayload {
    id: number;
    role: 'user' | 'volunteer' | 'admin';
}

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
