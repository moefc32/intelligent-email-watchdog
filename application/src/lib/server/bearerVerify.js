import { VITE_M2M_TOKEN_HASH } from '$env/static/private';
import { createHash, timingSafeEqual } from 'node:crypto';

export class BearerError extends Error { }

export function bearerVerify(bearer) {
    if (!bearer?.startsWith('Bearer '))
        throw new BearerError('Invalid authentication header');

    const token = bearer.slice(7);
    const hash = createHash('sha256').update(token).digest();
    const expected = Buffer.from(VITE_M2M_TOKEN_HASH, 'hex');

    if (!timingSafeEqual(hash, expected))
        throw new BearerError('Invalid bearer token');

    return true;
}
