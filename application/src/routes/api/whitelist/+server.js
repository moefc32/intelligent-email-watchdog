import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import D1 from '$lib/server/db/D1';
import isValidEmail from '$lib/isValidEmail';

export async function POST({ request }) {
    const { address = '' } = await request.json() || {};

    if (!address || !isValidEmail(address)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Valid email address must be provided, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const query = await D1.create('Whitelist', {
            address: address.toLowerCase(),
            created_at: Math.floor(Date.now() / 1000),
        });

        const result = await D1.get('Whitelist');
        result.forEach((item) => item.id = item.address);

        return json({
            application: VITE_APP_NAME,
            message: 'Create new whitelist item success.',
            data: result,
        });
    } catch (e) {
        console.error(e);

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}

export async function DELETE({ url }) {
    const address = url.searchParams.get('address');

    if (!address) {
        return json({
            application: VITE_APP_NAME,
            message: 'Error, email address must be provided!',
        }, {
            status: 400,
        });
    }

    try {
        const query = await D1.delete('Whitelist', address);

        const result = await D1.get('Whitelist');
        result.forEach((item) => item.id = item.address);

        return json({
            application: VITE_APP_NAME,
            message: 'Delete whitelist item success.',
            data: result,
        });
    } catch (e) {
        console.error(e);

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}
