import { error, redirect } from '@sveltejs/kit';
import token from '$lib/server/token';
import modelAuth from '$lib/server/db/model/auth';
import modelURL from '$lib/server/db/model/url';

export async function load({ cookies, params, request }) {
    const shortUrl = params.short_url;
    const stats = shortUrl?.endsWith('~');

    if (!stats) {
        const response = await modelURL.getLongURL({
            shortUrl,
            ref: request.headers.get('referer'),
            agent: request.headers.get('user-agent'),
        })

        const longUrl = response?.[0]?.longUrl;

        if (longUrl) throw redirect(302, longUrl);
        throw error(404);
    }

    const access_token = await cookies.get(token.access);

    if (access_token) {
        const decoded_token = token.decode(access_token);
        const clean_short = shortUrl.slice(0, -1);

        const [user, data] = await Promise.all([
            modelAuth.getData(decoded_token?.id),
            modelURL.getData(clean_short)
        ]);

        if (data.length) {
            return {
                access_token,
                user_email: user?.email,
                contents: {
                    shortUrl: clean_short,
                    contents: data,
                },
            };
        }
    }

    throw error(404);
}
