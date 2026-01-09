import * as z from 'zod';
import { insertCommentSchema } from '.';

export const createCommentSchema = insertCommentSchema
    .pick({
        content: true,
    })
    .extend({
        content: z
            .string()
            .min(1, { error: 'Comment must have at least one character' }),
    });

export type CommentInput = z.infer<typeof createCommentSchema>;
