<script>
    import ky from 'ky';
    import isValidEmail from '$lib/isValidEmail';

    // import Header from '$lib/component/Header.svelte';
    // import TableURL from '$lib/component/TableURL.svelte';
    // import CreateURL from '$lib/component/CreateURL.svelte';

    // export let data;

    // let { contents } = data;

    // let search = {
    //     keyword: '',
    //     loading: false,
    //     results: [],
    // };

    // async function reloadURLList() {
    //     try {
    //         const result = await ky.get('/api/url').json();
    //         contents = result.data;
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    // async function doSearch() {
    //     search.loading = true;

    //     try {
    //         const result = await ky
    //             .get('/api/url', {
    //                 searchParams: {
    //                     s: search.keyword,
    //                 },
    //             })
    //             .json();

    //         search.results = result.data;
    //     } catch (e) {
    //         console.error(e);
    //     } finally {
    //         search.loading = false;
    //     }
    // }
</script>

<main class="container flex flex-1 flex-col gap-6 mx-auto p-6">
    <Header />
</main>
