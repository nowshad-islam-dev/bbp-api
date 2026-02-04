import { eq, gt } from 'drizzle-orm';
import { db } from '@/db';
import { candidates } from '@/db/schema';
import { AppError } from '@/utils/appError';
import { selectCandidateSchema } from '@/validators';
import { ErrorCode } from '@/utils/errorCode';
import { Gender, CandidateType } from '@/validators/candidates';

export class CandidatesService {
    async getAll(cursor = '0', pageSize = '20') {
        const safeCursor = parseInt(cursor);
        const safePageSize = parseInt(pageSize);

        const result = await db
            .select({
                id: candidates.id,
                name: candidates.name,
                age: candidates.age,
                gender: candidates.gender,
                type: candidates.type,
                politicalParty: candidates.politicalParty,
                vicinity: candidates.vicinity,
                district: candidates.district,
                division: candidates.division,
                img: candidates.img,
            })
            .from(candidates)
            .where(gt(candidates.id, safeCursor))
            .orderBy(candidates.id) // Default sort order is 'asc'
            .limit(safePageSize + 1);

        const hasMore = result.length > safePageSize;
        if (hasMore) result.pop(); // Drop the extra result
        const lastItem = result[result.length - 1];
        const nextCursor = hasMore && lastItem ? lastItem.id : null;

        return {
            result,
            meta: {
                pageSize: safePageSize,
                nextCursor,
                // result.length < limit indicates end of data
                hasMore,
            },
        };
    }

    async create(
        name: string,
        age: string,
        type: CandidateType,
        politicalParty: string,
        vicinity: string,
        district: string,
        division: string,
        gender?: Gender,
        img?: string,
    ) {
        const newCandidate = {
            name,
            img,
            gender,
            age: parseInt(age),
            type,
            politicalParty,
            vicinity,
            division,
            district,
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
        return { result: parsedCandidate };
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
        return { result: parsedCandidate };
    }

    async deleteCandidateById(candidateId: string) {
        const [result] = await db
            .delete(candidates)
            .where(eq(candidates.id, parseInt(candidateId)));

        if (result.affectedRows === 0) {
            throw new AppError('Candidate not found', 404, ErrorCode.NOT_FOUND);
        }
        return { result: null };
    }
}
