import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/logs';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

// get a specific sender history
// Logs -> getBySender()

export async function GET({ request }) {
    try {
        bearerVerify(request.headers.get('authorization'));

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
