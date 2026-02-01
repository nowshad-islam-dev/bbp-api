import * as z from 'zod';
import { insertNewsSchema } from '.';

export const createNewsSchema = z.object({
    body: insertNewsSchema.extend({
        title: z.string().min(6).max(60),
        text: z.string().min(20).max(2000),
    }),
});

export const getAllNewsSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(20),
        tag: z.string().optional(),
    }),
});

export interface NewsBody {
    title: string;
    text: string;
    tag?: string;
}
