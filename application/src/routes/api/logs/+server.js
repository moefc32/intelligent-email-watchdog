import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import model from '$lib/server/db/model/logs';

export async function GET({ url }) {
    const year = Number(url.searchParams.get('year')) || today.getFullYear();
    const month = Number(url.searchParams.get('month')) || today.getMonth() + 1;
    const day = Number(url.searchParams.get('day')) || null;

    try {
        const result = await model.getData(year, month, day);

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
