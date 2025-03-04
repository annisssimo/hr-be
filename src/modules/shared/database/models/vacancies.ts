import { date, uuid, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { careerDaySchema, users } from './users';

export const vacancies = careerDaySchema.table('vacancies', {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: varchar('description', { length: 2000 }).notNull(),
    skills: varchar('skills', { length: 1000 }).notNull(),
    location: varchar('location', { length: 255 }),
    salary: integer('salary'),
    createdAt: date('created_at').defaultNow().notNull(),
    managerId: uuid('manager_id')
        .references(() => users.id)
        .notNull(),
});

export const vacanciesRelations = relations(vacancies, ({ one }) => ({
    manager: one(users, {
        fields: [vacancies.managerId],
        references: [users.id],
    }),
}));

export type Vacancy = typeof vacancies.$inferSelect;
