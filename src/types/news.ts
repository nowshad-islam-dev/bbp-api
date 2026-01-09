import * as z from 'zod';
import { insertNewsSchema } from '.';

export const createNewsSchema = insertNewsSchema
    .pick({
        title: true,
        text: true,
    })
    .extend({
        title: z
            .string()
            .min(6, { error: 'News title must be at least 6 chars long' })
            .max(60, { error: 'News title cannot be more than 60 chars long' }),
        text: z
            .string()
            .min(20, { error: 'News text must be at least 20 chars long' })
            .max(2000, {
                error: 'News text cannot be more than 2000 chars long',
            }),
    });

export type NewsInput = z.infer<typeof createNewsSchema>;
