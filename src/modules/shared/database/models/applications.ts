import { date, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { careerDaySchema, users } from './users';
import { vacancies } from './vacancies';

export const applications = careerDaySchema.table('applications', {
    id: uuid().primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id')
        .references(() => users.id)
        .notNull(),
    vacancyId: uuid('vacancy_id')
        .references(() => vacancies.id)
        .notNull(),
    status: varchar('status', {
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    })
        .notNull()
        .default('pending'),
    createdAt: date('created_at').defaultNow().notNull(),
    updatedAt: date('updated_at').defaultNow().notNull(),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
    candidate: one(users, {
        fields: [applications.candidateId],
        references: [users.id],
    }),
    vacancy: one(vacancies, {
        fields: [applications.vacancyId],
        references: [vacancies.id],
    }),
}));

export type Application = typeof applications.$inferSelect;
