import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { UserService } from '@/services/users.service';

export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super();
    }

    getAll = (req: Request, res: Response, next: NextFunction): void => {
        const { page, pageSize, role } = req.query as Record<string, string>;
        this.handleRequest(req, res, next, async () => {
            return await this.userService.getAll(page, pageSize, role);
        });
    };

    deleteUser = (req: Request, res: Response, next: NextFunction): void => {
        const { password } = req.body as Record<string, string>;
        const { userId } = req.user;
        this.handleRequest(req, res, next, async () => {
            return await this.userService.deleteUser(userId, password);
        });
    };
}
