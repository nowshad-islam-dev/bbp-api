import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { candidates } from '@/db/schema';
import { AppError } from '@/utils/appError';
import { selectCandidateSchema } from '@/validators';
import { ErrorCode } from '@/utils/errorCode';

export class CandidatesService {
    async getAll() {
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

        return result;
    }

    async create(
        name: string,
        shortIntro: string,
        vicinity: string,
        topicsBrought: string[],
        gender?: 'male' | 'female',
        img?: string,
    ) {
        const newCandidate = {
            name,
            shortIntro,
            gender,
            img,
            vicinity,
            topicsBrought,
        };
        const [result] = await db
            .insert(candidates)
            .values(newCandidate)
            .$returningId();

        const [created] = await db
            .select()
            .from(candidates)
            .where(eq(candidates.id, result.id));

        const parsedCandidate = selectCandidateSchema.parse(created);
        return parsedCandidate;
    }

    async getCandidateById(candidateId: string) {
        const [result] = await db
            .select()
            .from(candidates)
            .where(eq(candidates.id, parseInt(candidateId)));

        if (!result) {
            throw new AppError('Candidate not found', 404, ErrorCode.NOT_FOUND);
        }

        const parsedCandidate = selectCandidateSchema.parse(result);
        return parsedCandidate;
    }

    async deleteCandidateById(candidateId: string) {
        const [result] = await db
            .delete(candidates)
            .where(eq(candidates.id, parseInt(candidateId)));

        if (result.affectedRows === 0) {
            throw new AppError('Candidate not found', 404, ErrorCode.NOT_FOUND);
        }
        return null;
    }
}
