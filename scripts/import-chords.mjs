import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const source=require('@tombatossals/chords-db/lib/guitar.json');
const roots=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const pcs={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const qualities={major:['major',[0,4,7]],m:['minor',[0,3,7]],'7':['7',[0,4,7,10]],maj7:['maj7',[0,4,7,11]],m7:['m7',[0,3,7,10]],sus2:['sus2',[0,2,7]],sus4:['sus4',[0,5,7]],add9:['add9',[0,4,7,2]],'6':['6',[0,4,7,9]],dim:['dim',[0,3,6]],aug:['aug',[0,4,8]],m7b5:['m7b5',[0,3,6,10]]};
const tuning=[4,9,2,7,11,4];
const result={};
for(const root of roots) for(const [quality,[suffix,intervals]] of Object.entries(qualities)) {
 const entry=Object.values(source.chords).flat().find(c=>pcs[c.key]===pcs[root]&&c.suffix===suffix);
 if(!entry) throw Error(`Missing ${root}${quality}`);
 const voicings=entry.positions.map(p=>{
  const frets=p.frets.map(f=>f>0?f+p.baseFret-1:f);
  const barres=(p.barres||[]).map(b=>{const indexes=frets.flatMap((f,i)=>f===b+p.baseFret-1?[i]:[]);return {fret:b+p.baseFret-1,from:6-indexes[0],to:6-indexes.at(-1)};}).filter(b=>b.from>b.to);
  const fingers=p.fingers.map((n,i)=>frets[i]<=0?0:n);
  const positive=frets.filter(f=>f>0);
  return {frets,fingers,baseFret:barres.length?Math.min(...positive):Math.max(...positive)<=4?1:Math.min(...positive),barres};
 }).filter(v=>{
  const played=v.frets.flatMap((f,i)=>f>=0?[(tuning[i]+f-pcs[root]+12)%12]:[]);
  return played.every(pc=>intervals.includes(pc)) && intervals.every(pc=>played.includes(pc)) && v.frets.every((f,i)=>f<=0?v.fingers[i]===0:v.fingers[i]>=1&&v.fingers[i]<=4);
 }).slice(0,3);
 if(!voicings.length) throw Error(`No valid voicing ${root}${quality}`);
 result[root+(quality==='major'?'':quality)]={root,quality,intervals,voicings};
}
// Familiar teaching fingerings; absolute frets throughout the application.
result.A.voicings[0]={frets:[-1,0,2,2,2,0],fingers:[0,0,1,2,3,0],baseFret:1,barres:[]};
result.F.voicings[0]={frets:[1,3,3,2,1,1],fingers:[1,3,4,2,1,1],baseFret:1,barres:[{fret:1,from:6,to:1}]};
result.Bm.voicings[0]={frets:[-1,2,4,4,3,2],fingers:[0,1,3,4,2,1],baseFret:2,barres:[{fret:2,from:5,to:1}]};
fs.mkdirSync('src/data',{recursive:true});
fs.writeFileSync('src/data/chords.json',JSON.stringify(result));
const license=fs.readFileSync('node_modules/@tombatossals/chords-db/LICENSE','utf8');
fs.writeFileSync('public/THIRD_PARTY_LICENSES.txt','Guitar voicings: @tombatossals/chords-db 0.5.1\nhttps://github.com/tombatossals/chords-db\nConverted to absolute frets; invalid/incomplete positions filtered.\n\n'+license);
console.log(`${Object.keys(result).length} chords imported and validated`);
