import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { zodToAppError } from '../helpers/zodErrorToAppError';

export const validate =
    (schema: ZodSchema) =>
    (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof ZodError) return next(zodToAppError(err));
            next(err);
        }
    };
