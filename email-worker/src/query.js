export async function checkEmailBlacklist(db, address) {
    const result = await db
        .prepare(`
            UPDATE Email_Blacklist
            SET hit = hit + 1
            WHERE address = ?
            RETURNING address;
        `)
        .bind(address)
        .first();

    return result !== null;
}
