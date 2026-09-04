import modelLogs from '$lib/server/db/model/logs';
import modelQuarantine from '$lib/server/db/model/quarantine';
import D1 from '$lib/server/db/D1';

export async function load({ parent }) {
    const pageTitle = 'Overview';
    const { access_token, userData, hashed_email } = await parent();

    const endTime = new Date();
    const timeWindow = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    const logsData = await modelLogs.getByTime(timeWindow);
    const totalQuarantined = await modelQuarantine.getTotalItem();
    const summaryD1 = await D1.getSummary();

    const activity = {};

    for (const log of logsData) {
        const date = new Date(log.createdAt)
            .toISOString().slice(0, 10);

        activity[date] ??= {};
        activity[date][log.status] ??= 0;
        activity[date][log.status]++;
    }

    const chartData = Object.entries(activity).map(
        ([date, statuses]) => ({
            date,
            ...statuses,
        })
    );

    return {
        pageTitle,
        access_token,
        userData,
        hashed_email,
        contents: {
            chartData,
            totalQuarantined,
            summaryD1,
        },
    };
}
