import express from 'express';
import { UserController } from '@/controllers/users.controller';
import { requireAuth, requireRole } from '@/middlewares/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import { UserService } from '@/services/users.service';
import { getAllUsersSchema } from '@/validators/user';

const router = express.Router();
const userService = new UserService();
const userController = new UserController(userService);

// Requires login for all routes
router.use(requireAuth);

router.get(
    '/',
    validateRequest(getAllUsersSchema),
    requireRole(['admin']),
    userController.getAll,
);
router.delete('/', requireRole(['user']), userController.deleteUser);

export default router;
