import type {Chord,KeyContext,Quality,RelatedGroup} from './types';
import {chordName,isMinor,mod,notePc,spellInterval} from './notes';
const majorScale=[0,2,4,5,7,9,11], minorScale=[0,2,3,5,7,8,10];
const numerals=['I','II','III','IV','V','VI','VII'];
export function effectiveKey(chord:Chord,ctx:KeyContext):KeyContext {return ctx.locked?ctx:{tonic:chord.root,mode:isMinor(chord)?'minor':'major',locked:false};}
export function degreeOf(chord:Chord,key:KeyContext):string {
  const diff=mod(notePc(chord.root)-notePc(key.tonic));
  const scale=key.mode==='minor'?minorScale:majorScale;
  let index=scale.indexOf(diff),accidental='';
  if(index<0){index=scale.findIndex(n=>mod(n-1)===diff);accidental='♭';}
  let degree=numerals[index];if(isMinor(chord)) degree=degree.toLowerCase();
  return accidental+degree+(chord.quality==='dim'?'°':chord.quality==='m7b5'?'ø7':['7','maj7','m7'].includes(chord.quality)?'7':'');
}
export function getRelatedChords(chord:Chord,ctx:KeyContext):RelatedGroup[] {
  const key=effectiveKey(chord,ctx),minor=key.mode==='minor',scale=minor?minorScale:majorScale;
  const qualities:Quality[]=minor?['m','dim','major','m','m','major','major']:['major','m','m','major','major','m','dim'];
  const make=(step:number,quality:Quality,semitones=scale[step]):Chord=>({root:spellInterval(key.tonic,semitones,step),quality});
  const order=minor?[3,4,5,6,2,1,0]:[3,4,5,1,2,6,0];
  const diatonic=order.flatMap(i=>minor&&i===4?[make(i,'m'),make(i,'major')]:[make(i,qualities[i])]);
  const subs:Chord[]=[make(4,'7'),make(0,'7'),make(minor?2:2,'7',minor?3:4),make(6,'major',10),make(3,'m',5),make(minor?2:5,minor?'major':'m'),{root:key.tonic,quality:minor?'major':'m'}];
  const variants:Chord[]=(['7','maj7','m7','sus2','sus4','add9','6','dim','aug','m7b5','major','m'] as Quality[]).map(quality=>({root:chord.root,quality}));
  return (['diatonic','substitutes','variations'] as const).map((group,i)=>{const seen=new Set<string>();return {group,chords:[diatonic,subs,variants][i].filter(c=>{const id=notePc(c.root)+':'+c.quality;if(id===notePc(chord.root)+':'+chord.quality||seen.has(id))return false;seen.add(id);return true;}).slice(0,8).map(c=>({chord:c,name:chordName(c),degree:degreeOf(c,key)}))};});
}
