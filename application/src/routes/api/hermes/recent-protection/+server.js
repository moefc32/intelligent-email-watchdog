import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/logs';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

// get protection summary of the last 24 hours by maximum 20 items, triggered by user
// Logs -> getByTime()

export async function GET({ request }) {
    try {
        bearerVerify(request.headers.get('authorization'));

        return json({
            items: [
                {
                    id: '...',
                    subject: '...',
                    sender: '...',
                    status: 'passed',
                    reason: 'legitimate',
                    score: 89,
                    receivedAt: 'August 22, 2026 08:42'
                }
            ]
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
