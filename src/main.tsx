import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {calculateSaju,REGIONS} from './engine/calculate';
import {calculateFortune,seoulToday} from './engine/fortune';
import {interpretReport} from './interpretation/readings';
import type {BirthInput,SajuResult} from './engine/types';
import type {FullReport} from './engine/fortuneTypes';
import {Report} from './ui/Report';
import {PrintReport} from './ui/PrintReport';
import './style.css';
const initial:BirthInput={name:'',gender:'선택 안 함',calendar:'solar',date:'',time:'12:00',region:'서울',leapMonth:false};
const storageKey='saju-garden-birth-v1';
function buildReport(natal:SajuResult,year:number,date:string):FullReport{const fortune=calculateFortune(natal,year,date);return {schemaVersion:'2.0',natal,fortune,interpretation:interpretReport(natal,fortune)};}
function saveFile(data:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function App(){
 const [input,setInput]=useState(initial),[report,setReport]=useState<FullReport|null>(null),[error,setError]=useState(''),[remember,setRemember]=useState(false),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const today=seoulToday(),thisYear=Number(today.slice(0,4));
 const set=<K extends keyof BirthInput>(key:K,value:BirthInput[K])=>{setInput(p=>({...p,[key]:value}));setReport(null);setError('');setNotice('');};
 async function submit(event:React.FormEvent){event.preventDefault();setBusy(true);setError('');setNotice('');await new Promise(resolve=>setTimeout(resolve,20));try{
  const natal=calculateSaju(input);setReport(buildReport(natal,thisYear,today));
  if(remember){try{localStorage.setItem(storageKey,JSON.stringify(input));setNotice('이 기기에 출생정보를 저장했습니다.');}catch{setNotice('리포트는 생성됐지만 이 브라우저에서는 기기 저장을 사용할 수 없습니다.');}}
  if(window.innerWidth<700)setTimeout(()=>document.getElementById('report-anchor')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}),50);
 }catch(e){setReport(null);setError(e instanceof Error?e.message:'계산에 실패했습니다.');}finally{setBusy(false);}}
 function restore(){try{const saved=localStorage.getItem(storageKey);if(!saved){setNotice('이 기기에 저장한 출생정보가 없습니다.');return;}const parsed=JSON.parse(saved);calculateSaju(parsed);setInput(parsed);setReport(null);setError('');setNotice('저장한 정보를 불러왔습니다. 출생정보를 확인한 뒤 계산해주세요.');}catch{setNotice('저장한 정보를 읽을 수 없습니다. 직접 입력해주세요.');}}
 function erase(){try{localStorage.removeItem(storageKey);setRemember(false);setNotice('이 기기에 저장한 출생정보를 삭제했습니다.');}catch{setNotice('이 브라우저에서는 저장 정보에 접근할 수 없습니다.');}}
 function changeYear(year:number){if(!report)return;try{setReport(buildReport(report.natal,year,today));setError('');}catch(e){setError(e instanceof Error?e.message:'연운 계산에 실패했습니다.');}}
 return <main>
 <header><a className="brand" href="./"><span className="brand-mark">◈</span> 사주정원</a><div className="header-meta"><span>나의 삶을 읽는 시간</span><span className="badge">종합 사주 리포트</span></div></header>
 <section className="intro"><div><p className="eyebrow">SAJU GARDEN · 나를 알아가는 기록</p><h1>나의 사주를 읽고,<br/><em>앞으로의 흐름</em>을 살펴보세요.</h1><p>타고난 원국부터 대운, 올해와 내년의 흐름까지.<br/>계산 근거가 보이는 나만의 사주 리포트를 만나보세요.</p><div className="intro-tags"><span>한국 음력 · 윤달</span><span>대운 · 연운 · 월운</span><span>1950–2030년 한국 출생</span></div></div><div className="hero-orbit" aria-hidden="true"><div>木</div><div>火</div><div>土</div><div>金</div><div>水</div><span>四柱<br/><small>나의 흐름</small></span></div></section>
 <div className="workspace"><section className="panel input-panel"><div className="section-title"><span className="number">01</span><h2>출생 정보</h2></div><p className="muted">정확한 원국이 모든 풀이의 출발점입니다.</p><div className="saved-actions"><button onClick={restore}>저장한 정보 불러오기</button><button onClick={erase}>저장 삭제</button></div>
 <form onSubmit={submit}>
 <label>이름 <span className="optional">선택</span><input maxLength={40} placeholder="이름 또는 별명" value={input.name} onChange={e=>set('name',e.target.value)}/></label>
 <label>성별<select aria-label="성별" value={input.gender} onChange={e=>set('gender',e.target.value as BirthInput['gender'])}><option>선택 안 함</option><option>남성</option><option>여성</option></select></label><p className="field-note">전통 대운 방향을 계산할 때 사용합니다.</p>
 <fieldset><legend>달력 기준</legend><div className="calendar-choice">{(['solar','lunar'] as const).map(c=><label key={c} className={input.calendar===c?'selected':''}><input type="radio" name="calendar" checked={input.calendar===c} onChange={()=>{setInput(p=>({...p,calendar:c,leapMonth:false}));setReport(null);setError('');}}/>{c==='solar'?'양력':'음력'}</label>)}</div></fieldset>
 {input.calendar==='lunar'&&<label className="checkbox"><input type="checkbox" checked={input.leapMonth} onChange={e=>set('leapMonth',e.target.checked)}/> 윤달에 태어났어요</label>}
 <label>생년월일 {input.calendar==='lunar'&&<span className="optional">음력 숫자 그대로 입력</span>}<input type="date" required min="1949-01-01" max="2030-12-31" value={input.date} onChange={e=>set('date',e.target.value)}/></label>
 <div className="two-fields"><label>출생시간<input type="time" required value={input.time} onChange={e=>set('time',e.target.value)}/></label><label>출생지역<select aria-label="출생지역" value={input.region} onChange={e=>set('region',e.target.value)}>{REGIONS.map(r=><option key={r}>{r}</option>)}</select></label></div>
 <p className="help">출생기록의 당시 시계 시각을 입력하세요. 서머타임을 자동 보정합니다. 기본 표시된 12:00은 실제 출생시간으로 바꿔주세요.</p>
 <label className="checkbox remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> 이 기기에 출생정보 저장</label>
 {error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status" className="notice small">{notice}</p>}
 <button className="primary" type="submit" disabled={busy}>{busy?'원국과 운의 흐름 계산 중…':'사주 원국 계산하기'} <span>→</span></button>
 <p className="privacy">개인정보는 서버로 전송하지 않습니다.<br/>선택한 경우에만 이 기기 브라우저에 저장합니다.</p>
 </form><div className="input-method"><strong>계산과 풀이를 구분합니다</strong><p>원국·대운·운 간지는 계산 엔진에서, 문장은 계산 결과를 읽는 전통 해석 규칙에서 생성합니다.</p></div></section>
 <div id="report-anchor" className="report-anchor" aria-live="polite">{report?<><Report report={report} onYear={changeYear} onSave={()=>saveFile(report,'saju-report.json')} onPrint={()=>window.print()}/><button className="text-button natal-download" onClick={()=>saveFile(report.natal,'saju-chart.json')}>원국 JSON 저장 ↓</button></>:<section className="panel result-panel empty-report"><div className="section-title"><span className="number">02</span><h2>나만의 사주 리포트</h2></div><div className="empty"><div className="seal">四柱</div><p className="eyebrow">나를 읽는 여섯 가지 창</p><h3>만세력에서 시작해<br/>삶의 흐름까지 이어집니다.</h3><p>출생 정보를 입력하면<br/>원국과 사주 풀이, 대운과 운세를 한 번에 볼 수 있습니다.</p><div className="empty-pillars">{['년주','월주','일주','시주'].map(x=><span key={x}>{x}<b>—</b></span>)}</div></div><div className="preview-features">{[['01','사주 풀이','성향 · 재물 · 직업 · 관계'],['02','10년의 대운','순역과 기산 시점 계산'],['03','올해와 내년','입춘 기준 연운 리포트'],['04','월별 · 오늘','절입 월운과 오늘의 일진']].map(([n,t,d])=><div key={n}><span>{n}</span><strong>{t}</strong><small>{d}</small></div>)}</div></section>}</div></div>
 <aside className="principles"><div><span>추측 없는 계산</span><p>한국 음력과 역사적 시각을 반영해 간지를 계산합니다.</p></div><div><span>근거 있는 풀이</span><p>각 풀이에 일간·십성·합충 관계의 계산 근거를 표시합니다.</p></div><div><span>언제든 나의 리포트</span><p>휴대폰 웹에서 사용하고 리포트를 저장하거나 PDF로 남기세요.</p></div></aside>
 {report&&<PrintReport report={report}/>}
 <footer>사주정원 <span>계산된 원국에서 시작하는 삶의 기록 · v2</span></footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
