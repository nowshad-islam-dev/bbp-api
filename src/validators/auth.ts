import * as z from 'zod';
import { insertUserSchema } from '.';

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
    .min(8)
    .max(32)
    .regex(
        strongPasswordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    );

export const loginSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string().min(8),
    }),
});

export const createUserSchema = z.object({
    body: insertUserSchema.extend({
        firstName: z.string().min(2).max(20),
        lastName: z.string().min(2).max(20),
        email: z.email(),
        password: password,
        phone: z.string().transform((v) => (v === '' ? undefined : v)),
    }),
});

export const verifyEmailSchema = z.object({
    query: z.object({
        token: z.string().min(1, 'Verification token is required'),
    }),
});
export const resendVerificationSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Verification token is required'),
    }),
});

export interface SignupBody {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginBody {
    email: string;
    password: string;
}
