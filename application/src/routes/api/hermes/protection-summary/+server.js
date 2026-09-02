import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/logs';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

// get protection summary of the last 24 hours, triggered by CRON
// Logs -> getSummary()

export async function GET({ request }) {
    try {
        bearerVerify(request.headers.get('authorization'));

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
