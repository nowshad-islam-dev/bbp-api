import { NextFunction, Request, Response } from 'express';

export interface AppError extends Error {
    isOperational?: boolean;
    statusCode?: number;
    status?: 'fail' | 'error';
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
): Response => {
    console.error('❌Error:', err);

    if (!err.isOperational) {
        // Unexpected programming or library error
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong on our server',
        });
    }

    // Operational, trusted error
    return res.status(err.statusCode ?? 500).json({
        status: err.status ?? 'error',
        message: err.message,
    });
};
