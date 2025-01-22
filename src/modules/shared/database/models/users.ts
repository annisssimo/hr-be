import { settings } from 'config/settings';
import { sql } from 'drizzle-orm';
import { pgSchema, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { USER_ROLE, USER_STATUS } from 'src/constants';

export const careerDaySchema = pgSchema(settings.DATABASE.schema);

export const users = careerDaySchema.table('users', {
    id: uuid()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    managerId: uuid('manager_id').references(() => users.id),
    password: varchar('password', { length: 255 }).notNull(),
    avatar: varchar('avatar', { length: 255 }).$default(null),

    status: varchar('status', {
        enum: [USER_STATUS.ACTIVE, USER_STATUS.PENDING, USER_STATUS.ARCHIVED],
    }).notNull(),

    role: varchar('role', {
        enum: [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER],
    }).notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
    manager: one(users, {
        fields: [users.managerId],
        references: [users.id],
    }),
}));
