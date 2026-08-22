import { VITE_DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const poolConnection = mysql.createPool({
    uri: VITE_DATABASE_URL,
    enableKeepAlive: true,
    connectionLimit: 10,
    dateStrings: true,
});

export default drizzle(poolConnection, { schema, mode: 'default' });

async function shutdown() {
    await poolConnection.end();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
