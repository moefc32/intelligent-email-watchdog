import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'mysql',
    schema: './src/lib/server/db/schema/*',
    out: './migration',
    dbCredentials: {
        url: process.env.VITE_DATABASE_URL,
    },
});
