<script lang="ts">
    import * as Tone from "tone";
    import { getNthNotes, isSharp } from "../utils";
    import { selectedNotes, solutionNotes } from "../stores";

    let { sampler }: { sampler: Tone.Sampler | undefined } = $props();

    const pianoRoot = "C2";
    const pianoNotes = getNthNotes(pianoRoot, 25);

    function toggleNote(note: string, index: number) {
        selectedNotes.update(arr => {
            if (arr.includes(note)) return arr.filter(x => x !== note);
            if (arr.length == 3) return arr; // Only allow triads
            sampler!.triggerAttack(note, Tone.now());

            // Insert note in array keeping order by keyboard index
            const insertPos = arr.findIndex(
                n => pianoNotes.findIndex(p => p == n) > index
            );
            if (insertPos == -1) return [...arr, note];
            const copy = [...arr];
            copy.splice(insertPos, 0, note);
            return copy;
        });
    }

    function releaseNote(note: string) {
        sampler!.triggerRelease(note);
    }
</script>

<div class="piano">
    {#each pianoNotes as note, index}
        <button
            type="button"
            class={isSharp(note) ? "black-key" : "white-key"}
            class:selected={$selectedNotes.includes(note)}
            class:solution={$solutionNotes.includes(note)}
            onmousedown={() => toggleNote(note, index)}
            onmouseup={() => releaseNote(note)}
            onmouseleave={() => releaseNote(note)}
        >
            {note}
        </button>
    {/each}
</div>

<style>
    .piano {
        display: flex;
        justify-content: center;
        border: solid 20px black;
        border-radius: 20px;
    }
    .white-key,
    .black-key {
        position: relative; /* needed so ::after overlay is positioned correctly */
        -webkit-tap-highlight-color: transparent;
    }
    .white-key {
        border: 1px solid black;
        width: 100px;
        height: 400px;
        background-color: white;
        color: black;
    }
    .black-key {
        background-color: black;
        color: white;
        width: 60px;
        height: 250px;
        margin-left: -30px;
        margin-right: -30px;
        z-index: 1;
    }
    .white-key.selected::after,
    .black-key.selected::after,
    .white-key.solution::after,
    .black-key.solution::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: 2px;
        transition:
            background-color 120ms ease,
            opacity 120ms ease;
    }
    .white-key.selected::after {
        background-color: rgba(0, 200, 0, 0.35);
    }
    .black-key.selected::after {
        background-color: rgba(0, 220, 0, 0.38);
    }
    .white-key.solution::after {
        background-color: rgba(212, 175, 55, 0.35);
    }
    .black-key.solution::after {
        background-color: rgba(212, 175, 55, 0.4);
    }
    .white-key.selected.solution::after {
        background-color: rgba(0, 200, 0, 0.35);
    }
    .black-key.selected.solution::after {
        background-color: rgba(0, 220, 0, 0.38);
    }
</style>
