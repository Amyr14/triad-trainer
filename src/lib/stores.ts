import { writable } from 'svelte/store';
import { CHORD_QUALITIES, ChordQuality, PITCHES, type Pitch } from './utils';

interface Config {
    numOfChords: number,
    allowedQualities: Set<ChordQuality>
}

interface Mistakes {
    byPitch: Record<Pitch, number>,
    byQuality: Record<ChordQuality, number>
}

export const selectedNotes = writable<string[]>([]);
export const solutionNotes = writable<string[]>([]);
export const configuration = writable<Config>({
    numOfChords: 10,
    allowedQualities: new Set(CHORD_QUALITIES)
})

function createMistakesStore() {
    const mistakesJson = localStorage.getItem('mistakes');
    let mistakes: Mistakes | null = mistakesJson ? JSON.parse(mistakesJson) : null;

    if (!mistakes) {
        const byPitch = Object.fromEntries(PITCHES.map(q => [q, 0])) as Record<Pitch, number>;
        const byQuality = Object.fromEntries(CHORD_QUALITIES.map(q => [q, 0])) as Record<ChordQuality, number>;
        localStorage.setItem('mistakes', JSON.stringify(mistakes));
        mistakes = { byPitch, byQuality };
    }

    const { subscribe, update } = writable<Mistakes>(mistakes);
    return {
        subscribe,
        increment: (pitch: Pitch, quality: ChordQuality) => {
            update(mistakes => {
                mistakes.byPitch[pitch] += 1;
                mistakes.byQuality[quality] += 1;
                const newMistakes = { ...mistakes };
                localStorage.setItem('mistakes', JSON.stringify(newMistakes));
                return newMistakes;
            })
        },
    }
}

export const mistakes = createMistakesStore();
export type SelectedNotesStore = typeof selectedNotes;