import { Response, Request, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { CandidatesService } from '@/services/candidates.service';
import { CandidateBody } from '@/validators/candidates';

export class CandidatesController extends BaseController {
    constructor(private candidatesService: CandidatesService) {
        super();
    }

    getAll = (req: Request, res: Response, next: NextFunction): void => {
        const { cursor, pageSize } = req.query as Record<string, string>;
        this.handleRequest(req, res, next, async () => {
            return await this.candidatesService.getAll(cursor, pageSize);
        });
    };

    create = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { name, shortIntro, gender, vicinity, topicsBrought } =
                req.body as CandidateBody;
            const img = res.locals.fileUrl as string | undefined;

            return await this.candidatesService.create(
                name,
                shortIntro,
                vicinity,
                topicsBrought,
                gender,
                img,
            );
        });
    };

    getCandidateById = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { candidateId } = req.params;
            return await this.candidatesService.getCandidateById(candidateId);
        });
    };

    deleteCandidateById = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { candidateId } = req.params;
            return await this.candidatesService.deleteCandidateById(
                candidateId,
            );
        });
    };
}
