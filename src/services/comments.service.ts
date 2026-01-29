import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { comments } from '@/db/schema';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';
import { selectCommentSchema } from '@/validators';

export class CommentService {
    async getAll() {
        const result = await db
            .select({
                id: comments.id,
                newsId: comments.id,
                content: comments.content,
                createdAt: comments.createdAt,
            })
            .from(comments);

        return result;
    }

    async create(content: string, newsId: string, userId: string) {
        const [result] = await db
            .insert(comments)
            .values({
                newsId: parseInt(newsId),
                userId: parseInt(userId),
                content,
            })
            .$returningId();

        const [created] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, result.id));

        const parsedComment = selectCommentSchema.parse(created);
        return parsedComment;
    }

    async getCommentByIdAndUserId(commentId: string, userId: string) {
        const [result] = await db
            .select()
            .from(comments)
            .where(
                and(
                    eq(comments.id, parseInt(commentId)), // TODO: Ensure proper indexing for this query
                    eq(comments.userId, parseInt(userId)),
                ),
            );

        if (!result) {
            throw new AppError('Comment not found', 404, ErrorCode.NOT_FOUND);
        }

        const parsedComment = selectCommentSchema.parse(result);
        return parsedComment;
    }

    async getCommentsByNewsId(newsId: string) {
        const result = await db
            .select({
                id: comments.id,
                newsId: comments.newsId,
                content: comments.content,
                createdAt: comments.createdAt,
            })
            .from(comments)
            .where(eq(comments.newsId, parseInt(newsId)));

        return result;
    }

    async deleteUserCommentById(commentId: string, userId: string) {
        const result = await db
            .delete(comments)
            .where(
                and(
                    eq(comments.id, parseInt(commentId)),
                    eq(comments.userId, parseInt(userId)),
                ),
            );

        if (result[0].affectedRows === 0) {
            throw new AppError('Comment not found', 404, ErrorCode.NOT_FOUND);
        }
    }
}
