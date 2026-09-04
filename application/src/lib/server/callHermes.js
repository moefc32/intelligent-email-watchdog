import {
    VITE_HERMES_ENDPOINT,
    VITE_HERMES_API_KEY,
} from '$env/static/private';

export default async function (data) {
    const response = await fetch(VITE_HERMES_ENDPOINT, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${VITE_HERMES_API_KEY}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok)
        throw new Error(`Hermes returned ${response.status}!`);

    return response.json();
}
