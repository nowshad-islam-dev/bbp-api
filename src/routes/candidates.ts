import express from 'express';
import { validate } from '@/middlewares/validate';
import {
    getAllCandidates,
    createCandidate,
    getCandidateById,
    deleteCandidate,
} from '@/controllers/candidates';
import { createCandidateSchema } from '@/types/candidates';
import { uploadSingle } from '@/middlewares/multer';
import { authenticate, isAdmin } from '@/middlewares/authenticate';

const router = express.Router();

// GET all candidate
router.get('/', getAllCandidates);

// GET single candidate
router.get('/:candidateId', getCandidateById);

// POST create candidate
router.post(
    '/',
    authenticate,
    isAdmin,
    uploadSingle('img', 'candidate'),
    validate(createCandidateSchema),
    createCandidate,
);

// DELETE Candidate
router.delete('/:candidateId', deleteCandidate);

export default router;
