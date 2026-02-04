import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}

export const requestId = (req: Request, res: Response, next: NextFunction) => {
    req.requestId = (req.headers['x-request-id'] as string) ?? uuid();
    res.setHeader('X-Request-Id', req.requestId);
    next();
};
