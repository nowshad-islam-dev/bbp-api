import { RequestHandler } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { comments } from '@/db/schema';
import { AppError } from '@/utils/AppError';
import { sendResponse } from '@/utils/sendResponse';
import { AuthRequest } from '@/middlewares/authenticate';
import { CommentInput } from '@/types/comments';
import { selectCommentSchema } from '@/types';

export const getAllComments: RequestHandler = async (_req, res) => {
    const result = await db
        .select({
            id: comments.id,
            newsId: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
        })
        .from(comments);

    return sendResponse({
        res,
        statusCode: 200,
        data: result,
        message: 'Comments fetched',
    });
};

export const createComment: RequestHandler = async (req: AuthRequest, res) => {
    const { newsId } = req.params;
    const { id } = req.user!;
    const { content } = req.body as CommentInput;

    const [result] = await db
        .insert(comments)
        .values({ content, newsId: Number(newsId), userId: id })
        .$returningId();

    const newCommentId = result?.id;
    if (!newCommentId) {
        throw new AppError('Error creating comment', 500);
    }

    const [created] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, newCommentId));

    return sendResponse({
        res,
        statusCode: 201,
        data: created,
        message: 'Comment created',
    });
};

export const getCommentById: RequestHandler = async (req: AuthRequest, res) => {
    const { commentId } = req.params;
    const { id } = req.user!;

    const result = await db
        .select()
        .from(comments)
        .where(
            and(eq(comments.id, parseInt(commentId)), eq(comments.userId, id)),
        );

    if (result.length === 0) {
        throw new AppError('Comment not found', 404);
    }

    const resResult = selectCommentSchema.parse(result[0]);

    return sendResponse({
        res,
        statusCode: 200,
        data: resResult,
        message: 'Comment fetched',
    });
};

export const getCommentsByNewsId: RequestHandler = async (req, res) => {
    const { newsId } = req.params;

    const result = await db
        .select()
        .from(comments)
        .where(eq(comments.newsId, parseInt(newsId)));

    const resResult = selectCommentSchema.parse(result);

    return sendResponse({
        res,
        statusCode: 200,
        data: resResult,
        message: 'News comments fetched',
    });
};

export const deleteComment: RequestHandler = async (req: AuthRequest, res) => {
    const { commentId } = req.params;
    const { id } = req.user!;

    const result = await db
        .delete(comments)
        .where(
            and(eq(comments.id, parseInt(commentId)), eq(comments.userId, id)),
        );

    if (result[0].affectedRows === 0) {
        throw new AppError('News not found', 404);
    }

    return sendResponse({
        res,
        statusCode: 200,
        message: 'Comment deleted',
    });
};
