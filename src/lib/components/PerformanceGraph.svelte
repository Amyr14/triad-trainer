<script lang="ts">
    import {
        Chart,
        CategoryScale,
        LinearScale,
        BarElement,
        BarController,
        Title,
        Tooltip,
        Legend,
    } from "chart.js";
    import { mistakes } from "../stores";
    import { onMount, onDestroy } from "svelte";
    import { ChordQuality, qualityLabel } from "../utils";

    let canvasPitch: HTMLCanvasElement;
    let canvasQuality: HTMLCanvasElement;
    let chartPitch: Chart | null = null;
    let chartQuality: Chart | null = null;

    // Register Chart.js components we use
    Chart.register(
        CategoryScale,
        LinearScale,
        BarElement,
        BarController,
        Title,
        Tooltip,
        Legend
    );

    let unsubscribe: () => void;

    onMount(() => {
        // Inicializar charts com dados vazios
        const ctxPitch = canvasPitch.getContext("2d")!;
        chartPitch = new Chart(ctxPitch, {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Erros por nota",
                        data: [],
                        backgroundColor: "rgba(75, 192, 192, 0.9)",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Erros por nota",
                        color: "#fff",
                    },
                    legend: { labels: { color: "#fff" } },
                    tooltip: {
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        backgroundColor: "#222",
                    },
                },
                scales: {
                    x: {
                        ticks: { color: "#ddd" },
                        grid: { color: "rgba(255,255,255,0.06)" },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#ddd", stepSize: 1 },
                        grid: { color: "rgba(255,255,255,0.06)" },
                    },
                },
            },
        });

        const ctxQuality = canvasQuality.getContext("2d")!;
        chartQuality = new Chart(ctxQuality, {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Erros por qualidade",
                        data: [],
                        backgroundColor: "rgba(255, 205, 86, 0.95)",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Erros por qualidade",
                        color: "#fff",
                    },
                    legend: { labels: { color: "#fff" } },
                    tooltip: {
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        backgroundColor: "#222",
                    },
                },
                scales: {
                    x: {
                        ticks: { color: "#ddd" },
                        grid: { color: "rgba(255,255,255,0.06)" },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#ddd", stepSize: 1 },
                        grid: { color: "rgba(255,255,255,0.06)" },
                    },
                },
            },
        });

        // Subscribe to performanceInfo and update charts on changes
        unsubscribe = mistakes.subscribe(newMistakes => {
            if (!newMistakes) return;

            // Update pitch chart
            const pitchLabels = Object.keys(newMistakes.byPitch);
            const pitchData = Object.values(newMistakes.byPitch);
            if (chartPitch) {
                chartPitch.data.labels = pitchLabels as unknown as string[];
                chartPitch.data.datasets![0].data =
                    pitchData as unknown as number[];
                chartPitch.update();
            }

            // Update quality chart
            const qualityLabels = Object.keys(newMistakes.byQuality).map(
                q => qualityLabel(q as ChordQuality) ?? String(q)
            );
            const qualityData = Object.values(newMistakes.byQuality);
            if (chartQuality) {
                chartQuality.data.labels = qualityLabels as string[];
                chartQuality.data.datasets![0].data = qualityData as number[];
                chartQuality.update();
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
        if (chartPitch) chartPitch.destroy();
        if (chartQuality) chartQuality.destroy();
    });
</script>

<div class="graphs">
    <div class="graph">
        <canvas bind:this={canvasPitch}></canvas>
    </div>
    <div class="graph">
        <canvas bind:this={canvasQuality}></canvas>
    </div>
</div>

<style>
    .graphs {
        display: flex;
        gap: 20px;
    }
    .graph {
        width: 500px;
        height: 300px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 6px;
        padding: 6px;
        background: linear-gradient(180deg, #111 0%, #1b1b1b 100%);
        color: #ddd;
    }
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
