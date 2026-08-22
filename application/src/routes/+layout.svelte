<script>
    import '../app.css';
    import { onMount } from 'svelte';
    import { Toaster } from 'svelte-sonner';

    let { children, data } = $props();

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
        {import.meta.env.VITE_APP_NAME}
    </title>
</svelte:head>

{@render children()}

<Toaster
    richColors
    theme="system"
    position="bottom-right"
    toastOptions={{
        style: 'font-size: 1rem;',
    }}
/>
