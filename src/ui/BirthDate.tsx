import {useEffect,useId,useRef,useState} from 'react';
import {birthDateDigits,parseBirthDateDraft} from '../input/birthDate';

/** Keep incomplete text locally; only a complete date reaches the calculation input. */
export function BirthDate({value,onChange,lunar=false}:{value:string;onChange:(value:string)=>void;lunar?:boolean}) {
 const [draft,setDraft]=useState(()=>birthDateDigits(value)),[showError,setShowError]=useState(false);
 const lastEmitted=useRef<string|null>(null),input=useRef<HTMLInputElement>(null),hintId=useId(),errorId=useId();
 const parsed=parseBirthDateDraft(draft);
 useEffect(()=>{
  if(value===lastEmitted.current){lastEmitted.current=null;return;}
  setDraft(birthDateDigits(value));setShowError(false);
 },[value]);
 useEffect(()=>{input.current?.setCustomValidity(parsed.message);},[parsed.message]);
 function change(raw:string){
  const next=parseBirthDateDraft(raw);
  setDraft(raw);setShowError(false);lastEmitted.current=next.canonical;
  input.current?.setCustomValidity(next.message);onChange(next.canonical);
 }
 return <div className="birth-date-field">
  <label>생년월일 {lunar&&<span className="optional">음력 숫자 그대로 입력</span>}
   <input ref={input} type="text" inputMode="numeric" autoComplete="bday" required maxLength={10} placeholder="예: 19880712" value={draft} aria-describedby={`${hintId}${showError&&parsed.message?' '+errorId:''}`} aria-invalid={showError&&!!parsed.message} onChange={event=>change(event.target.value)} onBlur={()=>setShowError(!!parsed.message)} onInvalid={()=>setShowError(true)}/>
  </label>
  <p id={hintId} className="field-note">연도 4자리 + 월 2자리 + 일 2자리. 1988년 7월 12일은 <strong>19880712</strong>로 입력해요.</p>
  {showError&&parsed.message&&<p id={errorId} className="error" role="alert">{parsed.message}</p>}
 </div>;
}
