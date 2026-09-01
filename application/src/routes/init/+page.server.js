import { error } from '@sveltejs/kit';
import model from '$lib/server/db/model/auth';

export async function load() {
    const pageTitle = 'Setup';

    const isUserExists = await model.getData();
    if (isUserExists) throw error(404, 'Not Found');

    return { pageTitle };
}
