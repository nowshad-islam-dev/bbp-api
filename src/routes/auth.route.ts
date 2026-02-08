import express from 'express';
import { validateRequest } from '@/middlewares/validateRequest';
import { requireAuth, requireRole } from '@/middlewares/authenticate';
import { AuthController } from '@/controllers/auth.controller';
import { uploadSingle } from '@/middlewares/multer';
import { createLimiter } from '@/helpers/createLimiter';
import {
    createUserSchema,
    verifyEmailSchema,
    loginSchema,
    resendVerificationSchema,
} from '@/validators/auth';
import { AuthService } from '@/services/auth.service';

const router = express.Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post(
    '/login',
    createLimiter('loginLimiter', 5, 3600, 3600),
    validateRequest(loginSchema),
    authController.login,
);
router.post(
    '/signup',
    validateRequest(createUserSchema),
    authController.signup,
);
router.get(
    '/verify-email',
    createLimiter('emailVerificationLimiter', 3, 3600, 24 * 3600), // 3 requests per hour - block for 1 day
    validateRequest(verifyEmailSchema),
    authController.verifyEmail,
);

router.post(
    '/resend-verification-email',
    createLimiter('resendEmailVerificationLimiter', 5, 3600, 24 * 3600), // 5 requests per hour - block for 1 day
    validateRequest(resendVerificationSchema),
    authController.resendVerification,
);

router.post('/refresh-token', authController.refreshUserToken);
router.post('/logout', requireAuth, authController.logout);

// Admin routes
router.post(
    '/admin/login',
    createLimiter('adminLoginLimiter', 5, 3600, 3600),
    validateRequest(loginSchema),
    authController.adminLogin,
);
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
