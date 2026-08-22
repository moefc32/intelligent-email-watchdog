import {
    VITE_APP_NAME,
    VITE_JWT_SECRET,
    VITE_JWT_EXPIRATION
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import { hashPassword, comparePassword } from '$lib/server/hash';
import token from '$lib/server/token';
import jwt from 'jsonwebtoken';
import model from '$lib/server/db/model/auth';
import isValidEmail from '$lib/isValidEmail';
import parseMs from '$lib/parseMs';

export async function POST({ cookies, request }) {
    const {
        email = '',
        password = '',
    } = await request.json() || {};

    if (!isValidEmail(email)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Login failed, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const result = await model.getData(email.trim().toLowerCase());
        const match = result
            ? await comparePassword(password, result?.password)
            : false;

        if (!match) {
            return json({
                application: VITE_APP_NAME,
                message: 'Login failed, please try again!',
            }, {
                status: 401,
            });
        }

        const jwtToken = token.sign({ id: result.id },
            VITE_JWT_EXPIRATION || '1h');

        const maxAge = parseMs(VITE_JWT_EXPIRATION || '1h');
        token.set(cookies, 'access_token', jwtToken, { maxAge });

        return json({
            application: VITE_APP_NAME,
            message: 'Login success.',
        });
    } catch (e) {
        console.error(e);

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}

export async function PATCH({ cookies, request }) {
    const {
        email = '',
        password = '',
    } = await request.json() || {};

    if (!isValidEmail(email)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Save data failed, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const access_token = await cookies.get(token.access);
        const decoded_token = token.decode(access_token);
        const isUserPresent = await model.getData(decoded_token?.id);

        if (!isUserPresent)
            return json({
                application: VITE_APP_NAME,
                message: 'Error, application user data not found!',
            }, {
                status: 404,
            });

        const data = {
            email: email === '' ? null : email.trim().toLowerCase(),
            password: password
                ? await hashPassword(password)
                : null,
        }
        const result = await model.editData(data, decoded_token.id);

        return json({
            application: VITE_APP_NAME,
            message: 'Edit login info success.',
            data: result,
        });
    } catch (e) {
        console.error(e);

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}

export async function PUT({ request }) {
    const {
        email = '',
        password = '',
    } = await request.json() || {};

    if (!isValidEmail(email)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Save data failed, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const countUser = await model.getData();

        if (countUser)
            return json({
                application: VITE_APP_NAME,
                message: 'Permission denied, application user data already exists!',
            }, {
                status: 409,
            });

        const result = await model.createData({
            email: email.trim().toLowerCase(),
            password: await hashPassword(password),
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Create login info success.',
            data: result,
        });
    } catch (e) {
        console.error(e);

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}

export async function DELETE({ cookies }) {
    try {
        token.purge(cookies, 'access_token');

        return json({
            application: VITE_APP_NAME,
            message: 'Logout success.',
        });
    } catch (e) {
        console.error(e);

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}
