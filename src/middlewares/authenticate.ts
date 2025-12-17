import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { AuthPayload } from '../types/auth';

export interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

export const authenticate = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('Access token not found', 401);

    try {
        const payload = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!,
        ) as AuthPayload;

        req.user = payload;

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new AppError('TOKEN_EXPIRED', 401);
        }
        throw new AppError('Invalid access token', 401);
    }
};

export const isAdmin = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
) => {
    const user = req.user as AuthPayload;

    if (user.role !== 'admin') {
        throw new AppError('Admin previleges required', 403);
    }
    next();
};
