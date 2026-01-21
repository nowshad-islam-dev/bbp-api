import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { NewsService } from '@/services/news.service';
import { NewsBody } from '@/validators/news';

export class NewsController extends BaseController {
    constructor(private newsService: NewsService) {
        super();
    }

    getAll = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.newsService.getAll();
        });
    };

    create = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { title, text } = req.body as NewsBody;
            const img = res.locals.fileUrl as string | undefined;

            return img
                ? await this.newsService.create(title, text, img)
                : await this.newsService.create(title, text);
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
