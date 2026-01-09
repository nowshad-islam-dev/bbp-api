import express from 'express';
import { validate } from '@/middlewares/validate';
import { authenticate, AuthRequest, isAdmin } from '@/middlewares/authenticate';
import {
    allUsers,
    login,
    logout,
    refreshToken,
    register,
} from '@/controllers/auth';
import { LoginSchema, createUserSchema } from '@/types/auth';
import { uploadSingle } from '@/middlewares/multer';

const router = express.Router();

router.post('/login', validate(LoginSchema), login);
router.post('/register', validate(createUserSchema), register);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/users', authenticate, isAdmin, allUsers);

// For dev-testing only
router.get('/me', authenticate, (req: AuthRequest, res) => {
    return res.status(200).json(req.user);
});

router.post('/upload', uploadSingle('image', 'news'), (_req, res) => {
    console.log(res.locals.fileUrl);
});

export default router;
