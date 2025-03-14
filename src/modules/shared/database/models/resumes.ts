import { date, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { careerDaySchema, users } from './users';

export const resumes = careerDaySchema.table('resumes', {
    id: uuid().primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id')
        .references(() => users.id)
        .notNull(),
    title: varchar('title', { length: 255 }),
    filePath: varchar('file_path', { length: 255 }),
    skills: varchar('skills', { length: 1000 }),
    experience: varchar('experience', { length: 1000 }),
    education: varchar('education', { length: 1000 }),
    createdAt: date('created_at').defaultNow().notNull(),
    updatedAt: date('updated_at').defaultNow().notNull(),
});

export const resumesRelations = relations(resumes, ({ one }) => ({
    candidate: one(users, {
        fields: [resumes.candidateId],
        references: [users.id],
    }),
}));

export type Resume = typeof resumes.$inferSelect;
