import { redirect } from '@sveltejs/kit';
import modelAuth from '$lib/server/db/model/auth';
import token from '$lib/server/token';

const UNAUTH_ROUTES = ['/login'];
const PUBLIC_API_ROUTES = ['/api/auth'];
const INIT_ROUTE = '/init';

function isRouteMatch(routes, path) {
    return routes.some((route) => path.startsWith(route));
}

export const handle = async ({ event, resolve }) => {
    const { cookies, url } = event;
    const currentPath = url.pathname;

    try {
        const isTokenValid = token.validate(cookies);

        const lang = cookies.get('lang');
        const validLang = lang && ['en', 'id'].includes(lang);

        if (!validLang) {
            cookies.set('lang', 'en', {
                path: '/',
                httpOnly: true,
            });
        }

        event.locals.lang = validLang ? lang : 'en';
        event.locals.unauthRoutes = UNAUTH_ROUTES;

        if (isTokenValid) {
            cookies.set('__session_active', '1', {
                path: '/',
                httpOnly: false,
            });
        } else {
            cookies.delete('__session_active', {
                path: '/',
            });
        }

        let user = await modelAuth.getData(isTokenValid.id);
        let isAuthenticated = false;

        if (isTokenValid) {
            isAuthenticated = !!user;
        }

        if (!isAuthenticated) {
            token.purge(cookies, [
                'access_token',
                'refresh_token',
            ]);

            if (!user) {
                const isApiRoute =
                    isRouteMatch(PUBLIC_API_ROUTES, currentPath);
                const isInitRoute = (currentPath === INIT_ROUTE);

                if (!isApiRoute && !isInitRoute) {
                    throw redirect(303, INIT_ROUTE);
                }

                return resolve(event);
            }

            if (currentPath === '/') {
                throw redirect(303, '/login');
            }
        } else {
            if (isRouteMatch(UNAUTH_ROUTES, currentPath)) {
                throw redirect(303, '/');
            }
        }

        return resolve(event);
    } catch (e) {
        if (e.status && e.status >= 300 && e.status < 400) {
            throw e;
        }

        console.error('\n--- CRITICAL HOOK ERROR ---\n');
        console.error(e);

        return await resolve(event);
    }
};
