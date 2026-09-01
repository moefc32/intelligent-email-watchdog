import {
    VITE_CLOUDFLARE_ACCOUNT_ID,
    VITE_CLOUDFLARE_API_TOKEN,
    VITE_D1_DATABASE_ID,
} from '$env/static/private';

const D1_API_URL =
    `https://api.cloudflare.com/client/v4/accounts/${VITE_CLOUDFLARE_ACCOUNT_ID}/d1/database/${VITE_D1_DATABASE_ID}/query`;

const TABLES = ['Blacklist', 'Whitelist'];

async function request(sql, params = []) {
    const response = await fetch(D1_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${VITE_CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.errors?.map(error => error.message).join('; ') ||
            `D1 request failed: ${response.status}`,
        );
    }

    return data.result?.[0];
}

function tableName(table) {
    if (!TABLES.includes(table)) {
        throw new Error(`Invalid table: ${table}`);
    }

    return `"${table}"`;
}

export default {
    get: async (table, address) => {
        const name = tableName(table);

        if (address) {
            const result = await request(
                `SELECT * FROM ${name} WHERE "address" = ? LIMIT 1;`,
                [address],
            );

            return result?.results?.[0] ?? null;
        }

        const result = await request(`SELECT * FROM ${name};`);

        return result?.results ?? [];
    },
    getSummary: async () => {
        const results = await Promise.all(
            TABLES.map(async (table) => {
                const result = await request(`SELECT COUNT(*) FROM "${table}";`);

                return [
                    table,
                    result?.results?.[0]?.['COUNT(*)'] ?? 0
                ];
            }),
        );

        return Object.fromEntries(results);
    },
    create: async (table, data) => {
        const name = tableName(table);
        const columns = Object.keys(data);

        if (!columns.length) throw new Error('No fields provided');

        const fields = columns.map(column => `"${column}"`).join(', ');
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(column => data[column]);

        return request(
            `INSERT INTO ${name} (${fields}) VALUES (${placeholders});`,
            values,
        );
    },
    update: async (table, address, data) => {
        const name = tableName(table);
        const columns = Object.keys(data).filter(column => column !== 'address');

        if (!columns.length) throw new Error('No fields provided');

        const assignments = columns
            .map(column => `"${column}" = ?`)
            .join(', ');

        const values = columns.map(column => data[column]);

        return request(`UPDATE ${name} SET ${assignments} WHERE "address" = ?;`,
            [...values, address],
        );
    },
    delete: async (table, address) => {
        const name = tableName(table);

        return request(
            `DELETE FROM ${name} WHERE "address" = ?;`,
            [address],
        );
    },
}
