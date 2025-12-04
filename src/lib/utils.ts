import * as Tone from 'tone'

export const PITCHES = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B'
] as const

export type Pitch = typeof PITCHES[number]

export enum Interval {
    Unison = 0,
    MinorSecond = 1,
    MajorSecond = 2,
    MinorThird = 3,
    MajorThird = 4,
    PerfectFourth = 5,
    Tritone = 6,
    PerfectFifth = 7,
    MinorSixth = 8,
    MajorSixth = 9,
    MinorSeventh = 10,
    MajorSeventh = 11,
    Octave = 12,
}

export enum ChordQuality {
    Major = "",
    Minor = "m",
    Dim = "dim",
    Sus2 = "sus2",
    Sus4 = "sus4",
    Aug = "aug"
}

export const CHORD_QUALITIES = [
    ChordQuality.Major,
    ChordQuality.Minor,
    ChordQuality.Dim,
    ChordQuality.Aug,
    ChordQuality.Sus2,
    ChordQuality.Sus4
] as const

const QUALITY_LABELS = new Map<ChordQuality, string>([
    [ChordQuality.Major, "Maior"],
    [ChordQuality.Minor, "Menor"],
    [ChordQuality.Dim, "Diminuto"],
    [ChordQuality.Sus2, "Sus2"],
    [ChordQuality.Sus4, "Sus4"],
    [ChordQuality.Aug, "Aumentada"]

]);

// Mapear cada qualidade para uma triade aqui
const QUALITY_TO_TRIADS = new Map<ChordQuality, Interval[]>([
    [ChordQuality.Major, [Interval.Unison, Interval.MajorThird, Interval.PerfectFifth]],
    [ChordQuality.Minor, [Interval.Unison, Interval.MinorThird, Interval.PerfectFifth]],
    [ChordQuality.Dim, [Interval.Unison, Interval.MinorThird, Interval.Tritone]],
    [ChordQuality.Sus2, [Interval.Unison, Interval.MajorSecond, Interval.PerfectFifth]],
    [ChordQuality.Sus4, [Interval.Unison, Interval.PerfectFourth, Interval.PerfectFifth]],
    [ChordQuality.Aug, [Interval.Unison, Interval.PerfectFifth, Interval.MinorSixth]],
])

// Mapa invertido: triade (chaves como string '0,4,7') -> qualidade
const TRIAD_TO_QUALITY = new Map<string, ChordQuality>(
    Array.from(QUALITY_TO_TRIADS.entries()).map(([quality, intervals]) => [intervals.join(','), quality])
)

export async function startTone(): Promise<Tone.Sampler> {
    await Tone.start()
    Tone.getTransport().start();
    const samplerPromise: Promise<Tone.Sampler> = new Promise(resolve => {
        const sampler = new Tone.Sampler({
            urls: {
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
            },
            release: 10,
            onload: function () {
                resolve(sampler);
            },
            baseUrl: "https://tonejs.github.io/audio/salamander/",
        }).toDestination();
    });
    return samplerPromise;
}

export function qualityLabel(quality: ChordQuality) {
    return QUALITY_LABELS.get(quality);
}

export function getNthNote(root: string, n: number): string {
    if (n == 0) return root;
    const { pitch, octave } = getPitchAndOctave(root);
    const pitchPos = PITCHES.findIndex(p => p == pitch);
    const octaveTerm = (pitchPos + n) / 12;
    const newOctave = Math.max(1, octave + (octaveTerm >= 0 ? Math.floor(octaveTerm) : Math.min(Math.floor(octaveTerm), -1)));
    const newPitchPos = (pitchPos + n) % 12;
    const newPitch = PITCHES[newPitchPos < 0 ? 12 + newPitchPos : newPitchPos];
    return newPitch + newOctave.toString();
}

export function getNthNotes(root: string, n: number): string[] {
    let notes = [];
    for (let step = 0; step < n; step++) {
        const note = getNthNote(root, step);
        notes.push(note);
    }
    return notes;
}

export function isSharp(note: string) {
    const { pitch } = getPitchAndOctave(note);
    return pitch.length > 1;
}

export function getPitchAndOctave(note: string) {
    const pitch = note.slice(0, -1) as Pitch;
    const octave = parseInt(note.slice(-1));
    return { pitch, octave }
}

export function getChord(root: string, notes: string[]) {
    if (notes.length < 3) return '???';

    const { pitch: rootPitch } = getPitchAndOctave(root);
    const intervals = notes.map(n => getInterval(root, n))
    const quality = getChordQuality(intervals);
    if (typeof quality == 'undefined') return '???'
    return rootPitch + quality
}

export function genRandomChords(allowedQualities: ChordQuality[], quantity: number) {
    if (quantity <= 0) return [] as string[];
    if (!allowedQualities || allowedQualities.length === 0) return [] as string[];

    const chords: string[] = [];
    let prevChord: string | null = null;

    for (let i = 0; i < quantity; i++) {
        let chord: string;
        let attempts = 0;
        do {
            const pitchIdx = Math.floor(Math.random() * PITCHES.length);
            const qualityIdx = Math.floor(Math.random() * allowedQualities.length);
            chord = PITCHES[pitchIdx] + allowedQualities[qualityIdx];
            attempts += 1;
        } while (chord === prevChord && attempts < 50)

        chords.push(chord);
        prevChord = chord;
    }

    return chords;
}

export function getChordNotes(chord: string): string[] {
    if (!chord || chord.length === 0) return [];

    // Determina o pitch (pode ter '#')
    const { pitch, quality } = getChordPitchAndQuality(chord);
    const triad = QUALITY_TO_TRIADS.get(quality)!;
    let notesToReturn: string[] = [];

    // Procurar a menor oitava raiz (entre 2 e 4) que mantenha todas as notas no intervalo C2-C4
    for (let rootOctave = 2; rootOctave <= 4; rootOctave++) {
        const rootNote = pitch + rootOctave.toString();
        const notes = triad.map(interval => getNthNote(rootNote, interval));
        const allInRange = notes.every(n => {
            const { octave: o } = getPitchAndOctave(n);
            return o >= 2 && o <= 4;
        });
        if (!allInRange) continue;
        notesToReturn = notes;
        break;
    }

    return notesToReturn;
}

export function getChordPitchAndQuality(chord: string): { pitch: Pitch, quality: ChordQuality } {
    let pitch: Pitch = chord.charAt(0) as Pitch;
    if (chord.length > 1 && chord.charAt(1) == '#') {
        pitch = chord.slice(0, 2) as Pitch;
    }
    const quality = chord.slice(pitch.length) as ChordQuality;
    return { pitch, quality };
}

function getInterval(root: string, note: string): Interval {
    const { pitch: rootPitch } = getPitchAndOctave(root);
    const { pitch: notePitch } = getPitchAndOctave(note);
    const notePitchPos = PITCHES.findIndex(p => p == notePitch);
    const rootPitchPos = PITCHES.findIndex(p => p == rootPitch);
    const pitchDist = notePitchPos - rootPitchPos;
    const interval = pitchDist < 0 ? pitchDist + 12 : pitchDist;
    return interval;
}

function getChordQuality(intervals: Interval[]): ChordQuality | undefined {
    const sortedIntervals = [...intervals];
    sortedIntervals.sort();
    const triadKey = sortedIntervals.slice(0, 3).join(',');
    return TRIAD_TO_QUALITY.get(triadKey);
}