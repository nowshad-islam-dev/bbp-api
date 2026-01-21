import { z } from 'zod';
import { insertCandidateSchema } from '.';

export const createCandidateSchema = z.object({
    body: insertCandidateSchema.extend({
        name: z.string().min(2).max(20),
        shortIntro: z.string().min(10).max(255),
        gender: z.enum(['male', 'female']).nullable(),
        vicinity: z.string().min(2).max(40),
        // JSON fields need to be typed explicitly in Zod
        topicsBrought: z.array(z.string()).default([]),
    }),
});

export interface CandidateBody {
    name: string;
    shortIntro: string;
    gender?: 'male' | 'female';
    vicinity: string;
    topicsBrought: string[];
}
