import { get, writable, type Updater, type Writable } from 'svelte/store';
import { CHORD_QUALITIES, ChordQuality, PITCHES, type Pitch } from './utils';

interface Config {
    numOfChords: number,
    allowedQualities: ChordQuality[]
}

interface Mistakes {
    byPitch: Record<Pitch, number>,
    byQuality: Record<ChordQuality, number>
}

export const selectedNotes = writable<string[]>([]);
export const solutionNotes = writable<string[]>([]);

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

function createConfigStore(): Writable<Config> {
    const configJson = localStorage.getItem('config');
    let config: Config | null = configJson ? JSON.parse(configJson) : null;
    if (!config) {
        config = {
            numOfChords: 10,
            allowedQualities: [...CHORD_QUALITIES]
        }
    }
    const configStore = writable<Config>(config);
    return {
        ...configStore,
        update: (updater: Updater<Config>) => {
            configStore.update(updater);
            const newConfig = get(configStore);
            localStorage.setItem('config', JSON.stringify(newConfig));
            return newConfig;
        },
        set: (newConfig: Config) => {
            configStore.set(newConfig);
            localStorage.setItem('config', JSON.stringify(get(configStore)));
        }
    }
}

export const mistakes = createMistakesStore();
export const config = createConfigStore();
export type SelectedNotesStore = typeof selectedNotes;