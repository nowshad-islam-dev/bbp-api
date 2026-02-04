import * as z from 'zod';
import { insertEventSchema } from '.';

export const createEventSchema = z.object({
    body: insertEventSchema.extend({
        title: z.string().min(6).max(60),
        excerpt: z.string().min(12).max(80),
        text: z.string().min(20).max(2000),
        date: z
            .string()
            .min(1)
            .transform((v) => new Date(v)),
    }),
});

export interface EventBody {
    title: string;
    excerpt: string;
    text: string;
    date: Date;
}
