<script lang="ts" module>
    import { mount, unmount } from "svelte";

    export async function showConfigDialog() {
        const ConfigDialog = (await import("./ConfigDialog.svelte")).default;
        const dialog = mount(ConfigDialog, {
            target: document.body,
            props: { onClose: () => unmount(dialog) },
        });
    }
</script>

<script lang="ts">
    import { configuration } from "../stores";
    import { CHORD_QUALITIES, ChordQuality, qualityLabel } from "../utils";

    let { onClose }: { onClose: () => void } = $props();

    let localConfig = {
        ...$configuration,
        allowedQualities: new Set([...$configuration.allowedQualities]),
    };

    // helper to toggle a quality in the configuration set
    function toggleQuality(q: ChordQuality) {
        const qualitiesSet = localConfig.allowedQualities;
        if (qualitiesSet.has(q)) qualitiesSet.delete(q);
        else qualitiesSet.add(q);
    }

    function onSave() {
        configuration.set(localConfig);
        onClose();
    }
</script>

<div class="modal-overlay">
    <div class="modal-content">
        <div class="header">
            <h3 class="title">Configurações</h3>
            <hr />
        </div>
        <div class="options">
            <form>
                <div class="inputGroup">
                    <input
                        bind:value={localConfig.numOfChords}
                        type="number"
                        name="num-chords"
                        required
                    />
                    <label for="num-chords">Núm. de Acordes</label>
                </div>
                <div class="inputGroup">
                    {#each CHORD_QUALITIES as quality, idx}
                        <div>
                            <input
                                type="checkbox"
                                name={idx.toString()}
                                onchange={() => toggleQuality(quality)}
                                checked={$configuration.allowedQualities.has(
                                    quality
                                )}
                            />
                            <label for={idx.toString()}>
                                {qualityLabel(quality)}
                            </label>
                        </div>
                    {/each}
                </div>
            </form>
        </div>
        <div class="footer">
            <button onclick={onClose}>Fechar</button>
            <button onclick={onSave}>Salvar</button>
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
        display: flex;
        justify-content: center;
        align-items: center;
        /* Apply the blur effect */
        backdrop-filter: blur(5px); /* Adjust the blur amount as needed */
        z-index: 99;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        height: 380px;
        width: 280px;
        background-color: #faf9f6;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 100;
    }

    .options {
        flex-basis: 80%;
    }

    .title {
        margin: 0px;
        text-align: center;
    }

    .header {
        color: black;
        flex-basis: 10%;
    }

    .footer {
        display: flex;
        justify-content: center;
        gap: 5px;
        flex-basis: 10%;
    }

    * > label {
        font-size: larger;
        color: black;
    }

    .inputGroup {
        margin: 10px 0px;
    }

    input[type="number"] {
        width: 50px;
        font-size: medium;
    }

    input[type="checkbox"] {
        width: 25px;
        height: 15px;
    }

    .header > hr {
        height: 3px;
        background-color: black;
    }
</style>
