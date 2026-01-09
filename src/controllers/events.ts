import { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';
import { events } from '@/db/schema';
import { db } from '@/db';
import { AppError } from '@/utils/AppError';
import { sendResponse } from '@/utils/sendResponse';
import { EventInput } from '@/types/events';
import { selectEventSchema } from '@/types';

export const getAllEvents: RequestHandler = async (_req, res) => {
    const result = await db.select().from(events);

    return sendResponse({
        res,
        statusCode: 200,
        message: 'Events fetched',
        data: result,
    });
};

export const createEvent: RequestHandler = async (req, res) => {
    const { title, excerpt, text, date } = req.body as EventInput;

    const newEvent = { title, excerpt, text, date };

    const [result] = await db.insert(events).values(newEvent).$returningId();

    const newEventId = result?.id;
    if (!newEventId) {
        throw new AppError('Error creating event', 500);
    }

    const [created] = await db
        .select()
        .from(events)
        .where(eq(events.id, newEventId));

    const resResult = selectEventSchema.parse(created);

    return sendResponse({
        res,
        statusCode: 201,
        message: 'Event created',
        data: resResult,
    });
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

    const resResult = selectEventSchema.parse(result[0]);

    return sendResponse({
        res,
        statusCode: 200,
        data: resResult,
        message: 'News deleted',
    });
};

export const deleteEvent: RequestHandler = async (req, res) => {
    const { eventId } = req.params;

    const result = await db
        .delete(events)
        .where(eq(events.id, parseInt(eventId)));

    if (result[0].affectedRows === 0) {
        throw new AppError('Event not found', 404);
    }

    return sendResponse({
        res,
        statusCode: 200,
        message: 'Event deleted',
    });
};
