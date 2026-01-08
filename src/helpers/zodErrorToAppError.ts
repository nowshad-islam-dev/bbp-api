import { ZodError } from 'zod';
import { AppError } from '@/utils/AppError';

export function zodToAppError(err: ZodError): AppError {
    const fieldErrors = err.flatten().fieldErrors;

    return new AppError(
        'Validation failed',
        422,
        'VALIDATION_ERROR',
        fieldErrors,
    );
}
