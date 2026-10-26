import {useEffect,useRef} from 'react';
export type Preferences={leftHanded:boolean;horizontal:boolean;showNotes:boolean;notation:'auto'|'sharp'|'flat';dark:boolean;keypad:boolean};
export const defaultPreferences:Preferences={leftHanded:false,horizontal:false,showNotes:false,notation:'auto',dark:false,keypad:false};
export function Settings({value,onChange,onClose}:{value:Preferences;onChange:(s:Preferences)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{ref.current?.showModal();return()=>ref.current?.close();},[]);
 return <dialog ref={ref} className="settings-dialog" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="settings-heading"><div><p className="eyebrow">MAKE IT YOURS</p><h2>나에게 맞는 연주</h2></div><button onClick={onClose} aria-label="설정 닫기" className="icon-button">×</button></div>
 {([['leftHanded','왼손잡이 모드','줄 순서를 좌우로 바꿉니다'],['horizontal','가로 다이어그램','기타 넥을 옆으로 눕혀 봅니다'],['showNotes','점 안에 음이름 표시','손가락 번호 대신 구성음을 봅니다'],['dark','다크 모드','어두운 연습실에서도 편안하게'],['keypad','코드 전용 키패드','자주 쓰는 기호를 한 번에 입력']] as const).map(([key,title,desc])=><label className="setting-row" key={key}><span><strong>{title}</strong><small>{desc}</small></span><input type="checkbox" checked={value[key]} onChange={e=>onChange({...value,[key]:e.target.checked})}/></label>)}
 <label className="setting-row"><span><strong>음이름 표기</strong><small>구성음과 운지표에 적용됩니다</small></span><select aria-label="음이름 표기" value={value.notation} onChange={e=>onChange({...value,notation:e.target.value as Preferences['notation']})}><option value="auto">키에 맞게</option><option value="sharp">샤프 (#)</option><option value="flat">플랫 (b)</option></select></label>
 <p className="settings-foot">표준 튜닝 · E A D G B E<br/>설정은 이 기기에 자동으로 저장됩니다.</p></dialog>;
}
