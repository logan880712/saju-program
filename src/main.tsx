import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {calculateSaju,REGIONS} from './engine/calculate';
import {calculateFortune,seoulToday} from './engine/fortune';
import {interpretReport} from './interpretation/readings';
import type {BirthInput,SajuResult} from './engine/types';
import type {FullReport} from './engine/fortuneTypes';
import {Report} from './ui/Report';
import {DailyHub} from './ui/DailyHub';
import {Grandma,GrandmaWelcome} from './ui/Grandma';
import {Consultation} from './ui/Consultation';
import {PrintReport} from './ui/PrintReport';
import {BirthDate} from './ui/BirthDate';
import './style.css';
import './consultation.css';
const initial:BirthInput={name:'',gender:'선택 안 함',calendar:'solar',date:'',time:'',region:'서울',leapMonth:false};
const storageKey='saju-garden-birth-v1';
function buildReport(natal:SajuResult,year:number,date:string):FullReport{const fortune=calculateFortune(natal,year,date);return {schemaVersion:'2.0',natal,fortune,interpretation:interpretReport(natal,fortune)};}
function saveFile(data:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function App(){
 const [birthDateReset,setBirthDateReset]=useState(0);
 const [input,setInput]=useState(initial),[report,setReport]=useState<FullReport|null>(null),[error,setError]=useState(''),[remember,setRemember]=useState(false),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[reportOpen,setReportOpen]=useState(false),[appSection,setAppSection]=useState('consult'),[entryTopic,setEntryTopic]=useState<'nature'|'daily'>(()=>new URLSearchParams(window.location.search).get('view')==='today'?'daily':'nature'),[reportTab,setReportTab]=useState<string>(()=>new URLSearchParams(window.location.search).get('view')==='today'?'daily':'summary');
 const today=seoulToday(),thisYear=Number(today.slice(0,4));
 const set=<K extends keyof BirthInput>(key:K,value:BirthInput[K])=>{setInput(p=>({...p,[key]:value}));setReport(null);setError('');setNotice('');};
 async function submit(event:React.FormEvent){event.preventDefault();const submitter=(event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null;setReportTab(submitter?.value==='daily'?'daily':'summary');setBusy(true);setError('');setNotice('');await new Promise(resolve=>setTimeout(resolve,20));try{
  const natal=calculateSaju(input);setReport(buildReport(natal,thisYear,today));setReportOpen(false);setAppSection(submitter?.value==='daily'?'daily':'consult');setEntryTopic(submitter?.value==='daily'?'daily':'nature');
  if(remember){try{localStorage.setItem(storageKey,JSON.stringify(input));setNotice('이 기기에 출생정보를 저장했습니다.');}catch{setNotice('리포트는 생성됐지만 이 브라우저에서는 기기 저장을 사용할 수 없습니다.');}}
  if(window.innerWidth<700)setTimeout(()=>document.getElementById('report-anchor')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}),50);
 }catch(e){setReport(null);setError(e instanceof Error?e.message:'계산에 실패했습니다.');}finally{setBusy(false);}}
 function openPersonalDaily(){setReportTab('daily');setEntryTopic('daily');setAppSection('daily');setError('');if(input.date&&input.time){try{setReport(buildReport(calculateSaju(input),thisYear,today));setReportOpen(false);setAppSection('daily');setTimeout(()=>document.getElementById('report-anchor')?.scrollIntoView({behavior:'smooth',block:'start'}),50);return;}catch(e){setError(e instanceof Error?e.message:'출생정보를 확인해주세요.');}}setNotice('오늘의 운세를 볼 분의 출생정보를 입력해주세요. 성별을 선택하지 않아도 오늘 운세를 볼 수 있어요.');document.getElementById('birth-panel')?.scrollIntoView({behavior:'smooth',block:'start'});}
 function newPerson(){setInput(initial);setBirthDateReset(n=>n+1);setReportOpen(false);setAppSection('profile');setTimeout(()=>document.getElementById('birth-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),30);setReport(null);setReportTab('daily');setRemember(false);setError('');setNotice('다른 분의 출생정보를 입력하고 오늘 운세를 확인해보세요.');}
 function restore(){try{const saved=localStorage.getItem(storageKey);if(!saved){setNotice('이 기기에 저장한 출생정보가 없습니다.');return;}const parsed=JSON.parse(saved);calculateSaju(parsed);setInput(parsed);setBirthDateReset(n=>n+1);setReport(null);setError('');setNotice('저장한 정보를 불러왔습니다. 출생정보를 확인한 뒤 계산해주세요.');}catch{setNotice('저장한 정보를 읽을 수 없습니다. 직접 입력해주세요.');}}
 function erase(){try{localStorage.removeItem(storageKey);setRemember(false);setNotice('이 기기에 저장한 출생정보를 삭제했습니다.');}catch{setNotice('이 브라우저에서는 저장 정보에 접근할 수 없습니다.');}}
 function changeYear(year:number){if(!report)return;try{setReport(buildReport(report.natal,year,today));setError('');}catch(e){setError(e instanceof Error?e.message:'연운 계산에 실패했습니다.');}}
 function goTo(section:string){setAppSection(section);if(section==='daily'){openPersonalDaily();return;}if(section==='chart'){if(!report){setNotice('먼저 출생정보를 입력하면 원국을 함께 보여드릴게요.');document.getElementById('birth-panel')?.scrollIntoView({behavior:'smooth',block:'start'});return;}setReportTab('summary');setReportOpen(true);setTimeout(()=>document.getElementById('full-report')?.scrollIntoView({behavior:'smooth',block:'start'}),50);return;}document.getElementById(section==='profile'?'birth-panel':report?'consultation':'birth-panel')?.scrollIntoView({behavior:'smooth',block:'start'});}
 return <main className="counselor-app">
 <header><a className="brand" href="./"><span className="brand-mark">◈</span> 사주정원</a><div className="header-meta"><span className="counselor-badge"><span aria-hidden="true">●</span> 정원할매 상담소</span></div></header>
 <GrandmaWelcome onStart={()=>goTo('profile')}/>
 <DailyHub date={today} onPersonal={openPersonalDaily} initialOpen={new URLSearchParams(window.location.search).get('view')==='today'}/>
 <div className="workspace"><section id="birth-panel" className="panel input-panel"><div className="section-title"><Grandma small/><h2>어떤 분의 이야기인가요?</h2></div><p className="muted">태어난 날과 시각을 알려주면, 그분의 사주로 이야기해드려요.</p><div className="saved-actions"><button onClick={restore}>저장한 정보 불러오기</button><button onClick={erase}>저장 삭제</button><button onClick={newPerson}>다른 사람 입력</button></div>
 {reportTab==='daily'&&<div className="daily-input-note">누구의 오늘 운세를 볼까요? 출생정보를 입력하면 그분의 사주와 오늘의 일진을 함께 읽어드려요.</div>}
 <form onSubmit={submit}>
 <label>이름 <span className="optional">선택</span><input maxLength={40} placeholder="이름 또는 별명" value={input.name} onChange={e=>set('name',e.target.value)}/></label>
 <label>성별<select aria-label="성별" value={input.gender} onChange={e=>set('gender',e.target.value as BirthInput['gender'])}><option>선택 안 함</option><option>남성</option><option>여성</option></select></label><p className="field-note">전통 대운 방향을 계산할 때 사용합니다.</p>
 <fieldset><legend>달력 기준</legend><div className="calendar-choice">{(['solar','lunar'] as const).map(c=><label key={c} className={input.calendar===c?'selected':''}><input type="radio" name="calendar" checked={input.calendar===c} onChange={()=>{setInput(p=>({...p,calendar:c,leapMonth:false}));setReport(null);setError('');}}/>{c==='solar'?'양력':'음력'}</label>)}</div></fieldset>
 {input.calendar==='lunar'&&<label className="checkbox"><input type="checkbox" checked={input.leapMonth} onChange={e=>set('leapMonth',e.target.checked)}/> 윤달에 태어났어요</label>}
 <BirthDate key={birthDateReset} value={input.date} onChange={value=>set('date',value)} lunar={input.calendar==='lunar'}/>
 <div className="two-fields"><label>출생시간<input type="time" required value={input.time} onChange={e=>set('time',e.target.value)}/></label><label>출생지역<select aria-label="출생지역" value={input.region} onChange={e=>set('region',e.target.value)}>{REGIONS.map(r=><option key={r}>{r}</option>)}</select></label></div>
 <p className="help">출생기록의 당시 시계 시각을 입력하세요. 서머타임을 자동 보정합니다. 출생시간을 모르면 시주를 임의로 만들지 않습니다. 확인한 출생시간을 직접 입력해주세요.</p>
 <label className="checkbox remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> 이 기기에 출생정보 저장</label>
 {error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status" className="notice small">{notice}</p>}
 <button className="primary" type="submit" value={reportTab==='daily'?'daily':'summary'} disabled={busy}>{busy?'원국과 운의 흐름 계산 중…':reportTab==='daily'?'오늘 운세 바로 보기':'할매에게 사주 이야기 듣기'} <span aria-hidden="true">→</span></button>
 {reportTab!=='daily'&&<button className="outline-button daily-submit" type="submit" value="daily" disabled={busy}>입력한 정보로 오늘 운세만 보기</button>}
 <p className="privacy">개인정보는 서버로 전송하지 않습니다.<br/>선택한 경우에만 이 기기 브라우저에 저장합니다.</p>
 </form><div className="input-method"><strong>계산과 풀이를 구분합니다</strong><p>원국·대운·운 간지는 계산 엔진에서, 문장은 계산 결과를 읽는 전통 해석 규칙에서 생성합니다.</p></div></section>
 <div id="report-anchor" className="report-anchor">{report?<><Consultation report={report} initialTopic={entryTopic} onNewPerson={newPerson} onEditProfile={()=>goTo('profile')} onSave={()=>saveFile(report,'saju-report.json')}/><details id="full-report" className="full-report-details" open={reportOpen} onToggle={event=>setReportOpen(event.currentTarget.open)}><summary>상세 만세력·리포트 보기</summary><Report report={report} tab={reportTab} onTab={setReportTab} onYear={changeYear} onSave={()=>saveFile(report,'saju-report.json')} onPrint={()=>window.print()}/><button className="text-button natal-download" onClick={()=>saveFile(report.natal,'saju-chart.json')}>원국 JSON 저장 ↓</button></details></>:<section className="panel empty-consultation"><Grandma/><p className="eyebrow">할매가 기다리고 있어요</p><h2>사주 한 장에 담긴 이야기,<br/>함께 풀어봐요.</h2><p>출생정보를 입력하면 당신의 이야기로 상담을 시작해요.</p><div className="consultation-preview">{[['✿','타고난 모습'],['◈','돈과 살림'],['◇','일과 역할'],['♡','가까운 관계']].map(([icon,label])=><span key={label}><b aria-hidden="true">{icon}</b>{label}</span>)}</div><p className="preview-note">긴 리포트 대신, 궁금한 이야기부터 하나씩.</p></section>}</div></div>
 <aside className="principles"><div><span>추측 없는 계산</span><p>한국 음력과 역사적 시각을 반영해 간지를 계산합니다.</p></div><div><span>근거 있는 풀이</span><p>각 풀이에 일간·십성·합충 관계의 계산 근거를 표시합니다.</p></div><div><span>언제든 나의 리포트</span><p>휴대폰 웹에서 사용하고 리포트를 저장하거나 PDF로 남기세요.</p></div></aside>
 {report&&<PrintReport report={report}/>}
 <details className="home-screen-help"><summary>휴대폰 홈 화면에 두고 쓰기</summary><p>아이폰: Safari에서 이 주소를 열고 공유 버튼 → ‘홈 화면에 추가’를 눌러주세요.</p><p>안드로이드: Chrome에서 메뉴 ⋮ → ‘홈 화면에 추가’를 선택해주세요.</p><p>홈 화면 아이콘으로 다시 열 수 있어요. 출생정보를 남기려면 입력 화면에서 ‘이 기기에 출생정보 저장’을 직접 선택해주세요.</p></details>
 <footer>사주정원 <span>사주를 읽고 이야기를 나누는 곳</span></footer>
 <nav className="app-nav" aria-label="앱 메뉴">{[['consult','상담','♡'],['daily','오늘','☀'],['chart','원국','▦'],['profile','내 정보','◯']].map(([key,label,icon])=><button key={key} className={appSection===key?'active':''} aria-pressed={appSection===key} onClick={()=>goTo(key)}><span aria-hidden="true">{icon}</span>{label}</button>)}</nav>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
