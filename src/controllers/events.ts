import { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';
import { events } from '../db/schema';
import { db } from '../db';
import { AppError } from '../utils/AppError';
import { EventInput } from '../types/events';

export const getAllEvents: RequestHandler = async (_req, res) => {
    const result = await db.select().from(events);
    res.status(200).json({ status: 'success', data: result });
};

export const createEvent: RequestHandler = async (req, res) => {
    const { title, excerpt, text, date } = req.body as EventInput;

    const newEvent = { title, excerpt, text, date };

    const [result] = await db.insert(events).values(newEvent).$returningId();

    const newEventId = result?.id;
    if (!newEventId) {
        throw new AppError('Error creating event', 500);
    }

    const created = await db
        .select()
        .from(events)
        .where(eq(events.id, newEventId));
    res.status(201).json({ status: 'success', data: created });
};

export const getEventById: RequestHandler = async (req, res) => {
    const { eventId } = req.params;

    const result = await db
        .select()
        .from(events)
        .where(eq(events.id, parseInt(eventId)));

    if (result.length === 0) {
        throw new AppError('Event not found', 404);
    }

    res.status(200).json({ status: 'success', data: result[0] });
};

export const deleteEvent: RequestHandler = async (req, res) => {
    const { eventId } = req.params;

    const result = await db
        .delete(events)
        .where(eq(events.id, parseInt(eventId)));

    if (result[0].affectedRows === 0) {
        throw new AppError('Event not found', 404);
    }

    res.status(200).json({ status: 'success', message: 'Event deleted' });
};
