import * as z from 'zod';
import { AppError } from '../middlewares/error';

export function zodToAppError(err: z.ZodError): AppError {
    const fieldErrors = err.flatten().fieldErrors;
    console.log(fieldErrors);

    const appErr = new Error('Validation failed') as AppError;

    appErr.status = 'fail';
    appErr.statusCode = 400;
    appErr.isOperational = true;
    appErr.errors = fieldErrors;

    return appErr;
}
