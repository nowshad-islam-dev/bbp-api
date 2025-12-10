import { z } from 'zod';

export const CandidateSchema = z.object({
    name: z
        .string({ error: 'Name is required' })
        .max(255, { error: 'Name must be less than 255 characters' }),

    shortIntro: z
        .string({ error: 'Intro is required' })
        .max(255, { error: 'Intro must be less than 255 characters' }),

    gender: z.enum(['male', 'female']).nullable(),
    vicinity: z.string({ error: 'Vicinity is required' }).max(255),

    // JSON fields need to be typed explicitly in Zod
    topicsBrought: z.array(z.string()).default([]),
});

export type CandidateInput = z.infer<typeof CandidateSchema>;
