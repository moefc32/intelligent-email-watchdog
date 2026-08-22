import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { init as cuid2 } from '@paralleldrive/cuid2';
import model from '$lib/server/db/model/url';
import trimText from '$lib/trimText';
import isValidShortURL from '$lib/isValidShortURL';

export async function GET({ url }) {
    const page = url.searchParams.get('page') || 1;
    const search = url.searchParams.get('s');
    const shortUrl = url.searchParams.get('short_url');

    try {
        const offset = (page - 1) * 10;
        const result = search
            ? await model.searchData(search, 10, offset)
            : await model.getData(shortUrl, 10, offset);

        return json({
            application: VITE_APP_NAME,
            message: !result.length
                ? 'No data found.'
                : `Get all data success.`,
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

export async function POST({ request }) {
    const {
        shortUrl = '',
        longUrl = '',
    } = await request.json() || {};

    if (!isValidShortURL(shortUrl)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Invalid short URL!',
        }, {
            status: 400,
        });
    }

    if (!longUrl) {
        return json({
            application: VITE_APP_NAME,
            message: 'Destination URL must be provided!',
        }, {
            status: 400,
        });
    }

    try {
        const cuid = cuid2({ length: 8 })();

        const result = await model.createData({
            shortUrl: shortUrl ? trimText(shortUrl) : cuid,
            longUrl: trimText(longUrl)
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Create new data success.',
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

export async function PATCH({ url, request }) {
    const id = url.searchParams.get('id');
    const {
        shortUrl = '',
        longUrl = '',
    } = await request.json() || {};

    if (!isValidShortURL(shortUrl)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Invalid short URL!',
        }, {
            status: 400,
        });
    }

    try {
        const result = await model.editData({
            shortUrl: trimText(shortUrl),
            longUrl: trimText(longUrl)
        }, id);

        return json({
            application: VITE_APP_NAME,
            message: 'Edit data success.',
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
    const id = url.searchParams.get('id');

    try {
        const result = await model.deleteData(id);

        return json({
            application: VITE_APP_NAME,
            message: 'Delete data success.',
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
