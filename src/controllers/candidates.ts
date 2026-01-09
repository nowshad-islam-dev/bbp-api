import { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';
import { candidates } from '@/db/schema';
import { db } from '@/db';
import { AppError } from '@/utils/AppError';
import { sendResponse } from '@/utils/sendResponse';
import { CandidateInput } from '@/types/candidates';
import { selectCandidateSchema } from '@/types';

export const getAllCandidates: RequestHandler = async (_req, res) => {
    const result = await db
        .select({
            id: candidates.id,
            name: candidates.name,
            shortIntro: candidates.shortIntro,
            vicinity: candidates.vicinity,
            topicsBrought: candidates.topicsBrought,
            img: candidates.img,
        })
        .from(candidates);

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

    const resResult = selectCandidateSchema.parse(created);

    return sendResponse({
        res,
        statusCode: 201,
        data: resResult,
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

    const resResult = selectCandidateSchema.parse(result[0]);

    return sendResponse({
        res,
        statusCode: 200,
        data: resResult,
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
