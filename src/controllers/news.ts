import { RequestHandler } from 'express';
import { db } from '../db';
import { news } from '../db/schema';
import { NewsInput } from '../types/news';
import { AppError } from '../utils/AppError';
import { eq } from 'drizzle-orm';

export const getAllNews: RequestHandler = async (_req, res) => {
    const result = await db.select().from(news);
    res.status(200).json({ status: 'success', data: result });
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

    const created = await db.select().from(news).where(eq(news.id, newNewsId));
    res.status(201).json({ status: 'success', data: created });
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

    res.status(200).json({ status: 'success', data: result[0] });
};

export const deleteNews: RequestHandler = async (req, res) => {
    const { newsId } = req.params;

    const result = await db.delete(news).where(eq(news.id, parseInt(newsId)));

    if (result[0].affectedRows === 0) {
        throw new AppError('News not found', 404);
    }

    res.status(200).json({ status: 'success', message: 'News deleted' });
};
