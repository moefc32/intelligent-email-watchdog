import { VITE_PAGINATION_ITEMS } from '$env/static/private';
import model from '$lib/server/db/model/quarantine';

export async function load({ parent }) {
    const pageTitle = 'Quarantined Email';
    const { access_token, userData, hashed_email } = await parent();

    const limit = Number(VITE_PAGINATION_ITEMS) || 10;
    const data = await model.getAllData(0, limit);

    return {
        pageTitle,
        access_token,
        userData,
        hashed_email,
        ...data,
    };
}
