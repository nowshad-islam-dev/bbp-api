import express from 'express';
import {
    getAllEvents,
    createEvent,
    deleteEvent,
    getEventById,
} from '@/controllers/events';
import { validate } from '@/middlewares/validate';
import { createEventSchema } from '@/types/events';
import { authenticate, isAdmin } from '@/middlewares/authenticate';

const router = express.Router();

// GET all events
router.get('/', getAllEvents);

// GET single event
router.get('/:eventId', getEventById);

// POST create event
router.post(
    '/',
    authenticate,
    isAdmin,
    validate(createEventSchema),
    createEvent,
);

// DELETE event
router.delete('/:eventId', authenticate, isAdmin, deleteEvent);

export default router;
