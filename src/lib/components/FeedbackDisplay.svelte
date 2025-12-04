<script lang="ts">
    import {
        getChord,
        getChordNotes,
        getChordPitchAndQuality,
        getPitchAndOctave,
    } from "../utils";
    import { mistakes, selectedNotes, solutionNotes } from "../stores";
    import { Sampler } from "tone";

    interface Props {
        sampler: Sampler | undefined;
        expectedChords: string[];
        onFinish: () => void;
    }

    let { sampler, expectedChords, onFinish }: Props = $props();
    const rounds = expectedChords.length;
    let currentRound = $state(1);
    let chordToBePlayed = $state(expectedChords.pop());

    let playedChord = $derived.by(() => {
        if ($selectedNotes.length == 0) return "Inválido";
        return getChord($selectedNotes[0], $selectedNotes);
    });

    let answerState: "correct" | "incorrect" | "neutral" = $state("neutral");

    function verifySolution() {
        sampler!.triggerAttackRelease([...$selectedNotes], "2n");
        if (playedChord == chordToBePlayed) answerState = "correct";
        else {
            const { pitch, quality } = getChordPitchAndQuality(
                chordToBePlayed!
            );
            mistakes.increment(pitch, quality);
            answerState = "incorrect";
        }
        setTimeout(() => {
            selectedNotes.set([]);
            if (answerState != "incorrect") {
                chordToBePlayed = expectedChords.pop();
                currentRound += 1;
            }
            if (currentRound > rounds) {
                onFinish();
                return;
            }
            answerState = "neutral";
        }, 2000);
    }

    function seeSolution() {
        const notes = getChordNotes(chordToBePlayed as string);
        solutionNotes.set(notes);
        setTimeout(() => {
            solutionNotes.set([]);
        }, 2000);
    }
</script>

<div class="container">
    <div
        class="chordsDisplay"
        class:correctAnswer={answerState == "correct"}
        class:incorrectAnswer={answerState == "incorrect"}
    >
        <div class="roundCounter">Rodada {currentRound}/{rounds}</div>
        <span>{chordToBePlayed}</span>
        <span>{answerState != "neutral" ? playedChord : "?"}</span>
    </div>
    <div class="buttonContainer">
        <button onclick={verifySolution}>Verificar</button>
        <button onclick={seeSolution}>Ver solução</button>
    </div>
</div>

<style>
    .container {
        width: 370px;
        height: 270px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .chordsDisplay {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex-grow: 7;
        flex-basis: 0%;
        justify-content: center;
        align-items: center;
        font-family: "Courier New", monospace;
        font-size: 30px;
        font-weight: bold;
        color: black;
        background-color: #f2f0ef;
        border: 10px solid black;
        border-radius: 15px;
        box-shadow: inset 0px 0px 5px 4px rgba(0, 0, 0, 0.5);
    }
    .buttonContainer {
        display: flex;
        gap: 2%;
        justify-content: center;
    }
    .buttonContainer > button {
        flex-grow: 1;
        flex-basis: 0%;
    }
    .roundCounter {
        flex-basis: 25%;
        font-size: 70%;
    }
    .correctAnswer {
        box-shadow: inset 0px 0px 6px 6px rgba(0, 255, 0, 0.55);
    }
    .incorrectAnswer {
        box-shadow: inset 0px 0px 6px 6px rgba(255, 0, 0, 0.55);
    }
</style>
