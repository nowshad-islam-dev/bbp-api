import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { news } from '@/db/schema';
import { AppError } from '@/utils/appError';
import { selectNewsSchema } from '@/validators';
import { ErrorCode } from '@/utils/errorCode';

export class NewsService {
    async getAll() {
        const result = await db
            .select({
                id: news.id,
                title: news.title,
                text: news.text,
                img: news.img,
                createdAt: news.createdAt,
            })
            .from(news);

        return result;
    }

    async create(title: string, text: string, img?: string) {
        const newNews = { title, text, img };
        const [result] = await db.insert(news).values(newNews).$returningId();

        const [created] = await db
            .select()
            .from(news)
            .where(eq(news.id, result.id));

        const parsedNews = selectNewsSchema.parse(created);
        return parsedNews;
    }

    async getNewsById(newsId: string) {
        const [result] = await db
            .select()
            .from(news)
            .where(eq(news.id, parseInt(newsId)));

        if (!result) {
            throw new AppError('News not found', 404, ErrorCode.NOT_FOUND);
        }

        const parsedNews = selectNewsSchema.parse(result);
        return parsedNews;
    }

    async deleteNewsById(newsId: string) {
        const [result] = await db
            .delete(news)
            .where(eq(news.id, parseInt(newsId)));

        if (result.affectedRows === 0) {
            throw new AppError('News not found', 404, ErrorCode.NOT_FOUND);
        }
        return null;
    }
}
