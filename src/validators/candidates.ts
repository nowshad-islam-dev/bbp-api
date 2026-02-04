import { z } from 'zod';
import { insertCandidateSchema } from '.';

export const createCandidateSchema = z.object({
    body: insertCandidateSchema.extend({
        name: z.string().min(2).max(20),
        age: z.coerce.number().min(25).max(120),
        gender: z.enum(['male', 'female']).nullable(),
        type: z.enum([
            'possible',
            'eligible',
            'withdrawn',
            'elected',
            'nonelected',
        ]),
        politicalParty: z.string().min(2).max(100),
        vicinity: z.string().min(2).max(40),
        district: z.string().min(2).max(40),
        division: z.string().min(2).max(40),
    }),
});

export const getAllCandidateSchema = z.object({
    query: z.object({
        cursor: z.coerce.number().min(0).default(0),
        pageSize: z.coerce.number().min(1).max(100).default(20),
    }),
});

export type Gender = 'male' | 'female';

export type CandidateType =
    | 'possible'
    | 'eligible'
    | 'withdrawn'
    | 'elected'
    | 'nonelected';

export interface CandidateBody {
    name: string;
    age: string;
    gender?: Gender;
    type: CandidateType;
    politicalParty: string;
    vicinity: string;
    district: string;
    division: string;
}
