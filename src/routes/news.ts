import express from 'express';
import {
    createNews,
    getAllNews,
    getNewsById,
    deleteNews,
} from '@/controllers/news';
import { getCommentsByNewsId } from '@/controllers/comments';
import { validate } from '@/middlewares/validate';
import { NewsSchema } from '@/types/news';
import { uploadSingle } from '@/middlewares/multer';
import { authenticate, isAdmin } from '@/middlewares/authenticate';

const router = express.Router();

// GET all news
router.get('/', getAllNews);

// GET single news
router.get('/:newsId', getNewsById);

// GET comments for news
router.get('/:newsId/comments', getCommentsByNewsId);

// POST create news
router.post(
    '/',
    authenticate,
    isAdmin,
    uploadSingle('img', 'news'),
    validate(NewsSchema),
    createNews,
);

// DELETE news
router.delete('/:newsId', authenticate, isAdmin, deleteNews);

export default router;
