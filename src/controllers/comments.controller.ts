import { Request, Response, NextFunction } from 'express';
import { CommentService } from '@/services/comments.service';
import { BaseController } from './base.controller';
import { CommentBody } from '@/validators/comments';

export class CommentController extends BaseController {
    constructor(private commentService: CommentService) {
        super();
    }

    getAll = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.commentService.getAll();
        });
    };

    create = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { content } = req.body as CommentBody;
            const { userId } = req.user;
            const { newsId } = req.params;
            return await this.commentService.create(content, newsId, userId);
        });
    };

    getCommentByIdAndUserId = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req.user;
            const { commentId } = req.params;
            return await this.commentService.getCommentByIdAndUserId(
                commentId,
                userId,
            );
        });
    };

    getCommentsByNewsId = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { newsId } = req.params;
            return await this.commentService.getCommentsByNewsId(newsId);
        });
    };

    deleteUserCommentById = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req.user;
            const { commentId } = req.params;
            return await this.commentService.deleteUserCommentById(
                commentId,
                userId,
            );
        });
    };
}
