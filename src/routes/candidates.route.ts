import express from 'express';
import { validateRequest } from '@/middlewares/validateRequest';
import { uploadSingle } from '@/middlewares/multer';
import { requireAuth, requireRole } from '@/middlewares/authenticate';
import { CandidatesController } from '@/controllers/candidates.controller';
import { CandidatesService } from '@/services/candidates.service';
import {
    createCandidateSchema,
    getAllCandidateSchema,
} from '@/validators/candidates';

const router = express.Router();
const candidatesService = new CandidatesService();
const candidatesController = new CandidatesController(candidatesService);

router.get(
    '/',
    validateRequest(getAllCandidateSchema),
    candidatesController.getAll,
);
router.get('/:candidateId', candidatesController.getCandidateById);
router.post(
    '/',
    requireAuth,
    requireRole(['admin']),
    uploadSingle('img', 'candidate'),
    validateRequest(createCandidateSchema),
    candidatesController.create,
);
router.delete(
    '/:candidateId',
    requireAuth,
    requireRole(['admin']),
    candidatesController.deleteCandidateById,
);

export default router;
