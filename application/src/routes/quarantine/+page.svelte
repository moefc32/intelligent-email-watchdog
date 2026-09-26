<script>
    import { page } from '$app/stores';
    import { Eye, Trash2 } from '@lucide/svelte';
    import ky from 'ky';
    import datePrettier from '$lib/datePrettier';

    import PageTitle from '$lib/component/PageTitle.svelte';

    let contents = $page.data.contents;

    let editContext = {
        id: '',
    };

    async function submitDelete() {
        try {
            const { data } = await ky
                .delete('/api/quarantine', {
                    searchParams: { id: editContext?.id },
                })
                .json();

            contents = data;

            quarantine_delete.close();
            toast.success('Email deleted successfully.');
        } catch (e) {
            console.error(e);
            toast.error('Error when deleting the email!');
        }
    }
</script>

<PageTitle pageTitle={$page.data.pageTitle} />

<div
    class="flex flex-1 items-start p-3 bg-slate-500/25 max-h-[calc(100dvh-205px)] rounded-lg overflow-y-auto"
>
    <table class="table table-pin-rows">
        <thead>
            <tr>
                <th>Sender</th>
                <th>Subject</th>
                <th>Received At</th>
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
                        <td>{item.sender}</td>
                        <td>{item.subject}</td>
                        <td>
                            {datePrettier(item.createdAt, {
                                date: true,
                                time: true,
                            })}
                        </td>
                        <td class="w-[1%] whitespace-nowrap">
                            <a
                                href={`/quarantine/${item.id}`}
                                class="btn btn-sm btn-primary"
                            >
                                <Eye size={12} /> View
                            </a>
                            <button
                                class="btn btn-sm btn-error"
                                on:click={() => {
                                    editContext.id = item.id;
                                    quarantine_delete.showModal();
                                }}
                            >
                                <Trash2 size={12} /> Delete
                            </button>
                        </td>
                    </tr>
                {/each}
            {:else}
                <tr>
                    <td class="py-12 text-center" colspan="4">
                        - No quarantined item found -
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<dialog id="quarantine_delete" class="modal">
    <div class="modal-box">
        <h3 class="text-lg font-bold">Delete Email</h3>
        <p class="py-4">Are you sure you want to delete this email?</p>
        <div class="modal-action">
            <button
                class="btn btn-error text-white"
                on:click={() => submitDelete()}
            >
                <Trash2 size={16} /> Yes, Delete
            </button>
            <button class="btn" on:click={() => quarantine_delete.close()}>
                Cancel
            </button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
