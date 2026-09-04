import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/logs';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

// get protection summary of the last 24 hours, triggered by CRON

const dateTimeFormatter =
    new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

export async function GET({ request }) {
    try {
        bearerVerify(request.headers.get('authorization'));

        const endTime = new Date();
        const timeWindow = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        const result = await model.getSummary(timeWindow);

        return json({
            period: `${dateTimeFormatter.format(timeWindow)} - ${dateTimeFormatter.format(endTime)}`,
            status: result.status,
            reason: result.reason,
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
