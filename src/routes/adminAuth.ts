import express from 'express';
import { adminLogin, createAdmin } from '../controllers/adminAuth';
import { authenticate, isAdmin } from '../middlewares/authenticate';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/create', authenticate, isAdmin, createAdmin);

export default router;
