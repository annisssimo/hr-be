import { settings } from 'config/settings';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle/migrations',
    schema: './src/modules/shared/database/models/index.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: settings.DATABASE.url,
    },

    migrations: {
        schema: 'drizzle',
        table: 'career_day_drizzle_migrations',
    },
});
