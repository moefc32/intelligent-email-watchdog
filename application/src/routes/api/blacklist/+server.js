import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import D1 from '$lib/server/db/D1';
import isValidEmail from '$lib/isValidEmail';
import trimText from '$lib/trimText';

export async function POST({ request }) {
    const {
        address = '',
        reason = '',
    } = await request.json() || {};

    if (!address || !isValidEmail(address)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Valid email address must be provided, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const query = await D1.create('Blacklist', {
            address: address.toLowerCase(),
            reason: trimText(reason) || null,
            created_at: Math.floor(Date.now() / 1000),
        });

        const result = await D1.get('Blacklist');
        result.forEach((item) => item.id = item.address);

        return json({
            application: VITE_APP_NAME,
            message: 'Create new blacklist item success.',
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

export async function PATCH({ request, url }) {
    const address = url.searchParams.get('address');
    const { reason = '' } = await request.json() || {};

    if (!address) {
        return json({
            application: VITE_APP_NAME,
            message: 'Error, email address must be provided!',
        }, {
            status: 400,
        });
    }

    try {
        const query = await D1.update('Blacklist', address, {
            reason: trimText(reason) || null,
            updated_at: Math.floor(Date.now() / 1000),
        });

        const result = await D1.get('Blacklist');
        result.forEach((item) => item.id = item.address);

        return json({
            application: VITE_APP_NAME,
            message: 'Update blacklist item success.',
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
        const query = await D1.delete('Blacklist', address);

        const result = await D1.get('Blacklist');
        result.forEach((item) => item.id = item.address);

        return json({
            application: VITE_APP_NAME,
            message: 'Delete blacklist item success.',
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
