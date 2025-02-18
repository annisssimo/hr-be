import { pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';
import { settings } from '../../../../../config/settings';

export const careerDaySchema = pgSchema(settings.DATABASE.schema);

export const passwordResetTokens = careerDaySchema.table('password_reset_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
});
