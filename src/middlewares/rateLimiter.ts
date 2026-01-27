import { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests per 15 min
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, _res) => {
        return req.user ? req.user.userId : ipKeyGenerator(req.ip!);
    },
    skip: (req) => {
        return Boolean(
            req.path.startsWith('/monitoring') || // TODO: Skip all monitoring endpoints for now
                req.headers['user-agent']?.includes('Prometheus'),
        );
    },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 10 requests per window
    standardHeaders: true,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    keyGenerator: (req: Request) =>
        ipKeyGenerator(req.ip!) || (req.headers['x-forwarded-for'] as string),
    skipSuccessfulRequests: true, // Only count failed requests
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.',
    },
});

export const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        success: false,
        message: 'Too many verification attempts, please try again later',
    },
});
