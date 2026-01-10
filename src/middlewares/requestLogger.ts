import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        logger.info('HTTP request', {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: duration,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    });

    next();
}
