import type {Character,SajuResult} from '../engine/types';
import type {FortuneData,Interpretation,LuckPillar,ReadingSection,Relation} from '../engine/fortuneTypes';
import {traits,gods,family,compact} from './themes';
import {buildNatalReadings} from './personalReadings';
function relationParagraph(relations:Relation[]):string{
 const clashes=relations.filter(r=>r.type==='충'),joins=relations.filter(r=>r.type==='육합'||r.type==='천간합');
 if(clashes.length){const work=clashes.some(r=>r.left==='월주'),close=clashes.some(r=>r.left==='일주');return `${clashes.map(r=>`${r.left}와 ${r.right}의 ${r.pair}충`).join(', ')}이 이어져 있어요. ${work?'월주와 연결되므로 업무 일정과 맡은 역할의 조정을 먼저 살펴보세요. ':''}${close?'일주와 연결되므로 가까운 사람과의 약속·표현 방식을 함께 확인해보세요. ':''}변경할 일이 있다면 일정과 기준을 하나씩 나눠보면 좋아요.`;}
 if(joins.length)return `${joins.map(r=>`${r.left}와 ${r.right}의 ${r.pair}${r.type}`).join(', ')}이 연결돼요. 사람과 생활 영역이 맞닿는 이야기로 읽을 수 있으니, 함께 진행할 일을 정하고 서로 맡을 범위를 분명히 해보세요.`;
 const other=relations.filter(r=>['형','파','해'].includes(r.type));
 if(other.length)return `${other.map(r=>`${r.left}·${r.right} ${r.pair}${r.type}`).join(', ')}이 이어져 있어요. 반복해서 점검할 일과 서로 다른 기대를 살펴보고, 작은 약속부터 확인해보세요.`;
 return '원국과 이 구간 사이에 쌍별 합·충·형·파·해가 없어요. 일간에 대한 두 십성의 주제를 중심으로 자신의 일정과 선택을 정리해보세요.';
}
export function luckReading(p:LuckPillar & {relations:Relation[]},id:string,title:string,subtitle:string,natal?:SajuResult):ReadingSection{
 const stem=gods[p.stemTenGod],branch=gods[p.branchTenGod];
 const paragraphs=[`${compact(p)}은 ${stem.theme}에 초점을 두고 읽는 흐름이에요. ${stem.meaning} ${p.stemTenGod===p.branchTenGod?'천간과 지지 본기에 같은 십성이 나란히 있어요.':`지지 본기의 ${p.branchTenGod}은 ${branch.meaning}`}`,relationParagraph(p.relations)];
 if(natal)paragraphs.push(`당신의 일간 ${natal.pillars[2].stem.korean}${natal.pillars[2].stem.element}를 기준으로 ${p.stemTenGod}·${p.branchTenGod}을 계산했어요. 원국 월지의 ${natal.pillars[1].branchTenGod} 주제와 이번 흐름을 함께 보면, ${gods[natal.pillars[1].branchTenGod].action}`);
 return {id,title,subtitle,paragraphs,evidence:[`운 간지 ${p.ganji}`,`천간 십성 ${p.stemTenGod}`,`본기 십성 ${p.branchTenGod}`,...p.relations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`)],notes:['합이나 충의 유무를 사건 발생이나 길흉 점수로 확정하지 않습니다.'],actions:[...new Set([stem.action,branch.action,stem.watch])]};
}
export function interpretReport(natal:SajuResult,fortune:FortuneData):Interpretation{
 const day=natal.pillars[2].stem,trait=traits[day.hanja];
 const sections=buildNatalReadings(natal,fortune);
 return {method:'traditional-rules-v2',intro:`${natal.input.name||'당신'}의 일간은 ${day.korean}${day.element}이에요. ${trait.image}에 빗대어, 태어난 계절과 글자 속에 담긴 이야기를 함께 읽어볼게요. 성향부터 일과 살림, 가까운 관계까지 차근차근 살펴보세요.`,sections,annual:Object.fromEntries(fortune.annual.map(p=>{
 const section=luckReading(p,`annual-${p.year}`,`${p.year}년의 흐름`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)} · 입춘 기준`,natal);
 const stemFamily=family(p.stemTenGod),branchFamily=family(p.branchTenGod);
 section.paragraphs.push(`재물·일의 관점에서는 ${stemFamily==='재성'||branchFamily==='재성'?'재성 글자가 있어 살림을 챙기고 새 기회를 살펴보는 이야기로 읽어볼 수 있어요.':stemFamily==='식상'||branchFamily==='식상'?'식상 글자가 있어 작은 결과물을 만들고 생각을 꺼내는 흐름으로 읽어요.':'다른 십성이 중심이라서 돈이 얼마나 늘어날지보다 일을 맡고 자원을 챙기는 방식을 먼저 살펴보면 좋아요.'} ${stemFamily==='관성'||branchFamily==='관성'?'관성도 있으니 집안의 약속을 정해두듯 맡은 역할과 기준을 함께 챙겨보세요.':'실제 선택을 할 때는 내 경험과 일의 조건도 옆에 놓고 비교해보세요.'}`);
 const spouseRelations=p.relations.filter(r=>r.left==='일주');section.paragraphs.push(`가까운 관계에서는 ${spouseRelations.length?spouseRelations.map(r=>`일주와 연운의 ${r.pair}${r.type}`).join(', ')+ '이 이어져 있어요. 생활의 기준과 서로의 기대를 구체적으로 나눠보는 관점이에요.':'일주와 연운 사이에 표시할 쌍별 관계가 없어요. 이때는 관계를 좋다 나쁘다 재기보다, 둘 사이에서 지켜온 약속을 차근히 돌아보세요.'}`);
 if(p.cycleRelations.length){section.paragraphs.push(`대운과 연운을 함께 보면 ${p.cycleRelations.map(r=>r.pair+r.type).join(', ')}이 이어져 있어요. ${p.year}년 7월 기준 대운과 비교한 값으로, 그해에 대운이 바뀐다면 앞뒤 구간을 나누어 읽어보세요.`);section.evidence.push(...p.cycleRelations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`));}
 return [p.year,section];
 })),months:fortune.months.map(p=>luckReading(p,`month-${p.index}`,`${p.term}부터의 월운`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)}`,natal)),daily:luckReading(fortune.daily,'daily','오늘의 일진 풀이',fortune.referenceDate,natal),cycles:fortune.cycles.periods.map(p=>luckReading(p,`cycle-${p.index}`,`${p.index}대운 · ${compact(p)}`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)}`,natal)),limitations:['이 풀이는 전통 배속과 공개된 규칙을 적용한 해석이며 AI가 생성한 예언이 아닙니다.','개인의 성격·사건·성과를 확정하거나 운세 점수를 임의로 만들지 않습니다.','신강·신약, 용신·희신, 실제 합화, 궁합과 결혼 시기 판정은 미구현입니다.','절입 천문 모델의 KASI 전 기간 독립 대조는 아직 TODO입니다.']};
}
