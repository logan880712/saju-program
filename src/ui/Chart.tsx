import type {SajuResult} from '../engine/types';
const calculationLabels:Record<string,string>={engine:'계산 엔진',timezone:'시간대',utcOffsetMinutes:'당시 UTC 오프셋 (분)',dstCorrectionMinutes:'서머타임 제거 (분)',standardTime:'보정된 표준시',timeZoneData:'시간대 자료',yearBoundary:'년주 전환',monthBoundary:'월주 전환',dayBoundary:'일주 전환',timeBasis:'시각 기준'};
export function Chart({result}:{result:SajuResult}){return <>
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
</>;}
