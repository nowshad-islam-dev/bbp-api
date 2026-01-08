import express from 'express';
import {
    getAllComments,
    createComment,
    deleteComment,
    getCommentById,
} from '@/controllers/comments';
import { authenticate, isAdmin } from '@/middlewares/authenticate';

const router = express.Router();

// GET all comments
router.get('/', authenticate, isAdmin, getAllComments);

// GET single comment
router.get('/:commentId', authenticate, isAdmin, getCommentById);

// POST create comment
router.post('/:newsId', authenticate, createComment);

// DELETE comment
router.delete('/:commentId', authenticate, deleteComment);

export default router;
