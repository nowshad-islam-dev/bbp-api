import { Request, Response } from 'express';
import { ApiResponse } from '@/utils/apiResponse';

export const notFoundHandler = (_req: Request, res: Response) => {
    ApiResponse.error(res, '🔍 Ooops! Looks like you are lost!', 404);
};
