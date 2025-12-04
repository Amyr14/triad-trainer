<script lang="ts">
    import * as Tone from "tone";
    import { genRandomChords, startTone } from "./lib/utils";
    import FeedbackDisplay from "./lib/components/FeedbackDisplay.svelte";
    import Piano from "./lib/components/Piano.svelte";
    import { showConfigDialog } from "./lib/components/ConfigDialog.svelte";
    import { configuration } from "./lib/stores";
    import PerformanceGraph from "./lib/components/PerformanceGraph.svelte";

    // Constants
    let sampler: Tone.Sampler | undefined = $state();

    // Stateful variables
    let isPlaying = $state(false);
    let expectedChords: string[] = $state([]);

    async function handleStart() {
        if (!sampler) sampler = await startTone();
        const { allowedQualities, numOfChords } = $configuration;
        expectedChords = genRandomChords([...allowedQualities], numOfChords);
        isPlaying = true;
    }
</script>

<div class="appContainer">
    {#if !isPlaying}
        <div class="presentation">
            <div>
                <h1>Triad Trainer</h1>
                <p>
                    Bem-vindo ao Triad Trainer! A proposta dessa ferramenta é te
                    ajudar a praticar <a
                        href="https://www.descomplicandoamusica.com/triades/"
                        >tríades</a
                    > no teclado e piano. O Triad Trainer é configurável, você pode
                    escolher quais qualidades você quer praticar, assim como a quantidade
                    de acordes por sessão de estudo. Oferecemos também um gráfico
                    de desempenho para você identificar suas lacunas e e praticar
                    de forma mais eficiente.
                </p>
            </div>
            <div class="button-row">
                <button onclick={() => handleStart()}>Começar!</button>
                <button onclick={() => showConfigDialog()}>Configurações</button
                >
            </div>
            <div>
                <h2>Seu Desempenho</h2>
                <PerformanceGraph></PerformanceGraph>
            </div>
            <div>
                <h2>Fórmulas</h2>
                <table class="formulas-table">
                    <thead>
                        <tr>
                            <th>Qualidade</th>
                            <th>Fórmula (graus)</th>
                            <th>Intervalos (semitons)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Maior</td>
                            <td>1 - 3 - 5</td>
                            <td>0, 4, 7</td>
                        </tr>
                        <tr>
                            <td>Menor</td>
                            <td>1 - b3 - 5</td>
                            <td>0, 3, 7</td>
                        </tr>
                        <tr>
                            <td>Diminuta</td>
                            <td>1 - b3 - b5</td>
                            <td>0, 3, 6</td>
                        </tr>
                        <tr>
                            <td>Suspensa 2 (sus2)</td>
                            <td>1 - 2 - 5</td>
                            <td>0, 2, 7</td>
                        </tr>
                        <tr>
                            <td>Suspensa 4 (sus4)</td>
                            <td>1 - 4 - 5</td>
                            <td>0, 5, 7</td>
                        </tr>
                        <tr>
                            <td>Aumentada (aug)</td>
                            <td>1 - 3 - #5</td>
                            <td>0, 4, 7</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {:else}
        <FeedbackDisplay
            {sampler}
            {expectedChords}
            onFinish={() => (isPlaying = false)}
        />
        <Piano {sampler}></Piano>
    {/if}
</div>

<style>
    .appContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 100px;
    }
    .presentation {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 25px;
    }
    .button-row {
        display: flex;
        justify-content: center;
        gap: 20px;
    }
    .formulas-table {
        border-collapse: collapse;
        width: 600px;
    }
    .formulas-table th,
    .formulas-table td {
        border: 1px solid #222;
        padding: 8px 12px;
        text-align: left;
        background: #fff;
    }
    .formulas-table thead th {
        background: #f0f0f0;
        font-weight: bold;
    }
    @media (prefers-color-scheme: dark) {
        .formulas-table th,
        .formulas-table td {
            background: #1b1b1b;
            color: #ddd;
            border-color: rgba(255, 255, 255, 0.06);
        }
        .formulas-table thead th {
            background: #111;
        }
    }
</style>
