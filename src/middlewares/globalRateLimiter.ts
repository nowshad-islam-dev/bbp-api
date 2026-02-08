import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import redisClient from '@/redis';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';

const opts = {
    storeClient: redisClient,
    useRedisPackage: true,
    keyPrefix: 'rl_middleware',
    points: 5,
    duration: 1,
    blockDuration: 10,
};

const rateLimiterRedis = new RateLimiterRedis(opts);

export const rateLimiterMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const key = req.user ? String(req.user.userId) : req.ip;
    if (!key) {
        throw new AppError(
            'Client could not be identified by ip or other means',
            400,
            ErrorCode.INVALID_REQUEST,
        );
    }

    try {
        const rlRes = await rateLimiterRedis.consume(key);
        // Success headers
        res.set({
            'RateLimit-Limit': String(opts.points),
            'RateLimit-Remaining': String(rlRes.remainingPoints),
            'RateLimit-Reset': new Date(
                Date.now() + rlRes.msBeforeNext,
            ).toISOString(),
        });
        next();
    } catch (rej) {
        // If it's a RateLimiterRes, they are actually rate limited
        if (rej instanceof RateLimiterRes) {
            const secs = Math.round(rej.msBeforeNext / 1000) || 1;
            res.set({
                'Retry-After': String(secs),
                'RateLimit-Limit': String(opts.points),
                'RateLimit-Remaining': '0',
                'RateLimit-Reset': new Date(
                    Date.now() + rej.msBeforeNext,
                ).toISOString(),
            });

            res.status(429).json({
                status: 'error',
                message: 'Too many requests, please try again later.',
                retryAfter: `${secs}s`,
            });
        } else {
            // Redis connection error
            // rej is an error at this point
            next(rej);
        }
    }
};
