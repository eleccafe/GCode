import type { Chord, Quality } from './types';
export const SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const FLATS = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const NATURAL: Record<string,number> = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
export const INTERVALS: Record<Quality,number[]> = {major:[0,4,7],m:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],sus2:[0,2,7],sus4:[0,5,7],add9:[0,4,7,14],'6':[0,4,7,9],dim:[0,3,6],aug:[0,4,8],m7b5:[0,3,6,10]};
export const mod = (n:number) => ((n%12)+12)%12;
export function notePc(note:string):number {return mod(NATURAL[note[0]] + [...note.slice(1)].reduce((n,c)=>n+(c==='#'?1:-1),0));}
export function prefersFlats(root:string, minor=false) {return (minor?['D','G','C','F','Bb','Eb','Ab']:['F','Bb','Eb','Ab','Db','Gb','Cb']).includes(root) || root.includes('b');}
export function noteName(pc:number, flats=false) {return (flats?FLATS:SHARPS)[mod(pc)];}
export function spellInterval(root:string, semitones:number, steps:number) {
  const letters='CDEFGAB'; const letter=letters[(letters.indexOf(root[0])+steps)%7];
  let delta=mod(notePc(root)+semitones-NATURAL[letter]); if(delta>6) delta-=12;
  return letter+(delta>0?'#'.repeat(delta):'b'.repeat(-delta));
}
export function chordName(chord:Chord) {return chord.root+(chord.quality==='major'?'':chord.quality)+(chord.bass?'/'+chord.bass:'');}
export function isMinor(chord:Chord) {return ['m','m7','m7b5','dim'].includes(chord.quality);}
export function chordNotes(chord:Chord) {
  const steps = chord.quality==='sus2'?[0,1,4]:chord.quality==='sus4'?[0,3,4]:chord.quality==='add9'?[0,2,4,1]:chord.quality==='6'?[0,2,4,5]:[0,2,4,6];
  const notes=INTERVALS[chord.quality].map((v,i)=>spellInterval(chord.root,v,steps[i]));
  if(chord.bass && !notes.some(n=>notePc(n)===notePc(chord.bass!))) notes.push(chord.bass);
  return notes;
}
