import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/quarantine';

export async function GET({ url }) {
    const id = url.searchParams.get('id');

    if (!id) {
        return json({
            application: VITE_APP_NAME,
            message: 'Error, id must be provided!',
        }, {
            status: 400,
        });
    }

    try {
        const result = await model.getData(id);

        return json({
            application: VITE_APP_NAME,
            message: 'Get data success.',
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
    const page = url.searchParams.get('page') || 1;

    if (!id) {
        return json({
            application: VITE_APP_NAME,
            message: 'Error, id must be provided!',
        }, {
            status: 400,
        });
    }

    const limit = 10;
    const offset = page - 1 * limit;

    try {
        const query = await model.deleteData(id);

        const result = await model.getAllData(limit, offset);

        return json({
            application: VITE_APP_NAME,
            message: 'Delete data success.',
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
