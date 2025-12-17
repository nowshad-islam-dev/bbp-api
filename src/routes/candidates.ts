import express from 'express';
import { validate } from '../middlewares/validate';
import {
    getAllCandidates,
    createCandidate,
    getCandidateById,
    deleteCandidate,
} from '../controllers/candidates';
import { CandidateSchema } from '../types/candidates';
import { uploadSingle } from '../middlewares/multer';

const router = express.Router();

// GET all candidate
router.get('/', getAllCandidates);

// GET single candidate
router.get('/:candidateId', getCandidateById);

// POST create candidate
router.post(
    '/',
    uploadSingle('img', 'candidate'),
    validate(CandidateSchema),
    createCandidate,
);

// DELETE Candidate
router.delete('/:candidateId', deleteCandidate);

export default router;
