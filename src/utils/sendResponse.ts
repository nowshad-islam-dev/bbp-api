import { Response } from 'express';

interface SendResponseParams<T> {
    res: Response;
    statusCode?: number;
    message?: string;
    data?: T | null;
    meta?: Record<string, unknown>;
}

export function sendResponse<T>({
    res,
    statusCode = 200,
    message = 'Success',
    data = null,
    meta = {},
}: SendResponseParams<T>) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta: {
            timeStamp: new Date().toISOString(),
            ...meta,
        },
    });
}
