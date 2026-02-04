import express from 'express';
import { validateRequest } from '@/middlewares/validateRequest';
import { createEventSchema } from '@/validators/events';
import { requireAuth, requireRole } from '@/middlewares/authenticate';
import { EventService } from '@/services/events.service';
import { EventController } from '@/controllers/events.controller';

const router = express.Router();
const eventService = new EventService();
const eventController = new EventController(eventService);

router.get('/', eventController.getAll);
router.get('/:eventId', eventController.getEventById);
router.post(
    '/',
    requireAuth,
    requireRole(['admin']),
    validateRequest(createEventSchema),
    eventController.create,
);
router.delete(
    '/:eventId',
    requireAuth,
    requireRole(['admin']),
    eventController.deleteEventById,
);

export default router;
