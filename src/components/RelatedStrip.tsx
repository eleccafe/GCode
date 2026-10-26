import {useRef} from 'react';
import type {Chord,RelatedGroup} from '../theory/types';
import {getVoicings} from '../data/voicings';
import {ChordDiagram} from './ChordDiagram';
import type {Preferences} from './Settings';
function spokenDegree(degree:string){const roman=degree.replace(/[♭♯°ø0-9]/g,'').toUpperCase();const number:Record<string,number>={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7};return `${degree.startsWith('♭')?'내림 ':''}${number[roman]}도`;}
export function RelatedStrip({groups,tab,setTab,onSelect,prefs}:{groups:RelatedGroup[];tab:number;setTab:(n:number)=>void;onSelect:(c:Chord)=>void;prefs:Preferences}){
 const list=useRef<HTMLDivElement>(null),tabs=useRef<HTMLDivElement>(null);
 return <section className="related-panel" aria-labelledby="related-title"><div className="section-title"><div><p className="eyebrow">KEEP THE MUSIC GOING</p><h2 id="related-title">다음 코드는?</h2></div><span className="small-arrow" aria-hidden="true">↗</span></div><p className="section-description">잘 어울리는 코드로 자연스럽게 이어가세요.</p>
 <div className="group-tabs" role="tablist" aria-label="관련 코드 그룹" ref={tabs}>{['같은 키','대리·진행','루트 변형'].map((name,i)=><button id={`tab-${i}`} aria-controls="related-cards" role="tab" aria-selected={tab===i} tabIndex={tab===i?0:-1} key={name} onClick={()=>setTab(i)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:2))%3;setTab(next);(tabs.current?.children[next] as HTMLElement)?.focus();}}}>{name}</button>)}</div>
 <div className="related-cards" id="related-cards" role="tabpanel" aria-labelledby={`tab-${tab}`} ref={list}>{groups[tab].chords.map(({chord,name,degree},i)=>{const v=getVoicings(chord)[0];return v?<button className="chord-card" key={name} onClick={()=>onSelect(chord)} aria-label={`${name} 코드, ${spokenDegree(degree)}`} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const children=list.current?.children;if(children?.length)(children[(i+(e.key==='ArrowRight'?1:children.length-1))%children.length] as HTMLElement).focus();}}}><div className="card-top"><strong>{name}</strong><span>{degree}</span></div><ChordDiagram chord={chord} voicing={v} size="sm" leftHanded={prefs.leftHanded}/><span className="card-action">연주하기 <span>↗</span></span></button>:null;})}</div>
 <div className="practice-note"><span aria-hidden="true">✳</span><p>하나의 코드에서, 새로운 진행으로.<br/><strong>카드를 눌러 다음 소리를 찾아보세요.</strong></p></div></section>;
}
