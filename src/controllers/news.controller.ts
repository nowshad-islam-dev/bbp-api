import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { NewsService } from '@/services/news.service';
import { NewsBody } from '@/validators/news';

export class NewsController extends BaseController {
    constructor(private newsService: NewsService) {
        super();
    }

    getAll = (req: Request, _res: Response, _next: NextFunction): void => {
        const { page, pageSize, tag } = req.query as Record<string, string>;
        console.log(req.query);
        this.handleRequest(req, _res, _next, async () => {
            return await this.newsService.getAll(page, pageSize, tag);
        });
    };

    create = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { title, text, tag } = req.body as NewsBody;
            const img = res.locals.fileUrl as string | undefined;
            return await this.newsService.create(title, text, tag, img);
        });
    };

    getNewsById = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { newsId } = req.params;
            return await this.newsService.getNewsById(newsId);
        });
    };

    deleteNewsById = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { newsId } = req.params;
            return await this.newsService.deleteNewsById(newsId);
        });
    };
}
