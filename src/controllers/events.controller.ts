import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { EventService } from '@/services/events.service';
import { EventBody } from '@/validators/events';

export class EventController extends BaseController {
    constructor(private eventService: EventService) {
        super();
    }

    getAll = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.eventService.getAll();
        });
    };

    create = (req: Request, res: Response, next: NextFunction): void => {
        const { title, excerpt, text, date } = req.body as EventBody;
        this.handleRequest(req, res, next, async () => {
            return await this.eventService.create(title, excerpt, text, date);
        });
    };

    getEventById = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { eventId } = req.params;
            return await this.eventService.getEventById(eventId);
        });
    };

    deleteEventById = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { eventId } = req.params;
            return await this.eventService.deleteEventById(eventId);
        });
    };
}
