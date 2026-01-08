import { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';
import { candidates } from '@/db/schema';
import { db } from '@/db';
import { AppError } from '@/utils/AppError';
import { sendResponse } from '@/utils/sendResponse';
import { CandidateInput } from '@/types/candidates';

export const getAllCandidates: RequestHandler = async (_req, res) => {
    const result = await db.select().from(candidates);

    return sendResponse({
        res,
        statusCode: 200,
        data: result,
        message: 'Candidates fetched',
    });
};

export const createCandidate: RequestHandler = async (req, res) => {
    const { name, shortIntro, gender, vicinity, topicsBrought } =
        req.body as CandidateInput;

    const newCandidate: CandidateInput & { img?: string } = {
        name,
        shortIntro,
        gender,
        vicinity,
        topicsBrought,
    };

    if (res.locals.fileUrl) {
        newCandidate.img = res.locals.fileUrl as string;
    }

    const [result] = await db
        .insert(candidates)
        .values(newCandidate)
        .$returningId();

    const newCandidateId = result?.id;
    if (!newCandidateId) {
        throw new AppError('Error creating candidate', 500);
    }

    const [created] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, newCandidateId));

    return sendResponse({
        res,
        statusCode: 201,
        data: created,
        message: 'Candidate created',
    });
};

export const getCandidateById: RequestHandler = async (req, res) => {
    const { candidateId } = req.params;

    const result = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, parseInt(candidateId)));

    if (result.length === 0) {
        throw new AppError('Candidate not found', 404);
    }

    return sendResponse({
        res,
        statusCode: 200,
        data: result[0],
        message: 'Candidate fetched',
    });
};

export const deleteCandidate: RequestHandler = async (req, res) => {
    const { candidateId } = req.params;

    const result = await db
        .delete(candidates)
        .where(eq(candidates.id, parseInt(candidateId)));

    if (result[0].affectedRows === 0) {
        throw new AppError('Candidate not found', 404);
    }

    return sendResponse({
        res,
        statusCode: 200,
        message: 'Candidate deleted',
    });
};
