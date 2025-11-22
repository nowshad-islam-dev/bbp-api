import { ZodError } from 'zod';
import { AppError } from '../middlewares/error';

export function zodToAppError(err: ZodError): AppError {
    const msg = err.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');

    const appErr = new Error(msg) as AppError;
    appErr.status = 'fail';
    appErr.statusCode = 400;
    appErr.isOperational = true;

    return appErr;
}
