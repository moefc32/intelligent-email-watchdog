import { checkEmailBlacklist } from './query.js';

export default {
    async email(message, env, ctx) {
        const email_recipient = env.CONFIG_EMAIL_RECIPIENT;
        const blocked = await checkEmailBlacklist(
            env.D1_EMAIL,
            message.from.trim().toLowerCase()
        );

        if (blocked) return;
        if (email_recipient) await message.forward(email_recipient);
    }
}
