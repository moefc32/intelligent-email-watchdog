import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';

export async function GET({ request }) {
    try {
        bearerVerify(request.headers.get('authorization'));

        return json({
            status: 'ok',
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
