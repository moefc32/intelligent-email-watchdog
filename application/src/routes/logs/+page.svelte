<script>
    import { page } from '$app/stores';
    import { ExternalLink } from '@lucide/svelte';
    import ky from 'ky';
    import datePrettier from '$lib/datePrettier';

    import PageTitle from '$lib/component/PageTitle.svelte';

    let contents = $page.data.contents;

    async function viewLog(year, month, day) {
        contents.filter = { year, month, day };

        try {
            const { data } = await ky
                .get('/api/logs', {
                    searchParams: { year, month, day },
                })
                .json();

            contents = {
                ...contents,
                logs: data.logs,
            };
        } catch (e) {
            console.error(e);
            toast.error('Error when deleting the email!');
        }
    }
</script>

<PageTitle pageTitle={$page.data.pageTitle} />

<div class="flex flex-1 gap-3">
    <div
        class="flex flex-col p-3 bg-slate-500/25 w-80 max-h-[calc(100dvh-205px)] rounded-lg overflow-y-auto"
    >
        {#each contents.days as item, i}
            <button
                class="px-4 py-2 text-start rounded cursor-pointer {item ===
                    contents.filter.day && 'bg-white/20'}"
                on:click={() =>
                    viewLog(contents.filter.year, contents.filter.month, item)}
            >
                {contents.today.toLocaleString('en-US', {
                    month: 'long',
                })}
                {item}, {contents.filter.year}
            </button>
        {/each}
    </div>
    <div
        class="flex flex-1 items-start p-3 bg-slate-500/25 max-h-[calc(100dvh-205px)] rounded-lg overflow-y-auto"
    >
        <table class="table table-pin-rows">
            <thead>
                <tr>
                    <th class="w-25">Time</th>
                    <th>Log Item</th>
                </tr>
            </thead>
            <tbody>
                {#if contents.logs.length}
                    {#each contents.logs as item, i}
                        <tr
                            class="{i % 2 === 0
                                ? 'bg-black/5 hover:bg-black/9'
                                : 'hover:bg-black/7'} transition duration-100"
                        >
                            <td class="font-mono align-top w-25">
                                {datePrettier(item.createdAt, {
                                    time: true,
                                })}
                            </td>
                            <td class="flex flex-col gap-1">
                                <div>
                                    <div
                                        class="badge badge-sm {item.status ===
                                        'passed'
                                            ? 'badge-success'
                                            : 'badge-error'}"
                                    >
                                        Status: {item.status}
                                    </div>
                                    {#if item.reason}
                                        <div class="badge badge-sm">
                                            Reason: {item.reason}
                                        </div>
                                    {/if}
                                </div>
                                <p>{item.message}</p>
                                {#if item.quarantineId}
                                    <div>
                                        <a
                                            href={`/quarantine/${item.quarantineId}`}
                                            class="flex items-center gap-1 underline"
                                        >
                                            <ExternalLink size={14} /> View Item
                                        </a>
                                    </div>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                {:else}
                    <tr>
                        <td class="py-12 text-center" colspan="2">
                            - No recorded log -
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>
