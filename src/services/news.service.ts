import { eq, count, desc } from 'drizzle-orm';
import { db } from '@/db';
import { news, tags, newsToTags } from '@/db/schema';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';
import { selectNewsSchema } from '@/validators';

export class NewsService {
    async getAll(page = '1', pageSize = '20', tag = 'all') {
        const safePageSize = Math.min(Math.max(parseInt(pageSize), 1), 20);
        const safePage = Math.max(parseInt(page), 1);
        const offset = (safePage - 1) * safePageSize;

        // A news should have tag "all" if any other tag
        // is not explicitly provided
        const filter = tag !== 'all' ? eq(tags.name, tag) : undefined;

        // Count query
        const [totalResult] = await db
            .select({ value: count() })
            .from(news)
            .innerJoin(newsToTags, eq(news.id, newsToTags.newsId))
            .innerJoin(tags, eq(newsToTags.tagId, tags.id))
            .where(filter);

        const totalItems = Number(totalResult.value);

        // Paginated data query
        const result = await db
            .select({
                id: news.id,
                title: news.title,
                text: news.text,
                tagName: tags.name,
                img: news.img,
                createdAt: news.createdAt,
            })
            .from(news)
            .innerJoin(newsToTags, eq(news.id, newsToTags.newsId))
            .innerJoin(tags, eq(newsToTags.tagId, tags.id))
            .where(filter)
            .orderBy(news.id)
            .limit(safePageSize)
            .offset(offset);

        const totalPages = Math.ceil(totalItems / safePageSize);

        return {
            result,
            meta: {
                page: safePage,
                pageSize: safePageSize,
                totalItems,
                totalPages,
                hasNextPage: safePage < totalPages,
                hasPrevPage: safePage > 1,
            },
        };
    }

    async create(
        title: string,
        text: string,
        tag: string = 'all',
        img?: string,
    ) {
        const createdNews = await db.transaction(async (tx) => {
            const [insertedNews] = await tx
                .insert(news)
                .values({ title, text, img })
                .$returningId();

            const newsId = insertedNews.id;

            const [existingTag] = await tx
                .select({ id: tags.id })
                .from(tags)
                .where(eq(tags.name, tag));

            if (!existingTag) {
                throw new AppError(
                    'Provided tag does not exist',
                    404,
                    ErrorCode.NOT_FOUND,
                );
            }

            // Link existing tag
            await tx
                .insert(newsToTags)
                .values({ newsId, tagId: existingTag.id });

            const [record] = await tx
                .select()
                .from(news)
                .where(eq(news.id, newsId));

            return record;
        });

        // 3. Parse and return
        const parsedNews = selectNewsSchema.parse(createdNews);
        return { result: parsedNews };
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
        return { result: parsedNews };
    }

    async getLatestNews() {
        const result = await db
            .select()
            .from(news)
            .orderBy(desc(news.createdAt))
            .limit(20);

        return { result };
    }

    async deleteNewsById(newsId: string) {
        const [result] = await db
            .delete(news)
            .where(eq(news.id, parseInt(newsId)));

        if (result.affectedRows === 0) {
            throw new AppError('News not found', 404, ErrorCode.NOT_FOUND);
        }
        return { result: null };
    }
}
