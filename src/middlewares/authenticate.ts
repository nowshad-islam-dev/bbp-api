import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { AuthPayload } from '../types/auth';

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('Not authorized', 401);

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as AuthPayload;

        res.locals.user = payload;

        next();
    } catch {
        throw new AppError('Authorization required', 401);
    }
};

export const isAdmin = (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as AuthPayload;

    if (user.role !== 'admin') {
        throw new AppError('Admin previleges required', 403);
    }
    next();
};
