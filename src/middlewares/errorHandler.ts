import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/appError';
import { ApiResponse } from '@/utils/apiResponse';
// import { logger } from '@/config/logger';

export const errorHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    // logger.error({
    //     message: error.message,
    //     stack: error.stack,
    //     context: 'ErrorHandler',
    // });
    console.log(error);

    const statusCode = error instanceof AppError ? error.statusCode : 500;
    // const route = req.route?.path || req.path || '/unknown';

    if (error instanceof AppError) {
        ApiResponse.error(res, error.message, statusCode);
        return;
    }

    ApiResponse.error(res, 'Internal server error', 500);
};
