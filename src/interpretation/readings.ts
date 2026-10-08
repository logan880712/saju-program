import type {SajuResult} from '../engine/types';
import type {FortuneData,Interpretation,LuckPillar,ReadingSection,Relation} from '../engine/fortuneTypes';
import {gods,compact} from './themes';
import {buildNatalReadings} from './personalReadings';
import {buildConsultation} from './consultation';
import type {ConsultationTopic} from './consultation';
function relationParagraph(relations:Relation[]):string{
 const clashes=relations.filter(r=>r.type==='충'),joins=relations.filter(r=>r.type==='육합'||r.type==='천간합');
 if(clashes.length){const work=clashes.some(r=>r.left==='월주'),close=clashes.some(r=>r.left==='일주');return `${clashes.map(r=>`${r.left}와 ${r.right}의 ${r.pair}충`).join(', ')}이 이어져 있어요. ${work?'월주와 연결되므로 업무 일정과 맡은 역할의 조정을 먼저 살펴보세요. ':''}${close?'일주와 연결되므로 가까운 사람과의 약속·표현 방식을 함께 확인해보세요. ':''}변경할 일이 있다면 일정과 기준을 하나씩 나눠보면 좋아요.`;}
 if(joins.length)return `${joins.map(r=>`${r.left}와 ${r.right}의 ${r.pair}${r.type}`).join(', ')}이 연결돼요. 사람과 생활 영역이 맞닿는 이야기로 읽을 수 있으니, 함께 진행할 일을 정하고 서로 맡을 범위를 분명히 해보세요.`;
 const other=relations.filter(r=>['형','파','해'].includes(r.type));
 if(other.length)return `${other.map(r=>`${r.left}·${r.right} ${r.pair}${r.type}`).join(', ')}이 이어져 있어요. 반복해서 점검할 일과 서로 다른 기대를 살펴보고, 작은 약속부터 확인해보세요.`;
 return '원국과 이 구간 사이에 쌍별 합·충·형·파·해가 없어요. 일간에 대한 두 십성의 주제를 중심으로 자신의 일정과 선택을 정리해보세요.';
}
export function luckReading(p:LuckPillar & {relations:Relation[];startDate?:string;endDate?:string},id:string,title:string,subtitle:string,natal?:SajuResult):ReadingSection{
 const birth=natal?`${natal.calculation.standardTime}:00`:undefined;
 const evidence=[`운 간지 ${p.ganji}`,`천간 십성 ${p.stemTenGod}`,`본기 십성 ${p.branchTenGod}`,...p.relations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`)];
 if(birth&&p.endDate&&p.endDate<=birth){
  return {id,title,subtitle,paragraphs:[`이 구간은 입력된 출생 시각 ${birth}보다 앞선 출생 전 기간이에요. 개인 운세를 붙이지 않고 계산된 달력 구간만 표시할게요.`,`간지 ${compact(p)}와 구간의 계산 자료를 보존하되, 이 기간의 개인 성향이나 사건은 해석하지 않아요.`],evidence:[...evidence,`출생 표준시 ${birth}`],notes:['종료 시각이 출생 시각 이전이거나 같은 구간에는 개인 운세 해석을 생성하지 않습니다.'],actions:['출생 이후의 구간으로 조회 연도나 운 구간을 다시 선택해주세요.']};
 }
 const stem=gods[p.stemTenGod],branch=gods[p.branchTenGod];
 const paragraphs=[`${compact(p)}은 ${stem.theme}에 초점을 두고 읽는 흐름이에요. ${stem.meaning} ${p.stemTenGod===p.branchTenGod?'천간과 지지 본기에 같은 십성이 나란히 있어요.':`지지 본기의 ${p.branchTenGod}은 ${branch.meaning}`}`,relationParagraph(p.relations)];
 if(natal)paragraphs.push(`당신의 일간 ${natal.pillars[2].stem.korean}${natal.pillars[2].stem.element}를 기준으로 ${p.stemTenGod}·${p.branchTenGod}을 계산했어요. 원국 월지의 ${natal.pillars[1].branchTenGod} 주제와 이번 흐름을 함께 보면, ${gods[natal.pillars[1].branchTenGod].action}`);
 if(birth&&p.startDate&&p.endDate&&p.startDate<birth&&birth<p.endDate)paragraphs.unshift(`이 구간은 출생 시각을 걸쳐 있어요. 개인 풀이는 출생 이후 ${birth}부터 ${p.endDate} 전까지의 부분만 참고해주세요.`);
 return {id,title,subtitle,paragraphs,evidence,notes:['합이나 충의 유무를 사건 발생이나 길흉 점수로 확정하지 않습니다.'],actions:[...new Set([stem.action,branch.action,stem.watch])]};
}
export function interpretReport(natal:SajuResult,fortune:FortuneData):Interpretation{
 const calculated={natal,fortune};
 function grounded(section:ReadingSection,topic:ConsultationTopic):ReadingSection{
  const story=buildConsultation(calculated,topic);
  return {...section,paragraphs:[...new Set([story.opening,...story.chapters.map(c=>c.text),story.takeaway])],actions:[...story.actions],notes:[...new Set([...(section.notes||[]),...story.notes])],evidence:[...new Set([...section.evidence,...story.evidence])]};
 }
 const sections=buildNatalReadings(natal,fortune).map(section=>grounded(section,section.id as ConsultationTopic));
 const annual=Object.fromEntries(fortune.annual.map(p=>{
  const section=luckReading(p,`annual-${p.year}`,`${p.year}년의 흐름`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)} · 입춘 기준`,natal);
  section.evidence.push(...p.cycleRelations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`));
  return [p.year,grounded(section,p.year===fortune.referenceYear?'annual':'nextYear')];
 }));
 return {
  method:'traditional-rules-v2',
  intro:buildConsultation(calculated,'nature').opening,
  sections,annual,
  months:fortune.months.map(p=>luckReading(p,`month-${p.index}`,`${p.term}부터의 월운`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)}`,natal)),
  daily:grounded(luckReading(fortune.daily,'daily','오늘의 일진 풀이',fortune.referenceDate,natal),'daily'),
  cycles:fortune.cycles.periods.map(p=>luckReading(p,`cycle-${p.index}`,`${p.index}대운 · ${compact(p)}`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)}`,natal)),
  limitations:['이 풀이는 전통 배속과 공개된 규칙을 적용한 해석이며 AI가 생성한 예언이 아닙니다.','개인의 성격·사건·성과를 확정하거나 운세 점수를 임의로 만들지 않습니다.','신강·신약, 용신·희신, 실제 합화, 궁합과 결혼 시기 판정은 미구현입니다.','절입 천문 모델의 KASI 전 기간 독립 대조는 아직 TODO입니다.'],
 };
}
