import { text } from '@sveltejs/kit';

export async function GET() {
    const toHermes = {
        sender: '...',
        subject: '...',
        headers: '...',
        content: '...',
        senderHistory: {
            status: {
                passed: 15,
                quarantined: 6
            },
            reason: {
                legitimate: 15,
                spam: 4,
                scam: 2,
            },
            averageScore: 54.4
        }
    };

    const fromHermes = {
        message: 'The email appears to be a recruitment scam.',
        status: 'quarantined',
        reason: 'scam'
    };

    if (fromHermes?.status === 'passed') {
        return text(true);
    } else {
        return text(false);
    }
}
