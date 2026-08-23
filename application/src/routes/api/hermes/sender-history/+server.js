// get a specific sender history

import { json } from '@sveltejs/kit';

export async function GET() {
    return json({
        sender: '...',
        status: {
            passed: 15,
            quarantined: 7
        },
        reason: {
            legitimate: 15,
            spam: 4,
            scam: 2,
            blacklist: 1
        },
        averageScore: 54.4
    });
}
