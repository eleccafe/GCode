// Original movable shapes. Frets are absolute; transposition raises open strings too.
// Reproducible, offline seed dataset. The MIT DB importer can replace this file.
import fs from 'node:fs';
const roots=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const pcs=[0,1,2,3,4,5,6,7,8,9,10,11];
const intervals={major:[0,4,7],m:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],sus2:[0,2,7],sus4:[0,5,7],add9:[0,4,7,14],'6':[0,4,7,9],dim:[0,3,6],aug:[0,4,8],m7b5:[0,3,6,10]};
const e={major:'022100',m:'022000','7':'020100',maj7:'021100',m7:'020000',sus2:'0244xx',sus4:'022200',add9:'024100','6':'022120',dim:'0120xx',aug:'03211x',m7b5:'012030'};
const a={major:'x02220',m:'x02210','7':'x02020',maj7:'x02120',m7:'x02010',sus2:'x02200',sus4:'x02230',add9:'x02420','6':'x02222',dim:'x0121x',aug:'x03221',m7b5:'x0101x'};
function shape(pattern,offset,mask=0){
 const frets=[...pattern].map((c,i)=>c==='x'||mask&(1<<i)?-1:Number(c)+offset),positive=frets.filter(f=>f>0),min=Math.min(...positive);
 // Group frets into a barre only when no lower or muted string interrupts its span.
 const groups=[];
 for(const fret of [...new Set(positive)].sort((a,b)=>a-b)){
  const indexes=frets.flatMap((f,i)=>f===fret?[i]:[]);const from=indexes[0],to=indexes.at(-1);
  if(fret===min&&indexes.length>1&&frets.slice(from,to+1).every(f=>f>=fret))groups.push({fret,indexes,barre:true});
  else for(const i of indexes)groups.push({fret,indexes:[i],barre:false});
 }
 if(groups.length>4)return null;
 const fingers=frets.map(()=>0),barres=[];
 groups.forEach((g,i)=>{for(const s of g.indexes)fingers[s]=i+1;if(g.barre)barres.push({fret:g.fret,from:6-g.indexes[0],to:6-g.indexes.at(-1)});});
 return {frets,fingers,baseFret:offset?min:1,barres};
}
const result={};
for(const [i,root] of roots.entries())for(const [quality,tones] of Object.entries(intervals)){
 const options=[[e[quality],(pcs[i]-4+12)%12],[a[quality],(pcs[i]-9+12)%12]].map(([pattern,offset])=>{
  for(const mask of Array.from({length:64},(_,n)=>n).sort((a,b)=>a.toString(2).replaceAll('0','').length-b.toString(2).replaceAll('0','').length)){
   const v=shape(pattern,offset,mask);if(!v)continue;
   const played=v.frets.flatMap((f,j)=>f<0?[]:[([4,9,2,7,11,4][j]+f-pcs[i]+12)%12]);
   if(tones.every(t=>played.includes(t%12))&&played.every(p=>tones.some(t=>t%12===p)))return v;
  }return null;
 }).filter(Boolean).sort((a,b)=>Math.max(...a.frets)-Math.max(...b.frets));
 if(!options.length)throw Error('Missing shape '+root+quality);
 result[root+(quality==='major'?'':quality)]={root,quality,intervals:tones,voicings:options};
}
const add=(name,frets,fingers,barres=[])=>{const positives=frets.filter(f=>f>0);const v={frets,fingers,baseFret:Math.max(...positives)<=4?1:Math.min(...positives),barres};result[name].voicings=[v,...result[name].voicings.filter(p=>p.frets.join()!==frets.join())].slice(0,3);};
add('A',[-1,0,2,2,2,0],[0,0,1,2,3,0]);
add('Am',[-1,0,2,2,1,0],[0,0,2,3,1,0]);
add('C',[-1,3,2,0,1,0],[0,3,2,0,1,0]);
add('D',[-1,-1,0,2,3,2],[0,0,0,1,3,2]);
add('Dm',[-1,-1,0,2,3,1],[0,0,0,2,3,1]);
add('E',[0,2,2,1,0,0],[0,2,3,1,0,0]);
add('Em',[0,2,2,0,0,0],[0,2,3,0,0,0]);
add('G',[3,2,0,0,0,3],[2,1,0,0,0,3]);
add('F',[1,3,3,2,1,1],[1,3,4,2,1,1],[{fret:1,from:6,to:1}]);
add('Bm',[-1,2,4,4,3,2],[0,1,3,4,2,1],[{fret:2,from:5,to:1}]);result.Bm.voicings[0].baseFret=2;
add('A7',[-1,0,2,0,2,0],[0,0,1,0,2,0]);
add('D7',[-1,-1,0,2,1,2],[0,0,0,2,1,3]);
add('E7',[0,2,0,1,0,0],[0,2,0,1,0,0]);
add('Cmaj7',[-1,3,2,0,0,0],[0,3,2,0,0,0]);
add('G7',[3,2,0,0,0,1],[3,2,0,0,0,1]);
fs.mkdirSync('src/data',{recursive:true});fs.writeFileSync('src/data/chords.json',JSON.stringify(result));
fs.mkdirSync('public',{recursive:true});
fs.writeFileSync('public/THIRD_PARTY_LICENSES.txt','GCode bundled voicings\n\nThe initial 144-chord dataset is generated from original standard movable shapes\nby scripts/generate-chords.mjs. It contains no copied third-party chord data.\n\nOptional importer: scripts/import-chords.mjs supports @tombatossals/chords-db\n0.5.1 (MIT, Copyright (c) 2016 David Rubert), and copies its complete license\nwhen the imported dataset replaces the bundled dataset.\nhttps://github.com/tombatossals/chords-db\n');
console.log(`Generated ${Object.keys(result).length} chords / ${Object.values(result).reduce((n,c)=>n+c.voicings.length,0)} voicings`);
