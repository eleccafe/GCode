import {useEffect,useMemo,useRef,useState} from 'react';
import {ChordInput} from './components/ChordInput';
import {ChordDiagram} from './components/ChordDiagram';
import {RelatedStrip} from './components/RelatedStrip';
import {Settings,defaultPreferences,type Preferences} from './components/Settings';
import {useChordState,readStored,writeStored} from './hooks/useChordState';
import {chordName,chordNotes,noteName,notePc,SHARPS,FLATS} from './theory/notes';
import {effectiveKey,getRelatedChords,degreeOf} from './theory/related';
import {parseChord} from './theory/parseChord';
import {getVoicings} from './data/voicings';
import type {Chord,KeyContext} from './theory/types';
import {playChord} from './audio';
const qualities={major:'메이저',m:'마이너','7':'도미넌트 세븐',maj7:'메이저 세븐',m7:'마이너 세븐',sus2:'서스펜디드 2',sus4:'서스펜디드 4',add9:'애드 나인','6':'식스',dim:'디미니시드',aug:'어그먼티드',m7b5:'하프 디미니시드'};
export default function App(){
 const {chord,select,history}=useChordState();
 const [prefs,setPrefs]=useState<Preferences>(()=>{const stored=readStored<Partial<Preferences>>('gcode-settings',{});const result={...defaultPreferences};for(const key of ['leftHanded','horizontal','showNotes','dark','keypad'] as const)if(typeof stored?.[key]==='boolean')result[key]=stored[key]!;if(['auto','sharp','flat'].includes(stored?.notation||''))result.notation=stored.notation!;return result;});
 const [settings,setSettings]=useState(false),[tab,setTab]=useState(0),[index,setIndex]=useState(0),[audioError,setAudioError]=useState('');
 const [ctx,setCtx]=useState<KeyContext>({tonic:'A',mode:'major',locked:false});
 const [online,setOnline]=useState(navigator.onLine),[cached,setCached]=useState(false);
 const touch=useRef<{x:number;y:number}|null>(null),diagram=useRef<HTMLButtonElement>(null),swiped=useRef(false);
 const name=chordName(chord),key=effectiveKey(chord,ctx),voicings=useMemo(()=>getVoicings(chord),[chord]),voicing=voicings[index%Math.max(1,voicings.length)];
 const groups=useMemo(()=>getRelatedChords(chord,ctx),[chord,ctx]);
 const notes=chordNotes(chord).map(n=>prefs.notation==='auto'?n:noteName(notePc(n),prefs.notation==='flat'));
 useEffect(()=>{document.documentElement.classList.toggle('dark',prefs.dark);writeStored('gcode-settings',prefs);},[prefs]);
 useEffect(()=>{setIndex(0);setAudioError('');document.title=`${name} · GCode`;},[name]);
 useEffect(()=>{const update=()=>setOnline(navigator.onLine),ready=()=>setCached(true);window.addEventListener('online',update);window.addEventListener('offline',update);window.addEventListener('gcode-offline-ready',ready);if(navigator.serviceWorker?.controller)setCached(true);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);window.removeEventListener('gcode-offline-ready',ready);};},[]);
 const choose=(c:Chord)=>{select(c);setIndex(0);};
 const next=(delta:number)=>setIndex(i=>(i+delta+voicings.length)%voicings.length);
 const play=()=>{if(voicing)void playChord(voicing).catch(()=>setAudioError('소리를 재생할 수 없습니다. 브라우저의 오디오 설정을 확인해 주세요.'));};
 const exportSvg=()=>{const svg=diagram.current?.querySelector('svg');if(!svg)return;const clone=svg.cloneNode(true) as SVGElement;const originals=[svg,...svg.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];originals.forEach((el,i)=>{const style=getComputedStyle(el);for(const key of ['fill','stroke','font-size','font-family','font-weight']) (copies[i] as SVGElement).style.setProperty(key,style.getPropertyValue(key));});clone.setAttribute('xmlns','http://www.w3.org/2000/svg');const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download=`${name.replace('/','-')}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <div className="app-shell"><header className="site-header"><a href={import.meta.env.BASE_URL} className="brand" aria-label="GCode 홈"><span className="brand-mark" aria-hidden="true">♮</span>G<span>Code</span><span className="brand-dot">.</span></a><span className="header-caption">YOUR EVERYDAY CHORD COMPANION</span><span className={`connection ${!online?'offline':''}`}><i/>{!online?'오프라인':cached?'오프라인 준비됨':'기타 코드 뷰어'}</span></header>
 <main><div className="workspace-top"><div className="intro"><p className="eyebrow">LESS SEARCHING, MORE PLAYING</p><h1>손끝에서 이어지는 코드<span>.</span></h1></div><div className="input-row"><ChordInput onSelect={choose} keypad={prefs.keypad}/><button className="icon-button settings-trigger" onClick={()=>setSettings(true)} aria-label="설정 열기">⚙</button></div></div>
 <nav className="history" aria-label="최근 본 코드"><span>최근 코드</span>{history.map(s=><button key={s} className={name===s?'active':''} aria-current={name===s?'true':undefined} onClick={()=>{const c=parseChord(s);if(!('error'in c))choose(c);}}>{s}</button>)}</nav>
 <div className="workspace"><section className="main-panel" aria-label="현재 코드"><div className="main-toolbar"><span className="pill"><i/> STANDARD TUNING</span><button className="text-button" onClick={exportSvg} disabled={!voicing} aria-label="운지표 SVG 저장">↓ <span>SVG 저장</span></button></div>
 <div className="chord-content" key={name}><div className="chord-heading" aria-live="polite"><span className="quality-label">{qualities[chord.quality]}{chord.bass?' · 슬래시 코드':''}</span><h2 data-testid="main-chord-name">{name}</h2><p className="chord-notes">{notes.join(' · ')}</p></div>
 {voicing?<button ref={diagram} className={`diagram-button ${prefs.horizontal?'horizontal':''}`} aria-label={`${name} 코드 소리 듣기`} onClick={()=>{if(swiped.current){swiped.current=false;return;}play();}} onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};swiped.current=false;}} onTouchEnd={e=>{if(touch.current){const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)&&voicings.length>1){next(dx<0?1:-1);swiped.current=true;}touch.current=null;}}}><ChordDiagram chord={chord} voicing={voicing} size="lg" {...prefs}/></button>:<div className="no-voicing"><strong>이 베이스음의 운지를 준비 중입니다.</strong><p>구성음과 관련 코드는 확인할 수 있어요.</p><button onClick={()=>choose({root:chord.root,quality:chord.quality})}>기본 코드 {chord.root} 보기</button></div>}
 <div className="voicing-controls"><div className="voicing-pagination"><button aria-label="이전 운지" onClick={()=>next(-1)} disabled={voicings.length<2}>‹</button><span><b>{voicings.length?index%voicings.length+1:0}</b> / {voicings.length}</span><button aria-label="다음 운지" onClick={()=>next(1)} disabled={voicings.length<2}>›</button></div><button className="play-button" onClick={play} disabled={!voicing}><span aria-hidden="true">▷</span> 소리 듣기</button></div></div>
 {audioError&&<p role="alert" className="audio-error">{audioError}</p>}<div className="diagram-legend"><span>1 검지 · 2 중지 · 3 약지 · 4 새끼</span><span><i/> 주황 = 근음</span></div></section>
 <aside className="side-column"><div className="key-context"><div><span className="eyebrow">KEY CONTEXT</span><div className="key-controls"><select aria-label="키 선택" value={key.tonic} onChange={e=>setCtx({...key,tonic:e.target.value,locked:true})}>{[...new Set([...SHARPS,...FLATS,key.tonic])].map(n=><option key={n}>{n}</option>)}</select><select aria-label="키 모드" value={key.mode} onChange={e=>setCtx({...key,mode:e.target.value as KeyContext['mode'],locked:true})}><option value="major">Major</option><option value="minor">Minor</option></select><span className="degree-badge">{degreeOf(chord,key)}</span></div></div><button className={`lock-button ${ctx.locked?'locked':''}`} aria-pressed={ctx.locked} onClick={()=>setCtx({...key,locked:!ctx.locked})}>{ctx.locked?'고정됨':'키 고정'} <span aria-hidden="true">{ctx.locked?'●':'○'}</span></button></div><RelatedStrip groups={groups} tab={tab} setTab={setTab} onSelect={choose} prefs={prefs}/></aside></div></main>
 <footer><span>하루에 하나의 코드, 조금 더 가까워지는 음악.</span><a href={`${import.meta.env.BASE_URL}THIRD_PARTY_LICENSES.txt`} target="_blank" rel="noreferrer">운지 데이터 안내 ↗</a></footer>
 {settings&&<Settings value={prefs} onChange={setPrefs} onClose={()=>setSettings(false)}/>}</div>;
}
