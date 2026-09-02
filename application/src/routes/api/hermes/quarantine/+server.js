import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/quarantine';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

// get either quarantine list or quarantined email detailed info
// Quarantine -> getByTime()
// Quarantine -> getData()

export async function GET({ request, url }) {
    try {
        bearerVerify(request.headers.get('authorization'));

        const email = url.searchParams.get('email');

        return json({
            period: 'August 21, 2026 14:00 - August 22, 2026 14:00',
            items: [
                {
                    id: '...',
                    subject: '...',
                    sender: '...',
                    reason: 'phishing',
                    score: 23,
                    receivedAt: 'August 22, 2026 08:42'
                }
            ]
        });

        return json({
            id: '...',
            subject: '...',
            headers: '...',
            content: '...',
            sender: '...',
            recipient: '...',
            status: 'quarantined',
            reason: 'scam',
            score: 19,
            receivedAt: 'August 22, 2026 08:42'
        });
    } catch (e) {
        console.error(e);

        if (e instanceof BearerError)
            return json({
                application: VITE_APP_NAME,
                message: 'Unauthorized',
            }, {
                status: 401,
            });

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}
