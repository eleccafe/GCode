import {useState} from 'react';
import {chordCandidates,parseChord} from '../theory/parseChord';
import type {Chord,ParseError} from '../theory/types';
export function ChordInput({onSelect,keypad}:{onSelect:(c:Chord)=>void;keypad:boolean}){
 const [value,setValue]=useState(''),[error,setError]=useState<ParseError|null>(null),[focused,setFocused]=useState(false),[active,setActive]=useState(-1);
 const suggestions=value?chordCandidates.filter(n=>n.toLowerCase().startsWith(value.replace(/\s/g,'').toLowerCase())).slice(0,6):[];
 const submit=(text=value)=>{const result=parseChord(text);if('error'in result)setError(result);else{onSelect(result);setValue('');setError(null);setFocused(false);}setActive(-1);};
 return <div className="input-area"><form onSubmit={e=>{e.preventDefault();submit(active>=0?suggestions[active]:value);}} className="search-form">
  <span className="search-symbol" aria-hidden="true">⌕</span><input autoFocus aria-label="코드 입력" placeholder="어떤 코드를 연주할까요?" value={value} role="combobox" aria-expanded={focused&&suggestions.length>0} aria-controls="chord-suggestions" aria-autocomplete="list" aria-activedescendant={active>=0?`suggestion-${active}`:undefined} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={e=>{setValue(e.target.value);setError(null);setFocused(true);setActive(-1);}} autoCapitalize="off" autoComplete="off" spellCheck={false} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(n=>Math.min(n+1,suggestions.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActive(n=>Math.max(n-1,0));}if(e.key==='Escape'){setFocused(false);setActive(-1);}}}/><button type="submit" className="search-submit" aria-label="코드 찾기">↵</button>
 </form>{focused&&suggestions.length>0&&<div className="suggestions" id="chord-suggestions" role="listbox">{suggestions.map((s,i)=><button key={s} type="button" role="option" id={`suggestion-${i}`} aria-selected={active===i} onMouseDown={e=>e.preventDefault()} onClick={()=>submit(s)}>{s}</button>)}</div>}
 {error&&<div className="input-error" role="alert"><span>{error.error}. 이 코드를 찾으셨나요?</span><div>{error.suggestions.map(s=><button key={s} onClick={()=>submit(s)}>{s}</button>)}</div></div>}
 {keypad&&<div className="keypad" aria-label="코드 전용 키패드">{['A','B','C','D','E','F','G','#','b','m','7','maj7','sus4','/'].map(s=><button key={s} onClick={()=>{setValue(v=>v+s);setFocused(true);}}>{s}</button>)}<button onClick={()=>setValue(v=>v.slice(0,-1))} aria-label="한 글자 지우기">⌫</button><button onClick={()=>submit()}>입력</button></div>}
 </div>;
}
