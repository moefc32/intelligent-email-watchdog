import model from '$lib/server/db/model/quarantine';

export async function load({ parent }) {
    const pageTitle = 'Email Quarantine';
    const { access_token, userData, hashed_email } = await parent();

    const contents = await model.getAllData();

    return {
        pageTitle,
        access_token,
        userData,
        hashed_email,
        contents,
    };
}
