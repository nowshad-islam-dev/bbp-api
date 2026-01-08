import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import { sendError } from '@/utils/sendError';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): Response => {
    console.error('❌ Error:', err);

    // Trusted, operational errors
    if (err instanceof AppError && err.isOperational) {
        return sendError(
            res,
            err.statusCode,
            err.message,
            err.code,
            err.details,
        );
    }

    // Unknown / programming errors
    return sendError(
        res,
        500,
        'Something went wrong on our server',
        'INTERNAL_SERVER_ERROR',
    );
};
