import D1 from '$lib/server/db/D1';

export async function load({ parent }) {
    const pageTitle = 'Overview';
    const { access_token, userData, hashed_email } = await parent();

    const summaryD1 = await D1.getSummary();

    return {
        pageTitle,
        access_token,
        userData,
        hashed_email,
        contents: {
            summaryD1,
        },
    };
}
