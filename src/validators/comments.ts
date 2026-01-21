import * as z from 'zod';
import { insertCommentSchema } from '.';

export const createCommentSchema = z.object({
    body: insertCommentSchema.extend({
        content: z.string().min(1),
    }),
});

export interface CommentBody {
    content: string;
}
