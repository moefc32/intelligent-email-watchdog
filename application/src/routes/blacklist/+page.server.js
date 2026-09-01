import D1 from '$lib/server/db/D1.js';

export async function load({ parent }) {
    const pageTitle = 'Address Blacklist';
    const { access_token, userData, hashed_email } = await parent();

    const contents = await D1.get('Blacklist');

    return {
        pageTitle,
        access_token,
        userData,
        hashed_email,
        contents,
    };
}
