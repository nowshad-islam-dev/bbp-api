import express from 'express';
import {
    getAllEvents,
    createEvent,
    deleteEvent,
    getEventById,
} from '../controllers/events';
import { validate } from '../middlewares/validate';
import { EventSchema } from '../types/events';

const router = express.Router();

// GET all events
router.get('/', getAllEvents);

// GET single event
router.get('/:eventId', getEventById);

// POST create event
router.post('/', validate(EventSchema), createEvent);

// DELETE event
router.delete('/:eventId', deleteEvent);

export default router;
