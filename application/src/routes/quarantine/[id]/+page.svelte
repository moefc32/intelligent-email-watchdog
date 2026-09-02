<script>
    import { page } from '$app/stores';
    import { ArrowLeft, Trash2 } from '@lucide/svelte';
    import ky from 'ky';
    import datePrettier from '$lib/datePrettier';

    const contents = $page.data.contents;

    async function submitDelete() {
        try {
            const { data } = await ky
                .delete('/api/quarantine', {
                    searchParams: { id: contents.id },
                })
                .json();

            quarantine_delete.close();
            toast.success('Email deleted successfully.');
        } catch (e) {
            console.error(e);
            toast.error('Error when deleting the email!');
        }
    }
</script>

<div class="flex justify-between items-end">
    <a href="/quarantine" class="btn btn-outline mt-5">
        <ArrowLeft size={16} /> Back to Quarantined Email
    </a>
    <button
        class="btn btn-error"
        on:click={() => quarantine_delete.showModal()}
    >
        <Trash2 size={16} /> Delete
    </button>
</div>

<div
    class="flex flex-1 flex-col items-start gap-3 p-3 bg-slate-500/25 max-h-[calc(100dvh-205px)] rounded-lg overflow-y-auto"
>
    <div
        class="flex flex-col items-start p-3 bg-slate-500/25 w-full rounded-lg"
    >
        <div class="flex w-full">
            <span class="w-26">Subject</span>: {contents.subject}
        </div>
        <div class="flex gap-3 w-full">
            <div class="flex flex-1 flex-col">
                <div class="flex">
                    <span class="w-26">Sender</span>: {contents.sender}
                </div>
                <div class="flex">
                    <span class="w-26">Recipient</span>: {contents.recipient}
                </div>
                <div class="flex">
                    <span class="w-26">Received at</span>: {datePrettier(
                        contents.createdAt,
                        {
                            date: true,
                            time: true,
                        },
                    )}
                </div>
            </div>
            <div class="flex flex-1 flex-col">
                <div class="flex">
                    <span class="w-26">Status</span>: {contents.status}
                </div>
                <div class="flex">
                    <span class="w-26">Reason</span>: {contents.reason}
                </div>
                <div class="flex">
                    <span class="w-26">Score</span>: {contents.score}
                </div>
            </div>
        </div>
    </div>

    {contents.content}
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
