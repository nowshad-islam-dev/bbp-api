import express from 'express';
import { requireAuth, requireRole } from '@/middlewares/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import { createCommentSchema } from '@/validators/comments';
import { CommentService } from '@/services/comments.service';
import { CommentController } from '@/controllers/comments.controller';

const router = express.Router();
const commentService = new CommentService();
const commentController = new CommentController(commentService);

router.get('/', requireAuth, requireRole(['admin']), commentController.getAll);
router.get(
    '/:commentId',
    requireAuth,
    commentController.getCommentByIdAndUserId,
);
// GET comments for news
router.get('/comments-on-news/:newsId', commentController.getCommentsByNewsId);
router.post(
    '/:newsId',
    requireAuth,
    validateRequest(createCommentSchema),
    commentController.create,
);
router.delete(
    '/:commentId',
    requireAuth,
    requireRole(['user']),
    commentController.deleteUserCommentById,
);

export default router;
