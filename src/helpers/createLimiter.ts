import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import redisClient from '@/redis';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';

export const createLimiter = (
    keyPrefix: string, // has to be unique for each limiter
    points: number,
    duration: number,
    blockDuration: number,
) => {
    const limiter = new RateLimiterRedis({
        storeClient: redisClient,
        useRedisPackage: true,
        keyPrefix,
        points,
        duration,
        blockDuration,
    });
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ip } = req;
            if (!ip) {
                throw new AppError(
                    'Client could not be identified by ip',
                    400,
                    ErrorCode.INVALID_REQUEST,
                );
            }
            await limiter.consume(req.ip!);
            next();
        } catch {
            res.status(429).json({
                status: 'error',
                message: 'Too many requests, please try again later.',
            });
        }
    };
};
