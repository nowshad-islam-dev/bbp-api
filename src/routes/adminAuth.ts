import express from 'express';
import { adminLogin, createAdmin } from '../controllers/adminAuth';
import { authenticate, isAdmin } from '../middlewares/authenticate';
import { refreshToken, logout } from '../controllers/auth';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/create', authenticate, isAdmin, createAdmin);
router.get('/refresh-token', refreshToken);
router.get('/logout', logout);

export default router;
