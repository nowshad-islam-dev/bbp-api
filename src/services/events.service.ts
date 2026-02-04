import { eq } from 'drizzle-orm';
import { events } from '@/db/schema';
import { db } from '@/db';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';
import { selectEventSchema } from '@/validators';

export class EventService {
    async getAll() {
        const result = await db.select().from(events);
        return { result };
    }

    async create(title: string, excerpt: string, text: string, date: Date) {
        const newEvent = { title, excerpt, text, date: new Date(date) };

        const [result] = await db
            .insert(events)
            .values(newEvent)
            .$returningId();

        const [created] = await db
            .select()
            .from(events)
            .where(eq(events.id, result.id));

        const parsedEvent = selectEventSchema.parse(created);
        return { result: parsedEvent };
    }

    async getEventById(eventId: string) {
        const [result] = await db
            .select()
            .from(events)
            .where(eq(events.id, parseInt(eventId)));

        if (!result) {
            throw new AppError('Event not found', 404, ErrorCode.NOT_FOUND);
        }

        const parsedEvent = selectEventSchema.parse(result);
        return { result: parsedEvent };
    }

    async deleteEventById(eventId: string) {
        const [result] = await db
            .delete(events)
            .where(eq(events.id, parseInt(eventId)));

        if (result.affectedRows === 0) {
            throw new AppError('Event not found', 404, ErrorCode.NOT_FOUND);
        }
        return { result: null };
    }
}
