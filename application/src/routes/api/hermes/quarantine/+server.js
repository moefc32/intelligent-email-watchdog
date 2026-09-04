import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/quarantine';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

// get either quarantine list or quarantined email detailed info

const dateTimeFormatter =
    new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

export async function GET({ request, url }) {
    const email = url.searchParams.get('email');

    try {
        bearerVerify(request.headers.get('authorization'));

        if (email) {
            const result = await model.getData(email);

            if (!result) {
                return json({
                    application: VITE_APP_NAME,
                    message: 'Quarantined email not found',
                }, {
                    status: 404,
                });
            }

            return json({
                ...result,
            });
        }

        const endTime = new Date();
        const timeWindow = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        const result = await model.getByTime(timeWindow);

        return json({
            period: `${dateTimeFormatter.format(timeWindow)} - ${dateTimeFormatter.format(endTime)}`,
            items: result.map((item) => ({
                ...item,
                receivedAt: dateTimeFormatter.format(item.receivedAt),
            })),
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
