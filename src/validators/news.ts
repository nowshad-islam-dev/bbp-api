import * as z from 'zod';
import { insertNewsSchema } from '.';

export const createNewsSchema = z.object({
    body: insertNewsSchema.extend({
        title: z.string().min(6).max(60),
        text: z.string().min(20).max(2000),
    }),
});

export interface NewsBody {
    title: string;
    text: string;
}
