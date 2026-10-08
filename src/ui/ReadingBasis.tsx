import type {FullReport} from '../engine/fortuneTypes';
import type {ConsultationTopic} from '../interpretation/consultation';
import {buildReadingContext} from '../interpretation/context';
import type {ReadingTopic} from '../interpretation/context';
const luckTopics:ConsultationTopic[]=['daily','annual','nextYear','cycles'];
/** Show calculated facts before the narrator so the user can assess the reading. */
export function ReadingBasis({report,topic}:{report:FullReport;topic:ConsultationTopic}){
 const day=report.natal.pillars[2],context=luckTopics.includes(topic)?buildReadingContext(report,topic as ReadingTopic):null,period=context?.period;
 const label=topic==='daily'?'오늘 일진':topic==='annual'||topic==='nextYear'?'조회 세운':topic==='cycles'?'현재 대운':'월지';
 const native=report.natal.pillars[1],current=report.fortune.calendar;
 return <aside className="reading-basis" aria-label="이번 풀이의 명리 근거"><div className="basis-grid"><div><small>나의 일간</small><strong>{day.stem.korean}{day.stem.element} <span>{day.stem.hanja}</span></strong></div><div><small>{label}</small><strong>{context?(period?`${period.korean} ${period.ganji}`:'계산 보류'):`${native.branch.korean} ${native.branch.hanja}`}</strong></div><div><small>{context?'십성 · 천간 / 지지 본기':'월지 본기의 십성'}</small><strong>{context?(period?`${period.stemTenGod} / ${period.branchTenGod}`:'입력·구간 확인'):native.branchTenGod}</strong></div></div>{topic==='daily'&&context?.availability==='ready'&&<p className="basis-background">조회일 정오 기준 · {context.background.currentDaeyun?`${context.background.currentDaeyun.korean} 대운`:'대운 미정'} · {current.annual.stem.korean}{current.annual.branch.korean} 세운 · {current.month.stem.korean}{current.month.branch.korean} 월운</p>}{context?.natalLinks.length?<div className="basis-links"><span>원국과의 관계</span>{context.natalLinks.slice(0,4).map((link,i)=><b key={i}>{link.natalLabel} {link.name}</b>)}{context.natalLinks.length>4&&<span>외 {context.natalLinks.length-4}개 · 이야기와 근거에서 확인</span>}</div>:null}</aside>;
}
