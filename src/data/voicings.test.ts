import {it,expect} from 'vitest';
import data from './chords.json';
import {getVoicings,TUNING} from './voicings';
import {notePc,INTERVALS} from '../theory/notes';
import type {Quality} from '../theory/types';
it('provides 144 chords with 1–3 complete and valid voicings',()=>{
 expect(Object.keys(data)).toHaveLength(144);
 for(const entry of Object.values(data)){
  expect(entry.voicings.length).toBeGreaterThanOrEqual(1);expect(entry.voicings.length).toBeLessThanOrEqual(3);
  for(const v of entry.voicings){expect(v.frets).toHaveLength(6);expect(v.fingers).toHaveLength(6);
   const played=v.frets.flatMap((f,i)=>f<0?[]:[(TUNING[i]+f-notePc(entry.root)+12)%12]),intervals=INTERVALS[entry.quality as Quality].map(i=>i%12);
   expect(new Set(played)).toEqual(new Set(intervals));
   v.frets.forEach((f,i)=>{if(f>0){expect(v.fingers[i]).toBeGreaterThanOrEqual(1);expect(v.fingers[i]).toBeLessThanOrEqual(4);expect(f).toBeGreaterThanOrEqual(v.baseFret);expect(f).toBeLessThan(v.baseFret+5);}else expect(v.fingers[i]).toBe(0);});
   for(const b of v.barres){expect(v.fingers[6-b.from]).toBe(1);expect(v.fingers[6-b.to]).toBe(1);for(let s=b.to;s<=b.from;s++)expect(v.frets[6-s]).toBeGreaterThanOrEqual(b.fret);}
  }
 }
});
it('provides the specified A, F and Bm positions',()=>{expect(data.A.voicings[0].frets).toEqual([-1,0,2,2,2,0]);expect(data.A.voicings[0].fingers).toEqual([0,0,1,2,3,0]);expect(data.F.voicings[0].barres).toEqual([{fret:1,from:6,to:1}]);expect(data.Bm.voicings[0].baseFret).toBe(2);});
it('resolves enharmonics and G/B with an actual lowest B',()=>{expect(getVoicings({root:'Db',quality:'m'})).toEqual(getVoicings({root:'C#',quality:'m'}));const vs=getVoicings({root:'G',quality:'major',bass:'B'});expect(vs.length).toBeGreaterThan(0);for(const v of vs){const i=v.frets.findIndex(f=>f>=0);expect((TUNING[i]+v.frets[i])%12).toBe(11);}expect(getVoicings({root:'C',quality:'major',bass:'Db'})).toEqual([]);});
