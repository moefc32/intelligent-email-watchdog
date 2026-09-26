<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import * as echarts from 'echarts';

    const contents = $page.data.contents;

    let chartCanvas;
    let currentTime = $state(new Date());
    let greeting = $derived.by(() => {
        const hours = currentTime.getHours();
        const isNight = hours < 5 || hours >= 21;

        if (isNight) return 'Good night';
        if (hours < 12) return 'Good morning';
        if (hours < 17) return 'Good afternoon';

        return 'Good evening';
    });

    onMount(() => {
        const chart = echarts.init(chartCanvas, 'dark');
        const statuses = [
            ...new Set(
                contents.chartData.flatMap(item =>
                    Object.keys(item).filter(key => key !== 'date'),
                ),
            ),
        ];

        chart.setOption({
            responsive: true,
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: statuses,
            },
            grid: {
                left: 30,
                right: 30,
                top: 48,
                bottom: 64,
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: contents.chartData.map(item => item.date),
            },
            yAxis: {
                type: 'value',
            },
            series: statuses.map(status => ({
                name: status,
                type: 'line',
                data: contents.chartData.map(item => item[status] ?? 0),
                smooth: true,
            })),
        });

        function handleResize() {
            chart.resize();
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        };
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
            <span class="text-3xl">{contents.totalQuarantined}</span>
        </div>
    </div>
</div>

<div class="bg-slate-500/25 h-[calc(100dvh-340px)] rounded-lg overflow-hidden">
    <div bind:this={chartCanvas} class="w-full h-full"></div>
</div>
