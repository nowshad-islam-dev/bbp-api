import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import { sendError } from '@/utils/sendError';
import { logger } from '@/utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
): Response => {
    logger.error(err.message, {
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
    });

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
