// get protection summary of the last 24 hours by maximum 20 items

import { json } from '@sveltejs/kit';

export async function GET() {
    return json({
        items: [
            {
                publicId: '...',
                subject: '...',
                sender: '...',
                status: 'passed',
                reason: 'legitimate',
                score: 89,
                receivedAt: 'August 22, 2026 08:42'
            }
        ]
    });
}
