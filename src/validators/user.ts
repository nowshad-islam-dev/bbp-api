import * as z from 'zod';

export const getAllUsersSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(50),
        role: z.string().optional(),
    }),
});
