export type Note = string;
export type Quality = 'major' | 'm' | '7' | 'maj7' | 'm7' | 'sus2' | 'sus4' | 'add9' | '6' | 'dim' | 'aug' | 'm7b5';
export type Chord = {root: Note; quality: Quality; bass?: Note};
export type ParseError = {error: string; suggestions: string[]};
export type KeyContext = {tonic: Note; mode: 'major' | 'minor'; locked: boolean};
export type RelatedChord = {chord: Chord; name: string; degree: string};
export type RelatedGroup = {group: 'diatonic' | 'substitutes' | 'variations'; chords: RelatedChord[]};
export type Voicing = {frets: number[]; fingers: number[]; baseFret: number; barres: {fret:number; from:number; to:number}[]};
