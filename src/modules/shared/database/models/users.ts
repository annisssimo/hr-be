import { date, pgSchema, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { settings } from '../../../../../config/settings';
import { USER_STATUS, USER_ROLE } from '../../../../constants';

export const careerDaySchema = pgSchema(settings.DATABASE.schema);

export const users = careerDaySchema.table('users', {
    id: uuid().primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    managerId: uuid('manager_id').references(() => users.id),
    password: varchar('password', { length: 255 }).notNull(),
    avatar: varchar('avatar', { length: 255 }),

    status: varchar('status', {
        enum: [USER_STATUS.ACTIVE, USER_STATUS.PENDING, USER_STATUS.ARCHIVED],
    })
        .notNull()
        .default(USER_STATUS.PENDING),

    role: varchar('role', {
        enum: [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER],
    }),
    statusAssignmentDate: date('status_assignment_date'),
});

export const usersRelations = relations(users, ({ one }) => ({
    manager: one(users, {
        fields: [users.managerId],
        references: [users.id],
    }),
}));

export type User = typeof users.$inferSelect;
