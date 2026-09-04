import { checkEmailSender } from './query.js';

const statuses = [
    'blacklisted',
    'whitelisted',
    'unknown',
];

async function notifyApp(endpoint, secret, message, statusCode) {
    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${secret}`,
        },
        body: JSON.stringify({
            sender: message.from,
            recipient: message.to,
            status: statuses[statusCode],

            ...(statusCode !== 1 && {
                subject: message.headers.get('subject'),
                headers: Object.fromEntries(message.headers),
                content: await new Response(message.raw).text(),
            }),
        })
    });
}

export default {
    async email(message, env, ctx) {
        const app_endpoint = env.CONFIG_APP_ENDPOINT;
        const email_recipient = env.CONFIG_EMAIL_RECIPIENT;
        const m2m_token_secret = env.CONFIG_M2M_TOKEN_SECRET;

        const isBlacklisted = await checkEmailSender(
            env.D1_EMAIL,
            'Blacklist',
            message.from.trim().toLowerCase()
        );

        if (isBlacklisted) {
            ctx.waitUntil(notifyApp(app_endpoint, m2m_token_secret, message, 0));
            return;
        }

        const isWhitelisted = await checkEmailSender(
            env.D1_EMAIL,
            'Whitelist',
            message.from.trim().toLowerCase()
        );

        if (isWhitelisted) {
            ctx.waitUntil(notifyApp(app_endpoint, m2m_token_secret, message, 1));
            return;
        }

        const analyzeEmail = await notifyApp(app_endpoint, m2m_token_secret, message, 2);
        const isEmailLegit = (await analyzeEmail.text()).trim().toLowerCase() === 'true';

        if (email_recipient && isEmailLegit) await message.forward(email_recipient);
    }
}
