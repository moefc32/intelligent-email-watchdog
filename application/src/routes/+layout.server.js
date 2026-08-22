import model from '$lib/server/db/model/auth';
import token from '$lib/server/token';

export async function load({ cookies, locals }) {
    const access_token = cookies.get(token.access);
    const decoded_token = token.decode(access_token);

    if (!decoded_token) return { ...locals };

    const userData = await model.getData(decoded_token?.id);
    if (userData) delete userData.password;

    return {
        ...locals,
        userData,
    };
}
