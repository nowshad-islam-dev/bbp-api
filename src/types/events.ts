import * as z from 'zod';

export const EventSchema = z.object({
    title: z
        .string()
        .min(6, { error: 'Event title must be at least 6 chars long' })
        .max(60, { error: 'Event title cannot be more than 60 chars long' }),
    excerpt: z
        .string()
        .min(12, { error: 'Event excerpt must be at least 6 chars long' })
        .max(80, { error: 'Event excerpt cannot be more than 80 chars long' }),
    text: z
        .string()
        .min(20, { error: 'Event text must be at least 20 chars long' })
        .max(2000, { error: 'Event text cannot be more than 2000 chars long' }),

    date: z
        .string()
        .min(1, { error: 'Event date & time is required' })
        .transform((v) => new Date(v)),
});

export type EventInput = z.infer<typeof EventSchema>;
