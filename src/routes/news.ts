import express from 'express';
import { createNews, getAllNews } from '../controllers/news';
import { validate } from '../middlewares/validate';
import { NewsSchema } from '../types/news';
import { uploadSingle } from '../middlewares/multer';
// import { authenticate, isAdmin } from '../middlewares/authenticate';

const router = express.Router();

router.get('/', getAllNews);
router.post(
    '/create',
    uploadSingle('img', 'news'),
    validate(NewsSchema),
    createNews,
);

export default router;
