import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users, comments, events, news, candidates } from '@/db/schema';

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users).pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
});

export const insertNewsSchema = createInsertSchema(news);
export const selectNewsSchema = createSelectSchema(news).pick({
    id: true,
    title: true,
    text: true,
    img: true,
    createdAt: true,
});

export const insertCandidateSchema = createInsertSchema(candidates);
export const selectCandidateSchema = createSelectSchema(candidates).pick({
    id: true,
    name: true,
    shortIntro: true,
    vicinity: true,
    topicsBrought: true,
    img: true,
});

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events).pick({
    id: true,
    title: true,
    excerpt: true,
    text: true,
    date: true,
});

export const insertCommentSchema = createInsertSchema(comments);
export const selectCommentSchema = createSelectSchema(comments).pick({
    id: true,
    newsId: true,
    content: true,
    createdAt: true,
});
