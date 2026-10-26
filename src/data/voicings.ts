import data from './chords.json';
import {notePc,INTERVALS} from '../theory/notes';
import type {Chord,Voicing} from '../theory/types';
export const TUNING=[40,45,50,55,59,64];
const entries=Object.values(data);
export function getVoicings(chord:Chord):Voicing[] {
 const entry=entries.find(e=>notePc(e.root)===notePc(chord.root)&&e.quality===chord.quality);
 if(!entry)return [];
 if(!chord.bass)return entry.voicings;
 const bass=notePc(chord.bass), tones=INTERVALS[chord.quality].map(i=>(i+notePc(chord.root))%12), seen=new Set<string>();
 return entry.voicings.flatMap(v=>v.frets.flatMap((f,i)=>{
  if(f<0||(TUNING[i]+f)%12!==bass)return [];
  const frets=v.frets.map((n,j)=>j<i?-1:n),fingers=v.fingers.map((n,j)=>j<i?0:n);
  const sounding=frets.flatMap((n,j)=>n<0?[]:[(TUNING[j]+n)%12]);
  const id=frets.join(',');if(!tones.every(t=>sounding.includes(t))||seen.has(id))return [];seen.add(id);
  return [{...v,frets,fingers,barres:v.barres.map(b=>({...b,from:Math.min(b.from,6-i)})).filter(b=>b.from>b.to)}];
 })).slice(0,3);
}
