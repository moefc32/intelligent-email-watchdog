import token from '$lib/server/token';
import modelAuth from '$lib/server/db/model/auth';
// import modelURL from '$lib/server/db/model/url';

export async function load({ cookies }) {
    const access_token = await cookies.get(token.access);
    if (!access_token) return;

    const decoded_token = token.decode(access_token);
    const isUserPresent = await modelAuth.getData(decoded_token?.id);
    // const response = await modelURL.getData();

    return {
        access_token,
        user_email: isUserPresent?.email,
        contents: response,
    };
}
