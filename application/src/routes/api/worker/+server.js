import { VITE_APP_NAME } from '$env/static/private';
import { json, text } from '@sveltejs/kit';
import modelLogs from '$lib/server/db/model/logs';
import modelQuarantine from '$lib/server/db/model/quarantine';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

// process request sent by the worker
// Logs -> createData()
// Quarantine -> createData()

export async function GET({ request }) {
    try {
        bearerVerify(request.headers.get('authorization'));

        const toHermes = {
            sender: '...',
            subject: '...',
            headers: '...',
            content: '...',
            senderHistory: {
                status: {
                    passed: 15,
                    quarantined: 6
                },
                reason: {
                    legitimate: 15,
                    spam: 4,
                    scam: 2,
                },
                averageScore: 54.4
            }
        };

        const fromHermes = {
            message: 'The email appears to be a recruitment scam.',
            status: 'quarantined',
            reason: 'scam'
        };

        if (fromHermes?.status === 'passed') {
            return text(true);
        } else {
            return text(false);
        }
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
