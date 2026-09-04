import { VITE_APP_NAME } from '$env/static/private';
import { json, text } from '@sveltejs/kit';
import modelLogs from '$lib/server/db/model/logs';
import modelQuarantine from '$lib/server/db/model/quarantine';
import { BearerError, bearerVerify } from '$lib/server/bearerVerify';
import callHermes from '$lib/server/callHermes';

// process request sent by the worker

export async function POST({ request }) {
    const {
        sender,
        recipient,
        status,
        subject,
        headers,
        content,
    } = await request.json();

    try {
        bearerVerify(request.headers.get('authorization'));

        const normalizedStatus = status.toLowerCase();

        if (normalizedStatus === 'blacklisted') {
            await modelQuarantine.createData({
                sender,
                recipient,
                status: normalizedStatus,
                message: 'An email thrown directly to quarantine.',
                reason: `Sender's address is blacklisted.`,
                subject,
                headers,
                content,
            });

            return text('ok');
        }

        if (normalizedStatus === 'whitelisted') {
            await modelLogs.createData({
                sender,
                recipient,
                status: normalizedStatus,
                message: 'An email passed directly to recipient.',
                reason: `Sender's address is whitelisted.`,
            });

            return text('ok');
        }

        const result = await modelLogs.getBySender(sender);

        const interpretEmail = await callHermes({
            model: 'hermes-agent',
            messages: [
                {
                    role: 'user',
                    content: JSON.stringify({
                        sender,
                        subject,
                        headers,
                        content,
                        senderHistory: {
                            status: result.status,
                            reason: result.reason,
                            averageScore: result.averageScore,
                        }
                    }),
                },
            ],
            stream: false,
        });

        console.log(interpretEmail);

        // expected response
        const fromHermes = {
            status: 'quarantined',
            message: 'The email appears to be a recruitment scam.',
            reason: 'scam'
        };

        if (fromHermes?.status === 'passed') {
            await modelLogs.createData({
                sender,
                recipient,
                status: fromHermes.status,
                message: fromHermes.message,
                reason: fromHermes.reason,
            });

            return text(true);
        } else {
            await modelQuarantine.createData({
                sender,
                recipient,
                status: fromHermes.status,
                message: fromHermes.message,
                reason: fromHermes.reason,
                subject,
                headers,
                content,
            });

            return text(false);
        }
    } catch (e) {
        console.error(e);

        if (e instanceof BearerError)
            return json({
                application: VITE_APP_NAME,
                message: 'Unauthorized',
            }, {
                status: 401,
            });

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}
