import express from 'express';
import {
    createNews,
    getAllNews,
    getNewsById,
    deleteNews,
} from '../controllers/news';
import { validate } from '../middlewares/validate';
import { NewsSchema } from '../types/news';
import { uploadSingle } from '../middlewares/multer';
// import { authenticate, isAdmin } from '../middlewares/authenticate';

const router = express.Router();

// GET all news
router.get('/', getAllNews);

// GET single news
router.get('/:newsId', getNewsById);

// POST create news
router.post('/', uploadSingle('img', 'news'), validate(NewsSchema), createNews);

// DELETE news
router.delete('/:newsId', deleteNews);

export default router;
