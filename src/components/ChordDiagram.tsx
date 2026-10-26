import {useId} from 'react';
import type {Chord,Voicing} from '../theory/types';
import {chordName,noteName,notePc,prefersFlats} from '../theory/notes';
import {TUNING} from '../data/voicings';
type Props={chord:Chord;voicing:Voicing;size:'lg'|'sm';leftHanded?:boolean;horizontal?:boolean;showNotes?:boolean;notation?:'auto'|'sharp'|'flat'};
export function ChordDiagram({chord,voicing:v,size,leftHanded=false,horizontal=false,showNotes=false,notation='auto'}:Props){
 const id=useId(),small=size==='sm';
 const width=300,height=330,top=43,left=55,spacing=36,gap=48,radius=14;
 const x=(i:number)=>left+(leftHanded?5-i:i)*spacing;
 const pos=(xx:number,yy:number)=>horizontal?{x:height-yy,y:xx}:{x:xx,y:yy};
 const positives=v.frets.filter(f=>f>0);
 const base=v.barres.length?v.baseFret:Math.max(...positives)<=4?1:Math.min(...positives);
 const inferred=v.frets.flatMap((f,i)=>f>0&&v.fingers[i]===1?[{f,i}]:[]);
 const barres=v.barres.length?v.barres:inferred.length>1&&inferred.every(p=>p.f===inferred[0].f)?[{fret:inferred[0].f,from:6-inferred[0].i,to:6-inferred.at(-1)!.i}]:[];
 const description=v.frets.map((f,i)=>`${6-i}번줄 ${f<0?'뮤트':f===0?'개방':`${f}프렛, ${v.fingers[i]}번 손가락`}`).join(', ');
 const flat=notation==='flat'||notation==='auto'&&prefersFlats(chord.root);
 function line(x1:number,y1:number,x2:number,y2:number,props:React.SVGProps<SVGLineElement>={}){const a=pos(x1,y1),b=pos(x2,y2);return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} {...props}/>;}
 return <svg className={`chord-diagram ${size}`} viewBox={`0 0 ${horizontal?height:width} ${horizontal?width:height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
  <title id={`${id}-title`}>{chordName(chord)} 코드</title><desc id={`${id}-desc`}>{description}</desc>
  {[0,1,2,3,4,5].map(i=><g key={`string${i}`}>{line(x(i),top,x(i),top+gap*5,{className:'string-line',strokeWidth:1.2+(5-i)*0.18})}</g>)}
  {[0,1,2,3,4,5].map(i=><g key={`fret${i}`}>{line(left,top+i*gap,left+spacing*5,top+i*gap,{className:i===0&&base===1?'nut-line':'fret-line',strokeWidth:i===0&&base===1?5:1.4})}</g>)}
  {base>1&&<text {...pos(26,top+gap/2+5)} className="fret-label" textAnchor="middle">{base}fr</text>}
  {v.frets.map((f,i)=>f<=0?<text key={`open${i}`} {...pos(x(i),top-15)} className={f===0&&(TUNING[i]%12===notePc(chord.root))?'open root-text':'open'} textAnchor="middle">{f<0?'×':'○'}</text>:null)}
  {barres.map((b,i)=><g key={`barre${i}`} data-testid="barre">{line(x(6-b.from),top+(b.fret-base+0.5)*gap,x(6-b.to),top+(b.fret-base+0.5)*gap,{className:'barre',strokeWidth:radius*2,strokeLinecap:'round'})}</g>)}
  {v.frets.map((f,i)=>{if(f<=0)return null;const pc=(TUNING[i]+f)%12,isRoot=pc===notePc(chord.root),point=pos(x(i),top+(f-base+0.5)*gap);const barre=barres.find(b=>b.fret===f&&6-i<=b.from&&6-i>=b.to);const label=showNotes?noteName(pc,flat):String(v.fingers[i]);const show=!small&&(!barre||showNotes||6-i===barre.from);
   return <g key={`dot${i}`} data-string={6-i} data-fret={f}><circle {...{cx:point.x,cy:point.y,r:radius}} className={isRoot?'finger-dot root-dot':'finger-dot'}/>{show&&<text x={point.x} y={point.y+5.5} textAnchor="middle" className={`${isRoot?'root-number':'finger-number'} ${showNotes?'note-number':''}`}>{label}</text>}</g>;
  })}
  {!small&&v.fingers.map((f,i)=><text key={`finger${i}`} {...pos(x(i),top+gap*5+25)} className="bottom-finger" textAnchor="middle">{f||'·'}</text>)}
 </svg>;
}
