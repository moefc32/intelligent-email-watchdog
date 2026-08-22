<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Key, LogOut, Eye, EyeOff, Check } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import ky from 'ky';
    import isValidEmail from '$lib/isValidEmail';

    let modalProfile = false;

    let profile = {
        email: $page.data.user_email,
        password: '',
    };

    let showPassword = false;

    async function updateProfile() {
        try {
            if (!isValidEmail(profile.email)) throw new Error();

            await ky.patch('/api/auth', {
                json: profile,
            });

            profile.password = '';

            toast.success('Account info updated successfully.');
            await goto('/', { invalidateAll: true });
        } catch (e) {
            console.error(e);
            toast.error('Update login account info failed, please try again!');
        }
    }

    async function doLogout() {
        try {
            await ky.delete('/api/auth');

            toast.success('You are now logged out.');
            await goto('/login', { invalidateAll: true });
        } catch (e) {
            console.error(e);
            toast.error('Logout failed, please try again!');
        }
    }
</script>

<header class="navbar bg-gray-700 px-3 rounded-lg shadow-xl">
    <div class="flex">
        <a
            href="/"
            class="flex items-center ps-10 bg-[url('/favicon.svg')] bg-left bg-no-repeat bg-contain text-xl font-semibold h-8 cursor-pointer"
        >
            {import.meta.env.VITE_APP_NAME}
        </a>
    </div>
    <div class="flex gap-1 ms-auto">
        <button
            class="btn btn-outline btn-sm"
            title="Edit login account"
            on:click={() => edit_profile.showModal()}
        >
            <Key size={14} />
            <span class="hidden md:inline">Edit Account</span>
        </button>
        <button
            class="btn btn-primary btn-sm"
            title="Logout from application"
            on:click={() => doLogout()}
        >
            <LogOut size={14} />
            <span class="hidden md:inline">Logout</span>
        </button>
    </div>
</header>

<dialog id="edit_profile" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box max-w-100">
        <h3 class="text-lg font-bold">Edit Account</h3>
        <div class="flex flex-col gap-2 pt-4">
            <input
                type="email"
                class="input input-bordered w-full"
                placeholder="New email"
                bind:value={profile.email}
                on:keydown={handleKeydown}
            />
            <div class="join w-full">
                <input
                    type={showPassword ? 'text' : 'password'}
                    class="join-item input input-bordered w-full"
                    placeholder="New password"
                    bind:value={profile.password}
                    on:keydown={handleKeydown}
                />
                <button
                    type="button"
                    class="join-item btn btn-outline border-gray-500"
                    title={showPassword
                        ? 'Click to hide password'
                        : 'Click to show password'}
                    on:click={() => (showPassword = !showPassword)}
                >
                    {#if showPassword}
                        <EyeOff size={18} />
                    {:else}
                        <Eye size={18} />
                    {/if}
                </button>
            </div>
        </div>
        <div class="modal-action mt-6">
            <form method="dialog">
                <button class="btn">Cancel</button>
                <button
                    class="btn btn-success"
                    disabled={!profile.email || !isValidEmail(profile.email)}
                    on:click={() => updateProfile()}
                >
                    <Check size={14} /> Save
                </button>
            </form>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
