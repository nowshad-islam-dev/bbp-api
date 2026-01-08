import { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { news } from '@/db/schema';
import type { NewsInput } from '@/types/news';
import { AppError } from '@/utils/AppError';
import { sendResponse } from '@/utils/sendResponse';

export const getAllNews: RequestHandler = async (_req, res) => {
    const result = await db.select().from(news);

    return sendResponse({
        res,
        statusCode: 200,
        message: 'News fetched',
        data: result,
    });
};

export const createNews: RequestHandler = async (req, res) => {
    const { title, text } = req.body as NewsInput;

    const newNews: NewsInput & { img?: string } = { title, text };
    if (res.locals.fileUrl) {
        newNews.img = res.locals.fileUrl as string;
    }

    const [result] = await db.insert(news).values(newNews).$returningId();

    const newNewsId = result?.id;
    if (!newNewsId) {
        throw new AppError('Error creating news', 500);
    }

    const [created] = await db
        .select()
        .from(news)
        .where(eq(news.id, newNewsId));

    return sendResponse({
        res,
        statusCode: 201,
        message: 'News created',
        data: created,
    });
};

export const getNewsById: RequestHandler = async (req, res) => {
    const { newsId } = req.params;

    const result = await db
        .select()
        .from(news)
        .where(eq(news.id, parseInt(newsId)));

    if (result.length === 0) {
        throw new AppError('News not found', 404);
    }

    return sendResponse({
        res,
        statusCode: 200,
        message: 'News fetched',
        data: result[0],
    });
};

export const deleteNews: RequestHandler = async (req, res) => {
    const { newsId } = req.params;

    const result = await db.delete(news).where(eq(news.id, parseInt(newsId)));

    if (result[0].affectedRows === 0) {
        throw new AppError('News not found', 404);
    }

    return sendResponse({
        res,
        statusCode: 200,
        message: 'News deleted',
    });
};
