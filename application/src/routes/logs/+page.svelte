<script>
    import { page } from '$app/stores';
    import ky from 'ky';

    import PageTitle from '$lib/component/PageTitle.svelte';

    const contents = $page.data.contents;
</script>

<PageTitle pageTitle={$page.data.pageTitle} />

<div class="flex flex-1 gap-3">
    <div class="flex items-start p-3 bg-slate-500/25 w-[300px] rounded-lg">
        {#each contents.days as item, i}
            <button
                class="flex-1 px-4 py-2 text-start rounded cursor-pointer {item ===
                    contents.filter.date && 'bg-white/20'}"
            >
                {contents.filter.month}
                {item}, {contents.filter.year}
            </button>
        {/each}
    </div>
    <div class="flex items-start flex-1 p-3 bg-slate-500/25 rounded-lg">
        <table class="table">
            <thead>
                <tr>
                    <th class="w-[1%] whitespace-nowrap">Time</th>
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
                            <td class="w-[1%] whitespace-nowrap">
                                {datePrettier(item.createdAt, {
                                    time: true,
                                })}
                            </td>
                            <td>{item.message}</td>
                        </tr>
                    {/each}
                {:else}
                    <tr>
                        <td class="py-12 text-gray-500 text-center" colspan="2">
                            - No recorded log -
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>
