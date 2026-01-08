import { Response } from 'express';

export function sendError(
    res: Response,
    statusCode: number,
    message: string,
    code?: string,
    details?: unknown,
) {
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error: {
            code,
            details,
        },
        meta: {
            timestamp: new Date().toISOString(),
        },
    });
}
