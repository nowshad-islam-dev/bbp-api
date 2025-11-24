import express from 'express';
import { validate } from '../middlewares/validate';
import { authenticate, isAdmin } from '../middlewares/authenticate';
import { allUsers, login, register } from '../controllers/auth';
import { LoginSchema, RegisterSchema } from '../types/auth';
import { uploadSingle } from '../middlewares/multer';

const router = express.Router();

router.post('/login', validate(LoginSchema), login);
router.post('/register', validate(RegisterSchema), register);
router.get('/users/all', allUsers);

// For dev-testing only
router.get('/me', authenticate, isAdmin, (_req, res) => {
    return res.status(200).json(res.locals.user);
});

router.post('/upload', uploadSingle('image', 'news'), (_req, res) => {
    console.log(res.locals.fileUrl);
});

export default router;
