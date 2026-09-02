<script>
    import { page } from '$app/stores';
    import { Plus, Pen, Check, Trash2 } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import ky from 'ky';
    import datePrettier from '$lib/datePrettier';

    import PageTitle from '$lib/component/PageTitle.svelte';

    let contents = $page.data.contents;

    let editContext = {
        id: '',
        address: '',
        reason: '',
    };

    function openCreate() {
        editContext = {
            id: '',
            address: '',
            reason: '',
        };

        blacklist_detail.showModal();
    }

    async function submitCreate() {
        try {
            const { data } = await ky
                .post('/api/blacklist', {
                    json: editContext,
                })
                .json();

            contents = data;

            blacklist_detail.close();
            toast.success('New address added successfully.');
        } catch (e) {
            console.error(e);
            toast.error('Error when adding new address!');
        }
    }

    async function submitUpdate() {
        try {
            const { data } = await ky
                .patch('/api/blacklist', {
                    searchParams: { address: editContext?.address },
                    json: editContext,
                })
                .json();

            contents = data;

            blacklist_detail.close();
            toast.success('Address updated successfully.');
        } catch (e) {
            console.error(e);
            toast.error('Error when updating the address!');
        }
    }

    async function submitDelete() {
        try {
            const { data } = await ky
                .delete('/api/blacklist', {
                    searchParams: { address: editContext?.address },
                })
                .json();

            contents = data;

            blacklist_delete.close();
            toast.success('Address removed successfully.');
        } catch (e) {
            console.error(e);
            toast.error('Error when removing the address!');
        }
    }
</script>

<div class="flex justify-between items-end">
    <PageTitle pageTitle={$page.data.pageTitle} />
    <button class="btn btn-success" on:click={() => openCreate()}>
        <Plus size={16} /> Create New
    </button>
</div>

<div
    class="flex flex-1 items-start p-3 bg-slate-500/25 max-h-[calc(100dvh-205px)] rounded-lg overflow-y-auto"
>
    <table class="table table-pin-rows">
        <thead>
            <tr>
                <th>Address</th>
                <th>Reason</th>
                <th>Created At</th>
                <th>Updated At</th>
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
                        <td>{item.reason || '-'}</td>
                        <td>
                            {datePrettier(item.created_at, {
                                date: true,
                                time: true,
                            })}
                        </td>
                        <td>
                            {datePrettier(item.updated_at, {
                                date: true,
                                time: true,
                            })}
                        </td>
                        <td class="w-[1%] whitespace-nowrap">
                            <button
                                class="btn btn-sm btn-warning"
                                on:click={() => {
                                    editContext = { ...item };
                                    blacklist_detail.showModal();
                                }}
                            >
                                <Pen size={12} /> Edit
                            </button>
                            <button
                                class="btn btn-sm btn-error"
                                on:click={() => {
                                    editContext = { ...item };
                                    blacklist_delete.showModal();
                                }}
                            >
                                <Trash2 size={12} /> Remove
                            </button>
                        </td>
                    </tr>
                {/each}
            {:else}
                <tr>
                    <td class="py-12 text-center" colspan="5">
                        - No blacklisted address found -
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<dialog id="blacklist_detail" class="modal">
    <div class="modal-box">
        <h3 class="text-lg font-bold">
            {editContext?.id ? 'Edit' : 'Add New'} Address
        </h3>
        <div class="flex flex-col gap-2 pt-4">
            <input
                type="text"
                class="input w-full"
                placeholder="Email address"
                readonly={editContext.id}
                bind:value={editContext.address}
            />
            <input
                type="text"
                class="input w-full"
                placeholder="Reason"
                bind:value={editContext.reason}
            />
        </div>
        <div class="modal-action">
            <button
                class="btn {editContext?.id ? 'btn-warning' : 'btn-success'}"
                disabled={!editContext.address}
                on:click={() => {
                    editContext?.id ? submitUpdate() : submitCreate();
                }}
            >
                <Check size={16} />
                {editContext?.id ? 'Save Changes' : 'Add New'}
            </button>
            <button class="btn" on:click={() => blacklist_detail.close()}>
                Cancel
            </button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>

<dialog id="blacklist_delete" class="modal">
    <div class="modal-box">
        <h3 class="text-lg font-bold">Remove Address</h3>
        <p class="py-4">Are you sure you want to remove this address?</p>
        <div class="modal-action">
            <button
                class="btn btn-error text-white"
                on:click={() => submitDelete()}
            >
                <Trash2 size={16} /> Yes, Remove
            </button>
            <button class="btn" on:click={() => blacklist_delete.close()}>
                Cancel
            </button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
