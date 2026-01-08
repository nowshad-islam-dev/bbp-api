import * as z from 'zod';

export const CommentSchema = z.object({
    content: z
        .string()
        .min(1, { error: 'Comment must have at least one character' }),
});

export type CommentInput = z.infer<typeof CommentSchema>;
