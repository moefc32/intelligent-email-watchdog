<script>
    import { page } from '$app/stores';
    import { Pen, Trash2 } from '@lucide/svelte';
    import ky from 'ky';
    import datePrettier from '$lib/datePrettier';

    import PageTitle from '$lib/component/PageTitle.svelte';

    const contents = $page.data.contents;
</script>

<PageTitle pageTitle={$page.data.pageTitle} />

<div class="flex items-start flex-1 p-3 bg-slate-500/25 rounded-lg">
    <table class="table">
        <thead>
            <tr>
                <th>Address</th>
                <th>Created At</th>
                <th class="w-[1%] whitespace-nowrap">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#if contents.length}
                {#each contents as item, i}
                    <tr
                        class="{i % 2 === 0
                            ? 'bg-black/5 hover:bg-black/9'
                            : 'hover:bg-black/7'} transition duration-100"
                    >
                        <td>{item.address}</td>
                        <td>
                            {datePrettier(item.created_at, {
                                date: true,
                                time: true,
                            })}
                        </td>
                        <td class="w-[1%] whitespace-nowrap">
                            <button class="btn btn-sm btn-warning">
                                <Pen size={12} /> Edit
                            </button>
                            <button class="btn btn-sm btn-error">
                                <Trash2 size={12} /> Delete
                            </button>
                        </td>
                    </tr>
                {/each}
            {:else}
                <tr>
                    <td class="py-12 text-gray-500 text-center" colspan="3">
                        - No whitelisted address found -
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>
