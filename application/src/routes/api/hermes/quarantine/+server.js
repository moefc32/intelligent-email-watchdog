// get either quarantine list or quarantined email detailed info

import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const email = url.searchParams.get('email');

    return json({
        period: 'August 21, 2026 14:00 - August 22, 2026 14:00',
        items: [
            {
                publicId: '...',
                subject: '...',
                sender: '...',
                reason: 'phishing',
                score: 23,
                receivedAt: 'August 22, 2026 08:42'
            }
        ]
    });

    return json({
        publicId: '...',
        subject: '...',
        headers: '...',
        content: '...',
        sender: '...',
        recipient: '...',
        message: '...',
        status: 'quarantined',
        reason: 'scam',
        score: 19,
        receivedAt: 'August 22, 2026 08:42'
    });
}
