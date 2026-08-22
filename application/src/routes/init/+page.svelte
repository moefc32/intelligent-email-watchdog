<script>
    import { goto } from '$app/navigation';
    import { Eye, EyeOff, Check } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import ky from 'ky';
    import isValidEmail from '$lib/isValidEmail';

    let register = {
        email: '',
        password: '',
        loading: false,
    };

    let showPassword = false;

    async function handleKeydown(event) {
        if (event.key === 'Enter' && register.email && register.password) {
            doRegister();
        }
    }

    async function doRegister() {
        try {
            register.loading = true;
            if (!isValidEmail(register.email)) throw new Error();

            await ky.put('/api/auth', {
                json: register,
            });

            toast.success('Site initialization completed, you may now log in.');
            await goto('/login', { invalidateAll: true });
        } catch (e) {
            register.loading = false;
            console.error(e);
            toast.error(
                'Register failed, please check all data and try again!',
            );
        }
    }
</script>

<main class="flex flex-1 justify-center items-center p-6">
    <div class="card bg-gray-700 shadow-xl w-full max-w-80">
        <div class="card-body flex flex-col gap-3">
            <h1 class="text-3xl text-center">
                {import.meta.env.VITE_APP_NAME}
            </h1>

            <p class="text-center opacity-70">
                Please register an account before you can use this application
            </p>

            <input
                type="email"
                class="input input-bordered w-full"
                placeholder="Email"
                bind:value={register.email}
                on:keydown={handleKeydown}
            />

            <div class="join w-full">
                <input
                    type={showPassword ? 'text' : 'password'}
                    class="join-item input input-bordered w-full"
                    placeholder="Password"
                    bind:value={register.password}
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

            <button
                class="btn btn-primary mt-2 flex gap-2"
                title="Register new account"
                disabled={!register.email ||
                    !isValidEmail(register.email) ||
                    !register.password ||
                    register.loading}
                on:click={() => doRegister()}
            >
                {#if register.loading}
                    <span class="loading loading-spinner loading-xs"></span>
                    Loading...
                {:else}
                    <Check size={14} /> Register
                {/if}
            </button>
        </div>
    </div>
</main>
