<script>
    import { page } from '$app/stores';

    const contents = $page.data.contents;

    let currentTime = $state(new Date());
    let greeting = $derived.by(() => {
        const hours = currentTime.getHours();
        const isNight = hours < 5 || hours >= 21;

        if (isNight) return 'Good night';
        if (hours < 12) return 'Good morning';
        if (hours < 17) return 'Good afternoon';

        return 'Good evening';
    });
</script>

<section class="mt-6 font-semibold text-3xl">
    {greeting}, <span class="text-slate-400">{$page.data.userData.name}</span>
</section>

<div class="flex items-center gap-3">
    <div
        class="flex flex-2 gap-3 py-3 bg-blue-500/65 text-white border-1 border-blue-600 rounded-lg"
    >
        <div class="flex flex-1 flex-col gap-1 px-6 py-3 border-gray-200">
            <span class="text-sm">Blacklisted Address</span>
            <span class="text-3xl">{contents.summaryD1.Blacklist}</span>
        </div>
        <div
            class="flex flex-1 flex-col gap-1 px-6 py-3 border-l border-gray-200"
        >
            <span class="text-sm">Whitelisted Address</span>
            <span class="text-3xl">{contents.summaryD1.Whitelist}</span>
        </div>
    </div>
    <div
        class="flex flex-1 gap-3 py-3 bg-red-500/65 text-white border-1 border-red-600 rounded-lg"
    >
        <div class="flex flex-1 flex-col gap-1 px-6 py-3 border-gray-200">
            <span class="text-sm">Quarantined Email</span>
            <span class="text-3xl">{0}</span>
        </div>
    </div>
</div>

<div class="flex items-start flex-1 p-6 bg-slate-500/25 rounded-lg"></div>
