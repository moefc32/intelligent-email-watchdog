<script>
    import '../app.css';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { Toaster } from 'svelte-sonner';

    import Header from '$lib/component/Header.svelte';

    let { children, data } = $props();

    const excludedRoutes = ['/init', '/login'];
    const isExcluded = $derived(
        excludedRoutes.some(route => $page.url.pathname.startsWith(route)),
    );

    onMount(() => {
        function handleBfcache(event) {
            if (!event.persisted) return;

            const hasSession = document.cookie.includes('__session_active=1');
            const path = window.location.pathname;

            const isAuth = data.unauthRoutes.some(r => path.startsWith(r));

            if ((!isAuth && !hasSession) || (isAuth && hasSession)) {
                window.location.reload();
            }
        }

        window.addEventListener('pageshow', handleBfcache);

        return function () {
            window.removeEventListener('pageshow', handleBfcache);
        };
    });
</script>

<svelte:head>
    <title>
        {$page.data.pageTitle && $page.data.pageTitle + ' | '}
        {import.meta.env.VITE_APP_NAME}
    </title>
</svelte:head>

{#if $page.status >= 300 || isExcluded}
    {@render children()}
{:else}
    <main class="flex flex-1 flex-col gap-6 p-6 w-full">
        <Header />
        {@render children()}
    </main>
{/if}

<Toaster
    richColors
    theme="system"
    position="bottom-right"
    toastOptions={{
        style: 'font-size: 1rem;',
    }}
/>
