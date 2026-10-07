import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { calculateSaju, REGIONS } from './engine/calculate';
import type { BirthInput, SajuResult } from './engine/types';
import './style.css';
const initial:BirthInput={name:'',gender:'선택 안 함',calendar:'solar',date:'1990-01-01',time:'12:00',region:'서울',leapMonth:false};
const calculationLabels:Record<string,string>={engine:'계산 엔진',timezone:'시간대',utcOffsetMinutes:'당시 UTC 오프셋 (분)',dstCorrectionMinutes:'서머타임 제거 (분)',standardTime:'보정된 표준시',timeZoneData:'시간대 자료',yearBoundary:'년주 전환',monthBoundary:'월주 전환',dayBoundary:'일주 전환',timeBasis:'시각 기준'};
function App(){
 const [input,setInput]=useState(initial),[result,setResult]=useState<SajuResult|null>(null),[error,setError]=useState('');
 const set=<K extends keyof BirthInput>(key:K,value:BirthInput[K])=>{setInput(p=>({...p,[key]:value}));setResult(null);setError('');};
 const submit=(event:React.FormEvent)=>{event.preventDefault();try{setResult(calculateSaju(input));setError('');}catch(e){setResult(null);setError(e instanceof Error?e.message:'계산에 실패했습니다.');}};
 const download=()=>{if(!result)return;const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='saju-chart.json';a.click();URL.revokeObjectURL(url);};
 return <main>
  <header><a className="brand" href="./">◈ 사주정원</a><span className="badge">만세력 · 첫 번째 버전</span></header>
  <section className="intro"><p className="eyebrow">나를 알아가는 첫 번째 기록</p><h1>당신의 사주,<br/>정확한 원국에서 시작합니다.</h1><p>생년월일과 시간을 바탕으로 네 기둥을 계산합니다.<br/>AI의 추측 없이, 계산된 데이터만 보여드립니다.</p></section>
  <div className="workspace"><section className="panel input-panel"><div className="section-title"><span className="number">01</span><h2>출생 정보</h2></div><p className="muted">한국 출생 · 양력 변환 후 1950–2030년 지원</p>
  <form onSubmit={submit}>
   <label>이름 <span className="optional">선택</span><input maxLength={40} placeholder="이름 또는 별명" value={input.name} onChange={e=>set('name',e.target.value)}/></label>
   <label>성별<select value={input.gender} onChange={e=>set('gender',e.target.value as BirthInput['gender'])}><option>선택 안 함</option><option>남성</option><option>여성</option></select></label>
   <fieldset><legend>달력 기준</legend><div className="calendar-choice">{(['solar','lunar'] as const).map(c=><label key={c} className={input.calendar===c?'selected':''}><input type="radio" name="calendar" checked={input.calendar===c} onChange={()=>{setInput(p=>({...p,calendar:c,leapMonth:false}));setResult(null);setError('');}}/>{c==='solar'?'양력':'음력'}</label>)}</div></fieldset>
   {input.calendar==='lunar'&&<label className="checkbox"><input type="checkbox" checked={input.leapMonth} onChange={e=>set('leapMonth',e.target.checked)}/> 윤달에 태어났어요</label>}
   <label>생년월일 {input.calendar==='lunar'&&<span className="optional">음력 숫자 그대로 입력</span>}<input type="date" required min="1949-01-01" max="2030-12-31" value={input.date} onChange={e=>set('date',e.target.value)}/></label>
   <div className="two-fields"><label>출생시간<input type="time" required value={input.time} onChange={e=>set('time',e.target.value)}/></label><label>출생지역<select value={input.region} onChange={e=>set('region',e.target.value)}>{REGIONS.map(r=><option key={r}>{r}</option>)}</select></label></div>
   <p className="help">시간은 출생기록의 당시 시계 시각으로 입력하세요. 서머타임은 자동 보정합니다. 시간을 모르면 시주를 정확히 계산할 수 없습니다.</p>
   {error&&<p role="alert" className="error">{error}</p>}
   <button className="primary" type="submit">사주 원국 계산하기 <span>→</span></button>
   <p className="privacy">입력 정보는 서버에 전송하거나 저장하지 않습니다.</p>
  </form></section>
  <section className="panel result-panel" aria-live="polite"><div className="section-title"><span className="number">02</span><h2>사주 원국</h2>{result&&<button className="text-button" onClick={download}>JSON 저장 ↓</button>}</div>
   {!result?<div className="empty"><div className="seal">四柱</div><h3>네 기둥에 담긴 출생의 기록</h3><p>출생 정보를 입력하면<br/>년주 · 월주 · 일주 · 시주를 확인할 수 있습니다.</p><div className="empty-pillars">{['년주','월주','일주','시주'].map(x=><span key={x}>{x}<b>—</b></span>)}</div></div>:<>
    <div className="result-heading"><h3>{result.input.name||'나'}의 만세력</h3><p>양력 {result.solarDate} · {result.input.time} · {result.input.region}</p><p>음력 {result.lunarDate.year}.{result.lunarDate.month}.{result.lunarDate.day} {result.lunarDate.intercalation?'(윤달)':''}</p></div>
    <div className="chart-scroll"><table className="chart"><thead><tr><th scope="col" className="row-label">원국</th>{result.pillars.map(p=><th scope="col" key={p.key}>{p.label}{p.key==='day'&&<small>나의 기준</small>}</th>)}</tr></thead><tbody>
     <tr><th scope="row">천간</th>{result.pillars.map(p=><td key={p.key} className={'element '+p.stem.element}><b>{p.stem.hanja}</b><span>{p.stem.korean} · {p.stem.polarity}{p.stem.element}</span></td>)}</tr>
     <tr><th scope="row">십성</th>{result.pillars.map(p=><td key={p.key}>{p.stemTenGod}</td>)}</tr>
     <tr><th scope="row">지지</th>{result.pillars.map(p=><td key={p.key} className={'element '+p.branch.element}><b>{p.branch.hanja}</b><span>{p.branch.korean} · {p.branch.polarity}{p.branch.element}</span></td>)}</tr>
     <tr><th scope="row">십성<small>본기 기준</small></th>{result.pillars.map(p=><td key={p.key}>{p.branchTenGod}</td>)}</tr>
     <tr><th scope="row">지장간<small>본기부터</small></th>{result.pillars.map(p=><td key={p.key} className="hidden-stems">{p.hiddenStems.map(s=><span key={s.hanja} title={`${s.polarity}${s.element}`}>{s.hanja} {s.korean}<small>{s.tenGod} · {s.polarity}{s.element}</small></span>)}</td>)}</tr>
    </tbody></table></div>
    <h4>오행 분포 <small>천간·지지 8글자 기준</small></h4><div className="elements">{Object.entries(result.elementCounts).map(([key,count])=><div key={key} className={'element '+key}><span>{key}</span><b>{count}</b><div className="bar"><i style={{width:`${count/8*100}%`}}/></div></div>)}</div>
    <details><summary>계산 기준과 확인할 사항</summary><ul>{Object.entries(result.calculation).map(([key,value])=><li key={key}>{calculationLabels[key]}: {value}</li>)}{result.warnings.map(w=><li key={w}>{w}</li>)}</ul></details>
    <details><summary>구조화된 계산 데이터 (JSON)</summary><pre>{JSON.stringify(result,null,2)}</pre></details>
   </>}
  </section></div>
  <aside className="principles"><div><span>계산과 해석의 분리</span><p>원국은 계산 엔진에서 생성합니다. AI 해석은 아직 제공하지 않습니다.</p></div><div><span>기준을 투명하게</span><p>입춘·절입 기준, 서머타임 자동 보정, 23시 일자 전환. 진태양시 보정은 적용하지 않습니다.</p></div><div><span>확장을 위한 기반</span><p>대운·세운·궁합 등은 검증 후 단계적으로 추가할 예정입니다.</p></div></aside>
  <footer>사주정원 <span>정확한 계산에서 시작하는 나의 만세력</span></footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
