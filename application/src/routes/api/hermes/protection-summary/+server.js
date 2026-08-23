// get protection summary of the last 24 hours

import { json } from '@sveltejs/kit';

export async function GET() {
    return json({
        period: 'August 20, 2026 14:00 - August 21, 2026 14:00',
        status: {
            passed: 35,
            quarantined: 7
        },
        reason: {
            whitelist: 20,
            legitimate: 15,
            spam: 4,
            scam: 2,
            blacklist: 1
        }
    });
}
