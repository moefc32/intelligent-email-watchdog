import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/logs';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';
import isValidEmail from '$lib/isValidEmail';

// get a specific sender history

export async function GET({ request, url }) {
    const sender = url.searchParams.get('sender');

    if (!isValidEmail(sender)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Valid sender address must be provided',
        }, {
            status: 400,
        });
    }

    try {
        bearerVerify(request.headers.get('authorization'));

        const result = await model.getBySender(sender);

        return json({
            ...result,
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
