export async function checkEmailSender(db, table, address) {
    const result = await db
        .prepare(`
            SELECT 1
            FROM ${table}
            WHERE address = ?
            LIMIT 1;
        `)
        .bind(address)
        .first();

    return result !== null;
}
