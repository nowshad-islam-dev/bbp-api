import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ENV from '@/config/env';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';
import { logger } from '@/config/logger';

export interface JwtPayload {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
        }
    }
}

export const requireAuth = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new AppError(
                'No token provided',
                401,
                ErrorCode.UNAUTHORIZED,
            );
        }
        try {
            const decoded = jwt.verify(
                token,
                ENV.ACCESS_TOKEN_SECRET,
            ) as JwtPayload;
            req.user = decoded;
            next();
        } catch (error) {
            logger.warn({
                message: 'Invalid token',
                context: 'AuthMiddleware.requireAuth',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw new AppError(
                'Unauthorized - Invalid token',
                401,
                ErrorCode.INVALID_TOKEN,
            );
        }
    } catch (error) {
        next(error);
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user?.role || !roles.includes(req.user.role)) {
                logger.warn({
                    message: 'Insufficient permissions',
                    context: 'AuthMiddleware.requireRole',
                    requiredRoles: roles,
                    userRole: req.user?.role,
                    userId: req.user?.userId,
                });
                throw new AppError(
                    'Forbidden - Insufficient permissions',
                    403,
                    ErrorCode.FORBIDDEN,
                );
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
