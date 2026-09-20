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
                    role: 'system',
                    content: `
Analyze the incoming email for VARIA email protection.
Decide whether the email should be "passed" or "quarantined" based on the available information.
Return ONLY valid JSON in this format:

{
    "status": "passed" | "quarantined",
    "message": "brief reasoning",
    "reason": "scam" | "spam" | null,
    "score": "your score, given 100 is the most legitimate while lower score is less"
}
        `,
                },
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

        let fromHermes;

        try {
            fromHermes = JSON.parse(
                interpretEmail?.choices[0]?.message?.content
            );
        } catch {
            fromHermes = {
                status: 'quarantined',
                message: 'Unable to interpret the email safely.',
                reason: 'unknown',
                score: 0,
            };
        }

        if (fromHermes?.status === 'passed') {
            await modelLogs.createData({
                sender,
                recipient,
                status: fromHermes.status,
                message: fromHermes.message,
                reason: fromHermes.reason,
                score: fromHermes.score,
            });

            return text(true);
        } else {
            await modelQuarantine.createData({
                sender,
                recipient,
                status: fromHermes.status,
                message: fromHermes.message,
                reason: fromHermes.reason,
                score: fromHermes.score,
                subject,
                headers: JSON.stringify(headers),
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
