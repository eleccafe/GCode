import {useEffect,useState} from 'react';
import {parseChord} from '../theory/parseChord';
import {chordName} from '../theory/notes';
import type {Chord} from '../theory/types';
export function readStored<T>(key:string,fallback:T):T {try {return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
export function writeStored(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Private mode or full storage: keep the app usable. */}}
function fromUrl(){const parsed=parseChord(new URLSearchParams(location.search).get('chord')||'A');return 'error'in parsed?{root:'A',quality:'major'} as Chord:parsed;}
export function useChordState(){
 const [chord,setChord]=useState<Chord>(fromUrl);
 const [history,setHistory]=useState<string[]>(()=>{const stored=readStored<unknown>('gcode-history',[]);return Array.isArray(stored)?stored.filter((s):s is string=>typeof s==='string'&&!('error'in parseChord(s))).slice(0,10):[];});
 useEffect(()=>{const onPop=()=>setChord(fromUrl());window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop);},[]);
 useEffect(()=>{const name=chordName(chord);setHistory(old=>{const next=[name,...old.filter(n=>n!==name)].slice(0,10);writeStored('gcode-history',next);return next;});},[chord]);
 const select=(next:Chord)=>{if(chordName(next)===chordName(chord))return;const url=new URL(location.href);url.searchParams.set('chord',chordName(next));window.history.pushState({},'',url);setChord(next);};
 return {chord,select,history};
}
