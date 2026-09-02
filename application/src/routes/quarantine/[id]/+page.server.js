import { error } from '@sveltejs/kit';
import model from '$lib/server/db/model/quarantine';

export async function load({ params, parent }) {
    const pageTitle = 'Quarantined Email';
    const { access_token, userData, hashed_email } = await parent();
    const { id } = params;

    const contents = await model.getData(id);

    if (!contents) throw error(404);

    return {
        pageTitle,
        access_token,
        userData,
        hashed_email,
        contents,
    };
}
