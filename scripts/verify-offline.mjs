// Runs the same musical invariants without third-party dependencies when npm is unavailable.
import {stripTypeScriptTypes} from 'node:module';
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const dir=path.resolve('.verification');fs.mkdirSync(dir,{recursive:true});
for(const filename of ['notes','parseChord','related']){
 const source=fs.readFileSync(`src/theory/${filename}.ts`,'utf8');
 const js=stripTypeScriptTypes(source).replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");
 fs.writeFileSync(path.join(dir,`${filename}.mjs`),js);
}
const {parseChord,suggestChords}=await import(pathToFileURL(path.join(dir,'parseChord.mjs')));
const {chordName,chordNotes,notePc,INTERVALS,SHARPS,FLATS}=await import(pathToFileURL(path.join(dir,'notes.mjs')));
const {getRelatedChords,degreeOf}=await import(pathToFileURL(path.join(dir,'related.mjs')));
let checks=0;const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
const ctx={tonic:'A',mode:'major',locked:false};
for(const [input,expected] of [['am','Am'],['A-','Am'],['Amin','Am'],[' c ♯ M7 ','C#maj7'],['B♭maj7','Bbmaj7'],['F#ø','F#m7b5'],['d°','Ddim'],['G / b','G/B'],['C+','Caug'],['dSus4','Dsus4']])equal(chordName(parseChord(input)),expected);
for(const input of ['','Xyz','H7','C13','A/B/C','A#x']){equal(parseChord(input).error,'알 수 없는 코드');equal(parseChord(input).suggestions.length,3);}
for(const [name,expected] of [['A',['D','E','F#m','Bm','C#m','G#dim']],['E',['A','B','C#m','F#m','G#m','D#dim']],['Bb',['Eb','F','Gm','Cm','Dm','Adim']],['Am',['Dm','Em','E','F','G','C','Bdim']]])equal(getRelatedChords(parseChord(name),ctx)[0].chords.map(c=>c.name),expected);
equal(chordNotes(parseChord('A')),['A','C#','E']);equal(chordNotes(parseChord('C#maj7')),['C#','E#','G#','B#']);equal(chordNotes(parseChord('G/B')),['G','B','D']);
equal(degreeOf(parseChord('A'),{tonic:'G',mode:'major',locked:true}),'II');
for(const root of [...SHARPS,...FLATS])for(const quality of Object.keys(INTERVALS)){
 const chord={root,quality};equal(parseChord(chordName(chord)),chord);
 equal(chordNotes(chord).map(notePc),INTERVALS[quality].map(i=>(notePc(root)+i)%12));
 for(const mode of ['major','minor'])for(const locked of [false,true])for(const group of getRelatedChords(chord,{tonic:'F',mode,locked})){
  assert(group.chords.length<=8);checks++;
  equal(new Set(group.chords.map(c=>c.name)).size,group.chords.length);
  assert(group.chords.every(c=>!c.degree.includes('undefined')));checks++;
 }
}
const data=JSON.parse(fs.readFileSync('src/data/chords.json','utf8'));equal(Object.keys(data).length,144);
fs.copyFileSync('src/data/chords.json',path.join(dir,'chords.json'));
fs.writeFileSync(path.join(dir,'voicings.mjs'),stripTypeScriptTypes(fs.readFileSync('src/data/voicings.ts','utf8')).replace("from './chords.json'","from './chords.json' with {type:'json'}").replace("from '../theory/notes'","from './notes.mjs'"));
const {getVoicings,TUNING}=await import(pathToFileURL(path.join(dir,'voicings.mjs')));
equal(getVoicings({root:'Db',quality:'m'}),getVoicings({root:'C#',quality:'m'}));
const slash=getVoicings(parseChord('G/B'));assert(slash.length>0);checks++;
for(const v of slash){const i=v.frets.findIndex(f=>f>=0);equal((TUNING[i]+v.frets[i])%12,11);}
equal(getVoicings(parseChord('C/Db')),[]);
let positions=0;
for(const [name,entry] of Object.entries(data))for(const v of entry.voicings){positions++;equal(v.frets.length,6);equal(v.fingers.length,6);const sounding=v.frets.flatMap((f,i)=>f<0?[]:[([4,9,2,7,11,4][i]+f-notePc(entry.root)+12)%12]);
 for(const tone of entry.intervals)assert(sounding.includes(tone%12),`${name} missing tone ${tone}`);
 for(const tone of sounding)assert(entry.intervals.some(t=>t%12===tone),`${name} invalid tone ${tone}`);
 v.frets.forEach((f,i)=>{assert(f>0?v.fingers[i]>=1&&v.fingers[i]<=4:v.fingers[i]===0,`${name} fingers`);checks++;if(f>0)assert(f>=v.baseFret&&f<v.baseFret+5,`${name} window`);});
 for(const b of v.barres){equal(v.fingers[6-b.from],1);equal(v.fingers[6-b.to],1);for(let s=b.to;s<=b.from;s++)assert(v.frets[6-s]>=b.fret,`${name} barre obstruction`);}
}
equal(suggestChords('Xyz').length,3);
console.log(`PASS: ${checks} assertions; 144 chords, ${positions} voicings; parsing, spelling, related chords and fingering invariants.`);
