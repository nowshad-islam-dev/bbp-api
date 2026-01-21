import express from 'express';
import { validateRequest } from '@/middlewares/validateRequest';
import { requireAuth, requireRole } from '@/middlewares/authenticate';
import { AuthController } from '@/controllers/auth.controller';
import { uploadSingle } from '@/middlewares/multer';
import { createUserSchema, LoginSchema } from '@/validators/auth';
import { AuthService } from '@/services/auth.service';

const router = express.Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/login', validateRequest(LoginSchema), authController.login);
router.post(
    '/signup',
    validateRequest(createUserSchema),
    authController.signup,
);
router.post('/refresh-token', authController.refreshUserToken);
router.post('/logout', authController.logout);

// Admin routes
router.post('/admin/login', authController.adminLogin);
router.post(
    '/admin/create',
    requireAuth,
    requireRole(['admin']),
    authController.createAdmin,
);

// --->>> For dev-testing only
router.get('/me', requireAuth, (req, res) => {
    return res.status(200).json(req.user);
});

router.post('/upload', uploadSingle('image', 'news'), (_req, res) => {
    console.log(res.locals.fileUrl);
});

export default router;
