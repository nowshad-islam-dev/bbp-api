import express from 'express';
import { NewsController } from '@/controllers/news.controller';
import { NewsService } from '@/services/news.service';
import { validateRequest } from '@/middlewares/validateRequest';
import { uploadSingle } from '@/middlewares/multer';
import { requireAuth, requireRole } from '@/middlewares/authenticate';
import { createNewsSchema, getAllNewsSchema } from '@/validators/news';

const router = express.Router();
const newsService = new NewsService();
const newsController = new NewsController(newsService);

router.get('/', validateRequest(getAllNewsSchema), newsController.getAll);
router.get('/:newsId', newsController.getNewsById);
router.post(
    '/',
    requireAuth,
    requireRole(['admin']),
    uploadSingle('img', 'news'),
    validateRequest(createNewsSchema),
    newsController.create,
);
router.delete(
    '/:newsId',
    requireAuth,
    requireRole(['admin']),
    newsController.deleteNewsById,
);

export default router;
