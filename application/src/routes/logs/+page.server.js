import model from '$lib/server/db/model/logs';

export async function load({ parent }) {
    const pageTitle = 'Protection Logs';
    const { access_token, userData, hashed_email } = await parent();

    const today = new Date();
    const contents = await model.getData(
        today.getFullYear(),
        today.getMonth() + 1
    );

    return {
        pageTitle,
        access_token,
        userData,
        hashed_email,
        contents: {
            filter: {
                year: today.getFullYear(),
                month: today.getMonth() + 1,
                day: today.getDate(),
            },
            today,
            ...contents,
        },
    };
}
