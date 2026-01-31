import { ApiResponse } from '@/utils/apiResponse';
import { NextFunction, Request, Response } from 'express';

export abstract class BaseController {
    protected async handleRequest(
        _req: Request,
        res: Response,
        next: NextFunction,
        action: () => Promise<any>,
    ) {
        try {
            const { result, meta } = await action();
            ApiResponse.success(res, result, meta);
        } catch (err) {
            next(err);
        }
    }
}
