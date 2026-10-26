import { chordName, SHARPS, FLATS, INTERVALS } from './notes';
import type { Chord, ParseError, Quality } from './types';
const aliases:Record<string,Quality>={'':'major',major:'major',maj:'major',m:'m',min:'m',minor:'m','-':'m','7':'7',maj7:'maj7',m7:'m7',min7:'m7','-7':'m7',sus2:'sus2',sus4:'sus4',sus:'sus4',add9:'add9','6':'6',dim:'dim','°':'dim',aug:'aug','+':'aug',m7b5:'m7b5',min7b5:'m7b5','ø':'m7b5','ø7':'m7b5'};
export const chordCandidates=[...new Set([...SHARPS,...FLATS])].flatMap(root=>(Object.keys(INTERVALS) as Quality[]).map(quality=>chordName({root,quality})));
function distance(a:string,b:string) {let row=Array.from({length:b.length+1},(_,i)=>i); for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+Number(a[i-1]!==b[j-1]));row=next;}return row[b.length];}
export function suggestChords(input:string, count=3) {const s=input.toLowerCase().trim();return [...chordCandidates].sort((a,b)=>distance(s,a.toLowerCase())-distance(s,b.toLowerCase()) || a.length-b.length || a.localeCompare(b)).slice(0,count);}
export function parseChord(input:string):Chord|ParseError {
  const clean=input.replace(/\s/g,'').replace(/♯/g,'#').replace(/♭/g,'b').replace(/M7/g,'maj7');
  const match=/^([a-g])([#b]?)([^/]*)(?:\/([a-g])([#b]?))?$/i.exec(clean);
  if(match){const quality=aliases[match[3].toLowerCase()];if(quality) return {root:match[1].toUpperCase()+match[2].toLowerCase(),quality,...(match[4]?{bass:match[4].toUpperCase()+match[5].toLowerCase()}: {})};}
  return {error:'알 수 없는 코드',suggestions:suggestChords(clean)};
}
