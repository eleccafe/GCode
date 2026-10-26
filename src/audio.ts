import {TUNING} from './data/voicings';
import type {Voicing} from './theory/types';
let context:AudioContext|undefined;
export async function playChord(voicing:Voicing){
 context??=new AudioContext();await context.resume();
 const start=context.currentTime;
 voicing.frets.forEach((f,i)=>{if(f<0)return;
  const hz=440*2**((TUNING[i]+f-69)/12),length=Math.round(context!.sampleRate/hz);
  const ring=Float32Array.from({length},()=>Math.random()*2-1);
  const buffer=context!.createBuffer(1,context!.sampleRate*2.5,context!.sampleRate),samples=buffer.getChannelData(0);
  for(let n=0;n<samples.length;n++){const j=n%length;samples[n]=ring[j]*0.22;ring[j]=0.497*(ring[j]+ring[(j+1)%length]);}
  const source=context!.createBufferSource(),gain=context!.createGain();source.buffer=buffer;gain.gain.setValueAtTime(1,start);gain.gain.setTargetAtTime(0,start+2,0.12);source.connect(gain).connect(context!.destination);source.start(start+i*0.035);
 });
}
