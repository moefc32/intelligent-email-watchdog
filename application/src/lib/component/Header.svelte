<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { ChevronDown, Eye, EyeOff, Check } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import ky from 'ky';
    import isValidEmail from '$lib/isValidEmail';

    const links = [
        { href: '/', label: 'Overview' },
        { href: '/blacklist', label: 'Blacklist' },
        { href: '/whitelist', label: 'Whitelist' },
        { href: '/quarantine', label: 'Quarantine' },
        { href: '/logs', label: 'Logs' },
    ];

    let modalProfile = false;

    let profile = {
        name: $page.data.userData.name,
        email: $page.data.userData.email,
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_missing_attribute -->
<header class="flex items-center h-12">
    <a
        href="/"
        class="flex items-center ps-12 bg-[url('/favicon.svg')] bg-left bg-no-repeat bg-contain text-xl font-semibold h-10 cursor-pointer"
    >
        {import.meta.env.VITE_APP_NAME}
    </a>
    <div class="flex items-center gap-1 ms-auto h-full">
        <div
            class="flex items-center p-1 bg-slate-500/50 h-full rounded-[100px]"
        >
            {#each links as item, i}
                <a
                    href={item.href}
                    class="inline-flex items-center px-6 h-full rounded-[100px] {$page
                        .url.pathname === item.href
                        ? 'bg-white/15'
                        : ''}"
                >
                    {item.label}
                </a>
            {/each}
        </div>

        <div class="dropdown dropdown-end ms-3">
            <div
                tabindex="0"
                role="button"
                class="flex items-center gap-1 cursor-pointer"
            >
                <div class="bg-white w-10 rounded-full overflow-hidden">
                    <img
                        src="https://gravatar.com/avatar/{$page.data
                            .hashed_email}?s=40"
                    />
                </div>
                <ChevronDown size={16} />
            </div>
            <ul
                tabindex="0"
                class="menu menu-sm dropdown-content mt-3 p-2 bg-white text-black w-32 rounded-box z-10 shadow-lg"
            >
                <li>
                    <button on:click={() => edit_profile.showModal()}>
                        Edit Account
                    </button>
                </li>
                <li>
                    <button on:click={() => doLogout()}>Logout</button>
                </li>
            </ul>
        </div>
    </div>
</header>

<dialog id="edit_profile" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box max-w-100">
        <h3 class="text-lg font-bold">Edit Account</h3>
        <div class="flex flex-col gap-2 pt-4">
            <input
                type="name"
                class="input input-bordered w-full"
                placeholder="New name"
                bind:value={profile.name}
                on:keydown={handleKeydown}
            />
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
