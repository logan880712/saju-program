import type {FullReport, Relation} from '../engine/fortuneTypes';
import type {GodGroup, GodSource} from '../engine/profile';
import {traits} from './themes';
import {buildReadingContext} from './context';
import type {ReadingContext, ReadingPeriod} from './context';

type CalculatedReport=Pick<FullReport,'natal'|'fortune'>;
export type ConsultationTopic = 'nature'|'wealth'|'career'|'relationship'|'change'|'elements'|'daily'|'annual'|'nextYear'|'cycles';
export const CONSULTATION_TOPICS:{id:ConsultationTopic;label:string;question:string;icon:string}[] = [
  {id:'nature',label:'타고난 모습 이야기',question:'할매, 저는 어떤 사람인가요?',icon:'🌿'},
  {id:'wealth',label:'돈과 재물 이야기',question:'돈을 모으고 쓰는 흐름을 알려주세요.',icon:'🪙'},
  {id:'career',label:'일과 직업 이야기',question:'저에게 맞는 일하는 방식은 뭘까요?',icon:'🧺'},
  {id:'relationship',label:'가까운 관계 이야기',question:'연애와 가까운 관계 이야기를 해주세요.',icon:'🫶'},
  {id:'daily',label:'오늘 이야기',question:'오늘은 무엇을 챙겨보면 좋을까요?',icon:'☀️'},
  {id:'annual',label:'올해 이야기',question:'올해의 흐름을 이야기해주세요.',icon:'🍵'},
  {id:'nextYear',label:'내년 이야기',question:'내년은 어떤 주제로 살펴볼까요?',icon:'🌅'},
  {id:'cycles',label:'대운 이야기',question:'제 대운의 흐름을 쉽게 풀어주세요.',icon:'🌊'},
  {id:'change',label:'변화와 이동 이야기',question:'이직이나 이사를 생각할 때 뭘 살펴볼까요?',icon:'🚪'},
  {id:'elements',label:'오행 이야기',question:'제 오행을 쉽게 설명해주세요.',icon:'🌱'},
];
export interface ConsultationStory {
  topic:ConsultationTopic;
  title:string;
  opening:string;
  chapters:{title:string;text:string}[];
  takeaway:string;
  actions:string[];
  evidence:string[];
  notes:string[];
}

const guide:Record<string,{meaning:string;work:string;money:string;relationship:string;action:string}>={
 비견:{meaning:'나와 같은 기운으로, 내 기준과 동료의 자리를 보는 십성',work:'같은 일을 하는 사람과 담당 범위를 나누는 쪽',money:'함께 쓰는 돈과 개인 돈을 구분하는 쪽',relationship:'서로의 선택을 존중하되 내 의견도 분명히 말하는 쪽',action:'함께하는 일 하나의 담당자와 결정 범위를 정해봐요.'},
 겁재:{meaning:'나와 같은 오행이면서 음양이 달라, 협력과 경쟁을 함께 보는 십성',work:'사람을 모으되 공을 나누는 기준을 정하는 쪽',money:'공동 지출과 나눠 낼 비용을 먼저 확인하는 쪽',relationship:'같이 움직일 일과 각자의 시간을 나누는 쪽',action:'여럿이 함께 쓰는 돈이나 시간의 기준을 미리 맞춰봐요.'},
 식신:{meaning:'내 기운이 만들어내는 것으로, 꾸준한 솜씨와 생산을 보는 십성',work:'익숙한 과정을 반복해 결과물 하나를 마무리하는 쪽',money:'꾸준히 만든 결과물의 비용과 대가를 확인하는 쪽',relationship:'작은 배려를 말이나 행동으로 꾸준히 건네는 쪽',action:'잘하는 일 하나를 작게 완성하고, 쓴 시간과 비용을 적어봐요.'},
 상관:{meaning:'내가 만들어내는 기운 중 표현과 개선을 보는 십성',work:'불편한 방법을 짚되 실행할 대안을 함께 제시하는 쪽',money:'새 아이디어의 실제 수요와 비용을 먼저 확인하는 쪽',relationship:'솔직하게 말하되 상대가 들을 방식도 살피는 쪽',action:'바꾸고 싶은 점을 말할 때 작은 대안 하나를 함께 붙여봐요.'},
 편재:{meaning:'내가 다루는 재물의 기운 중 거래와 넓은 기회를 보는 십성',work:'사람과 자원을 연결하되 거래 조건을 분명히 하는 쪽',money:'새 제안의 자금·기간·책임을 따로 계산하는 쪽',relationship:'함께할 경험과 그에 드는 시간·돈을 맞추는 쪽',action:'새 제안의 좋은 점 옆에 필요한 돈·시간·책임도 적어봐요.'},
 정재:{meaning:'내가 다루는 재물의 기운 중 반복 수입과 생활의 관리를 보는 십성',work:'금액·마감·약속을 빠짐없이 확인하고 마무리하는 쪽',money:'들어올 돈과 나갈 돈을 확인하고 남길 몫을 정하는 쪽',relationship:'생활의 작은 약속을 지키고 서로의 부담을 확인하는 쪽',action:'오늘 확인할 금액이나 약속 하나를 정하고, 내 몫과 상대 몫을 맞춰봐요.'},
 편관:{meaning:'나를 제어하는 기운 중 강한 요구와 책임을 보는 십성',work:'급한 과제라도 우선순위와 지원을 정한 뒤 맡는 쪽',money:'의무 비용과 감당할 부담을 먼저 확인하는 쪽',relationship:'상대에게 바라는 수준과 내가 감당할 몫을 나누는 쪽',action:'급한 일 하나의 우선순위와 도움받을 곳을 먼저 정해봐요.'},
 정관:{meaning:'나를 제어하는 기운 중 공식적인 약속과 역할을 보는 십성',work:'규정·담당 역할·완료 기준을 맞추는 쪽',money:'계약과 정해진 지급 조건을 확인하는 쪽',relationship:'서로 지킬 약속을 정하되 각자의 사정도 듣는 쪽',action:'구두로만 정한 일 하나의 역할과 마감을 다시 확인해봐요.'},
 편인:{meaning:'나를 도와주는 기운 중 탐구와 다른 관점의 배움을 보는 십성',work:'낯선 문제를 조사하고 작은 방식으로 시험하는 쪽',money:'배우거나 준비하는 데 쓸 비용의 범위를 정하는 쪽',relationship:'각자의 관심과 혼자 생각할 시간을 존중하는 쪽',action:'궁금한 것 하나를 찾아보고 실제로 써볼 작은 방법을 정해봐요.'},
 정인:{meaning:'나를 도와주는 기운 중 학습과 지원을 보는 십성',work:'필요한 자료와 도움을 받아 일을 차근차근 정리하는 쪽',money:'장기 준비 비용과 당장 쓸 돈을 나누는 쪽',relationship:'도움이 필요한지 묻고, 나도 필요한 도움을 말하는 쪽',action:'어려운 일 하나에 필요한 자료나 도와줄 사람을 찾아봐요.'},
};
const korean:Record<string,string>={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계',子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
const particle=(word:string,closed:string,open:string)=>word+((word.charCodeAt(word.length-1)-0xac00)%28?closed:open);
const hangul=(s:string)=>[...s].map(c=>korean[c]||c).join('');
const ganji=(p:{stem:{korean:string};branch:{korean:string}})=>p.stem.korean+p.branch.korean;
const stemName=(s:{korean:string;element:string})=>s.korean+s.element;
const branchName=(b:{korean:string;element:string})=>b.korean+b.element;
const groupSources=(r:CalculatedReport,g:GodGroup)=>[...r.fortune.profile.groups[g].visible,...r.fortune.profile.groups[g].hidden];
const sourceEvidence=(r:CalculatedReport,...groups:GodGroup[])=>groups.flatMap(g=>groupSources(r,g).map(s=>`${s.position} ${s.layer} ${s.hanja}: ${s.god}`));
const relationEvidence=(relations:Relation[])=>relations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`);
function sourceName(r:CalculatedReport,s:GodSource):string {
 const p=r.natal.pillars.find(p=>p.label===s.position)!;
 const ch=p.hiddenStems.find(c=>c.hanja===s.hanja)||p.stem;
 return `${p.label} ${s.layer==='천간'?`천간 ${stemName(ch)}`:s.layer==='본기'?`지지 ${branchName(p.branch)}의 본기 ${stemName(ch)}`:`${branchName(p.branch)} 속 지장간 ${stemName(ch)}`} ${s.god}`;
}
function sourceSummary(r:CalculatedReport,g:GodGroup):string {
 const sources=groupSources(r,g);
 if(!sources.length)return `${g}에 해당하는 십성은 천간과 지장간에서 확인되지 않아요.`;
 const visible=r.fortune.profile.groups[g].visible,hidden=r.fortune.profile.groups[g].hidden;
 const facts=sources.slice(0,3).map(s=>sourceName(r,s)).join(', ');
 return `${facts}${sources.length>3?` 등 ${sources.length}곳에서`:''} 배속을 확인할 수 있어요. ${!visible.length&&hidden.length?'천간이나 지지 본기에 드러나진 않고 지장간, 곧 지지 속에 담긴 글자에서 확인되는구먼.':hidden.length?'드러난 십성과 지장간의 십성을 함께 놓고 읽어야겠어요.':''}`;
}
const relationPairs:Record<Relation['type'],string[]>={천간합:['甲己','乙庚','丙辛','丁壬','戊癸'],육합:['子丑','寅亥','卯戌','辰酉','巳申','午未'],충:['子午','丑未','寅申','卯酉','辰戌','巳亥'],형:['寅巳','巳申','寅申','丑戌','戌未','丑未','子卯','辰辰','午午','酉酉','亥亥'],파:['子酉','丑辰','寅亥','卯午','巳申','未戌'],해:['子未','丑午','寅巳','卯辰','申亥','酉戌']};
function relationName(r:Relation):string {
 const pair=relationPairs[r.type].find(p=>p===r.pair||p===r.pair[1]+r.pair[0])||r.pair;
 return `${hangul(pair)}${r.type==='천간합'?'합':r.type==='형'&&pair[0]===pair[1]?'자형':r.type}`;
}
const sortedRelations=(rs:Relation[])=>[...rs].sort((a,b)=>({'충':0,'형':1,'천간합':2,'육합':3,'파':4,'해':5}[a.type]-{'충':0,'형':1,'천간합':2,'육합':3,'파':4,'해':5}[b.type]));
const relationMeaning:Record<Relation['type'],string>={천간합:'서로 묶이는 관계라 두 역할을 어떻게 함께 다룰지',육합:'서로 연결되는 관계라 함께할 일과 각자의 몫을',충:'서로 다른 방향이 맞서는 관계라 바꿔야 할 일정과 기준을',형:'반복해 점검하는 관계라 기준이 지나치게 빡빡하지 않은지',파:'세부가 어긋나는 관계라 작은 약속과 처리 순서를',해:'기대가 엇갈리는 관계라 상대에게 바라던 것이 무엇인지'};
function relationText(report:CalculatedReport,relations:Relation[],target?:ReadingPeriod|null):string {
 if(!relations.length)return '이 구간에는 원국과의 쌍별 합·충·형·파·해가 표시되지 않아요. 이 경우에는 십성의 역할과 실제 맡은 일을 중심으로 풀어보면 좋겠어요.';
 return sortedRelations(relations).slice(0,2).map(r=>{
  const a=report.natal.pillars.find(p=>p.label===r.left),b=report.natal.pillars.find(p=>p.label===r.right);
  const left=a?`${a.label} ${ganji(a)}`:r.left,right=b?`${b.label} ${ganji(b)}`:target?`${r.right} ${target.korean}`:r.right;
  const area=r.left==='월주'||r.right==='월주'?'월주는 일과 사회생활의 환경을 함께 읽는 자리라, 업무의 역할과 일정을 먼저':r.left==='일주'||r.right==='일주'?'일주는 나와 가까운 생활을 읽는 자리라, 상대와의 약속과 생활 기준을 먼저':r.left==='시주'||r.right==='시주'?'시주는 계획과 결과를 함께 살펴보는 자리라, 준비한 일의 순서와 마무리를 먼저':'년주는 넓은 인연과 배경을 함께 읽는 자리라, 주변 사람들과 정한 기준을 먼저';
  return `${left}와 ${right} 사이에 ${relationName(r)} 관계가 있어요. ${relationMeaning[r.type]} 살피는 배속이에요. ${area} 맞춰보는 게 좋겠어요.`;
 }).join(' ');
}
function rootText(report:CalculatedReport):string {
 const day=report.natal.pillars[2].stem,roots=report.fortune.profile.roots;
 if(!roots.length)return `${stemName(day)}와 같은 ${day.element} 오행의 지장간은 원국에 없어요. 통근, 곧 같은 오행의 뿌리 자리만으로 강약을 정하지 않고 월령과 다른 십성도 함께 살펴야 해요.`;
 const facts=roots.map(r=>{const p=report.natal.pillars.find(p=>p.label===r.position)!;return `${p.label} ${branchName(p.branch)} 속 ${r.stems.map(s=>stemName(p.hiddenStems.find(h=>h.hanja===s)!)).join('·')}`;}).join(', ');
 return `${stemName(day)}의 같은 오행 뿌리는 ${facts}에서 확인돼요. 이를 통근이라고 하는데, 나무를 보면서 땅속 뿌리 자리까지 확인하는 셈이지요. 겉의 천간만으로 끝내지 않고 이 자리도 함께 읽는구먼.`;
}
function backgroundText(context:ReadingContext):string {
 if(context.availability==='before_birth')return `${context.background.referenceDate} 조회일은 입력된 출생일보다 앞선 날이에요. 태어나기 전 운을 개인화된 배경으로 붙이지 않고, 여기서는 계산된 원국의 구조만 참고해볼게요.`;
 const {referenceDate,currentDaeyun:d,currentSolarYear:y,currentSolarMonth:m}=context.background;
 const pieces=[d?`${d.korean} 대운(${d.stemTenGod}·${d.branchTenGod})`:null,y?`${y.korean} 세운(${y.stemTenGod}·${y.branchTenGod})`:null,m?`${m.korean} 월운(${m.stemTenGod}·${m.branchTenGod})`:null].filter(Boolean);
 if(!pieces.length)return `${referenceDate} 기준 현재 운의 배경 자료가 없어서, 다른 해의 값을 가져와 붙이지 않을게요.`;
 const detail=m?`이번 월운의 ${particle(m.stemTenGod,'은','는')} ${guide[m.stemTenGod].meaning}이에요. ${guide[m.stemTenGod].work}을 먼저 살펴봐요.`:y?`이 세운의 ${particle(y.stemTenGod,'은','는')} ${guide[y.stemTenGod].meaning}이에요.`:'';
 return `${referenceDate} 정오 기준 배경은 ${pieces.join(', ')}이에요. 하루의 십성은 그날의 주제이고, 대운·세운·월운은 그 주제가 놓인 긴 배경이지요. ${detail}`;
}
function luckWorkMoney(p:ReadingPeriod):string {
 const a=guide[p.stemTenGod],b=guide[p.branchTenGod];
 return `일에서는 ${particle(p.stemTenGod,'을','를')} ${a.work}으로, 재물에서는 ${a.money}으로 풀어보면 좋겠어요. ${p.stemTenGod===p.branchTenGod?`천간과 지지 본기에 ${particle(p.stemTenGod,'이','가')} 함께 있으니, 그 역할이 어떤 실제 일과 맞닿는지 한 번 더 살펴봐요.`:`지지의 ${p.branchTenGod}도 함께 있으므로 ${b.money}을 같이 챙겨야겠어요.`}`;
}
function luckRelationship(report:CalculatedReport,p:ReadingPeriod,relations:Relation[]):string {
 const close=relations.filter(r=>r.left==='일주'||r.right==='일주');
 const branch=report.natal.pillars[2].branch;
 return close.length?`${relationText(report,close,p)} 관계에서는 ${p.branchTenGod}의 ${guide[p.branchTenGod].relationship}을 살펴봐요.`:`원국의 일지 ${branchName(branch)}와 이 운 사이에는 표시할 쌍별 관계가 없어요. 가까운 관계는 ${p.branchTenGod}의 ${guide[p.branchTenGod].relationship}으로 읽고, 실제로 어떤 약속을 나눴는지 확인해봐요.`;
}
function periodOpening(name:string,master:string,p:ReadingPeriod,period:string):string {
 const distinct=p.stemTenGod===p.branchTenGod;
 return `자, ${name}은 ${master} 일간이에요. ${period.includes('하루')?`${period.replace(' 하루','')}의 일진은`:`${period}의 간지는`} ${p.korean}${period.includes('하루')?'일':' 운'}이고, ${master} 기준 천간·지지 본기는 ${p.stemTenGod}·${p.branchTenGod}으로 잡히는구먼. ${particle(p.stemTenGod,'은','는')} ${guide[p.stemTenGod].meaning}${distinct?'이에요.':`이고, ${particle(p.branchTenGod,'은','는')} ${guide[p.branchTenGod].meaning}이에요.`}`;
}
/** Read already calculated facts and translate traditional roles into a personal consultation. */
export function buildConsultation(report:CalculatedReport,topic:ConsultationTopic):ConsultationStory {
 const {natal,fortune}=report,profile=fortune.profile,day=natal.pillars[2],month=natal.pillars[1],master=stemName(day.stem);
 const name=natal.input.name.trim()?`${natal.input.name.trim()}님`:'당신';
 const dailyContext=buildReadingContext(report,'daily');
 const story:ConsultationStory={topic,title:CONSULTATION_TOPICS.find(t=>t.id===topic)!.label,opening:'',chapters:[],takeaway:'',actions:[],evidence:[],notes:['계산된 원국·운을 근거로 전통 명리 해석을 적용한 규칙 상담입니다. AI가 생년월일에서 원국을 추측하지 않습니다.','십성과 궁위·합충의 전통 해석은 관점이며 실제 성격·사건·성과를 확정하는 값은 아닙니다.']};
 const monthEvidence=[`일간 ${day.stem.hanja} ${day.stem.polarity}${day.stem.element}`,`월지 ${month.branch.hanja}, 계절 ${profile.season}, 본기 ${month.hiddenStems[0].hanja} ${profile.monthMainGod}`];
 const rootEvidence=profile.roots.map(r=>`${r.position} ${r.branch}: 일간 동오행 지장간 ${r.stems.join('·')}`);
 if(topic==='nature') {
  story.title=`${master} 일간, 내 타고난 모습`;
  story.opening=`자, ${name}은 ${master} 일간이고 ${branchName(month.branch)} 월지, ${profile.season}의 사주예요. ${master}는 ${traits[day.stem.hanja].image}에 비유하지만, 할매는 비유만 보지 않고 월지의 ${profile.monthMainGod}과 뿌리 자리도 함께 볼 거예요.`;
  story.chapters=[
   {title:`월령 ${branchName(month.branch)}, ${profile.monthMainGod}의 환경`,text:`월령은 태어난 달의 계절과 환경을 읽는 기준이에요. ${branchName(month.branch)}의 본기 ${stemName(month.hiddenStems[0])}는 ${master}에게 ${profile.monthMainGod}, ${guide[profile.monthMainGod].meaning}으로 배속돼요. 그래서 ${guide[profile.monthMainGod].work}이 실제 성향과 어떤 부분에서 닮았는지 살펴보면 좋겠어요.`},
   {title:'통근: 내 기운이 기댈 자리',text:rootText(report)},
   {title:'천간과 지장간의 십성을 함께 읽기',text:`${sourceSummary(report,profile.monthMainGod==='정인'||profile.monthMainGod==='편인'?'식상':'인성')} 월지의 역할을 그대로 따르는지, 배우고 표현하는 재료를 함께 쓰는지는 살아온 경험과 비교해봐요. ${traits[day.stem.hanja].balance}`},
  ];
  story.takeaway=`${master}의 모습만 외우지 말고, ${branchName(month.branch)} 월지의 ${particle(profile.monthMainGod,'이','가')} 내 일상에서 어떻게 쓰이는지 하나 찾아봐요.`;
  story.actions=[guide[profile.monthMainGod].action,traits[day.stem.hanja].balance];story.evidence=[...monthEvidence,...rootEvidence];story.notes.push('월령·통근 자료만으로 신강·신약이나 용신·희신을 확정하지 않습니다.');
 } else if(topic==='wealth') {
  const wealth=groupSources(report,'재성'),output=groupSources(report,'식상'),steady=wealth.some(s=>s.god==='정재'),opportunity=wealth.some(s=>s.god==='편재');
  const label=steady&&opportunity?'정재와 편재':steady?'정재':opportunity?'편재':'재성';
  story.title=`${master}의 재성, 돈을 다루는 방식`;
  story.opening=`자, ${name}은 ${master} 일간이고, 원국의 돈 이야기는 ${wealth.length?`${label}에서 먼저 읽어요`:'재성이 없는 구조에서 출발해요'}. ${steady&&opportunity?'정재는 반복 수입과 살림, 편재는 거래와 넓은 기회를 읽는 십성이니 둘의 쓰임을 나누어 보겠어요.':steady?'정재는 반복 수입과 생활의 관리를 보는 십성이니, 어디에 놓였는지부터 살펴보겠어요.':opportunity?'편재는 거래와 넓은 기회를 보는 십성이니, 어떤 역할과 이어지는지 살펴보겠어요.':'재성이 없다는 사실을 가난이라는 결론으로 옮기지 않고, 다른 십성과 실제 일의 조건을 함께 보겠어요.'}`;
  story.chapters=[
   {title:'재성이 놓인 자리부터 봐봐요',text:`${sourceSummary(report,'재성')} ${steady&&opportunity?'같은 재성이라도 정재의 반복 관리와 편재의 외부 거래를 따로 다루면 좋아요.':steady?'이 구조에서 돈 관리는 들어오는 경로와 나가는 기준을 꾸준히 챙기는 쪽으로 풀어요.':opportunity?'이 구조에서 돈 관리는 새 거래의 자금·기간·책임을 미리 확인하는 쪽으로 풀어요.':'재물의 쓰임은 지금 하는 일의 대가와 비용 구조에서 구체적으로 확인하는 게 좋겠어요.'}`},
   {title:'식상에서 재성으로 이어질 재료',text:`${sourceSummary(report,'식상')} ${output.length&&wealth.length?'식상은 만들어내는 솜씨, 재성은 그 결과를 거래하고 관리하는 역할이에요. 원국에 둘이 있으니 결과물을 누구에게 얼마의 비용으로 건넬지 연결해보면 좋겠어요.':output.length?'만들어내는 역할은 보이니, 그 결과물의 대가를 받는 조건은 실제 거래에서 정해봐요.':'식상이 없다고 표현이나 기술이 없는 것은 아니니, 실제 작업 경험과 결과물을 따로 놓고 봐야겠어요.'}`},
   {title:'지금 재물 이야기가 놓인 운',text:backgroundText(dailyContext)},
  ];
  story.takeaway=steady?`정재의 관리 역할을 살려, 반복 수입과 지출 한 가지를 실제 장부에서 맞춰봐요.`:opportunity?'편재의 거래 역할을 살려, 새 제안의 필요한 자금과 책임을 함께 적어봐요.':'원국에 재성이 없는 만큼 타고난 수입을 가정하지 말고 실제 수입 경로와 계약을 확인해봐요.';
  story.actions=[steady?guide.정재.action:opportunity?guide.편재.action:'실제 수입 경로와 고정 비용을 한 장에 적어봐요.',output.length?'내 결과물 하나의 제작 비용·판매 조건을 함께 적어봐요.':'내가 제공하는 일의 대가와 지급 조건을 먼저 확인해봐요.'];
  story.evidence=[...monthEvidence,...sourceEvidence(report,'재성','식상'),...dailyContext.evidence];story.notes.push('십성의 존재를 식상생재 격국 성립이나 실제 수입 증가의 판정으로 확정하지 않습니다.');
 } else if(topic==='career') {
  const support=profile.monthMainGod==='정인'||profile.monthMainGod==='편인'?'식상':'인성';
  story.title=`월지 ${profile.monthMainGod}으로 보는 일과 직업`;
  story.opening=`자, ${name}의 ${master} 일간은 월지 ${branchName(month.branch)}의 ${particle(profile.monthMainGod,'을','를')} 일의 환경과 함께 읽어요. ${particle(profile.monthMainGod,'은','는')} ${guide[profile.monthMainGod].meaning}이니, 직업 이름보다 맡는 역할과 책임부터 살펴보겠어요.`;
  story.chapters=[
   {title:'관성: 책임이 드러나는 자리',text:`${sourceSummary(report,'관성')} 관성은 조직의 기준과 책임을 다루는 역할이에요. ${profile.groups.관성.visible.length?'원국에 드러난 관성의 자리에서 요구받는 기준과 실제 권한이 맞는지 확인해봐요.':'드러난 관성이 적거나 없다고 조직 생활을 못한다는 뜻은 아니니, 실제 업무의 목표와 평가 기준을 구체적으로 정해봐요.'}`},
   {title:`${support}: 일을 이어갈 재료`,text:`${sourceSummary(report,support)} ${support==='인성'?'인성은 배우고 지원받는 역할이라, 새 일을 맡을 때 필요한 자료와 도움받을 사람을 정하는 쪽으로 풀어요.':'식상은 표현과 결과물을 만드는 역할이라, 배운 것을 어떤 완성물로 남길지 정하는 쪽으로 풀어요.'} 월지 ${profile.monthMainGod}의 역할과 이 재료를 어떻게 함께 써왔는지 실제 경험을 떠올려봐요.`},
   {title:'대운·세운·월운에서 달라지는 역할',text:backgroundText(dailyContext)},
  ];
  story.takeaway=`월지 ${particle(profile.monthMainGod,'을','를')} ${guide[profile.monthMainGod].work}으로 풀고, 실제 권한과 지원도 함께 확인해봐요.`;
  story.actions=[guide[profile.monthMainGod].action,'지금 맡은 일의 목표·완료 기준·권한·지원받을 곳을 적어봐요.'];story.evidence=[...monthEvidence,...sourceEvidence(report,'관성',support),...dailyContext.evidence];story.notes.push('십성의 직업 역할은 전통 해석의 예시이며 특정 직업 적성이나 취업·승진을 확정하지 않습니다.');
 } else if(topic==='relationship') {
  const close=fortune.natalRelations.filter(r=>r.left==='일주'||r.right==='일주');
  story.title=`일지 ${branchName(day.branch)}, 가까운 관계 이야기`;
  story.opening=`자, ${name}은 ${master} 일간이고, 가까운 생활을 읽는 일지는 ${branchName(day.branch)}예요. 그 본기는 ${day.branchTenGod}, ${guide[day.branchTenGod].meaning}으로 잡히니 상대를 단정하기보다 내가 나누는 약속과 표현을 보겠어요.`;
  story.chapters=[
   {title:'배우자궁과 다른 기둥의 관계',text:`일지는 전통적으로 배우자궁, 곧 가까운 관계의 자리로도 읽어요. ${relationText(report,close)}`},
   {title:'비겁: 내 기준과 상대의 자리를 나누기',text:`${sourceSummary(report,'비겁')} 가까운 관계에서는 일지 ${particle(day.branchTenGod,'을','를')} ${guide[day.branchTenGod].relationship}으로 풀어봐요. 비겁은 내 기준과 동등한 사람을 보는 역할이니, 함께 정할 일과 각자 정할 일을 나누는 게 좋겠어요.`},
   {title:'관계에 들어오는 현재의 운',text:backgroundText(dailyContext)},
  ];
  story.takeaway=`일지 ${day.branchTenGod}의 역할을 실제 대화에 옮겨, 서로 기대하는 약속 한 가지를 맞춰봐요.`;
  story.actions=[guide[day.branchTenGod].action,'시간·돈·연락 중 한 가지의 기대와 부담을 실제 대화로 확인해봐요.'];story.evidence=[`일지 ${day.branch.hanja}, 본기 ${day.hiddenStems[0].hanja}: ${day.branchTenGod}`,...relationEvidence(close),...sourceEvidence(report,'비겁'),...dailyContext.evidence];story.notes.push('배우자의 성격·직업·결혼 시기를 확정하지 않습니다. 궁합은 상대의 출생정보가 필요합니다.');
 } else if(topic==='change') {
  const clashes=fortune.natalRelations.filter(r=>r.type==='충'),active=fortune.cycles.periods.find(p=>p.active);
  story.title='충의 자리와 운으로 보는 변화';
  story.opening=`자, ${name}의 ${master} 원국에는 ${clashes.length?`${clashes.map(relationName).join('·')}이 있어요`:'쌍별 지지 충이 없어요'}. 충은 서로 다른 방향의 조정을 읽는 배속이니, 어느 기둥을 건드리는지와 현재 대운을 함께 보겠어요.`;
  story.chapters=[
   {title:'원국의 충이 놓인 생활 자리',text:relationText(report,clashes.length?clashes:fortune.natalRelations)},
   {title:'현재 대운과 원국 사이의 합충',text:active?`${ganji(active)} 대운은 ${active.stemTenGod}·${active.branchTenGod}의 역할을 가져와요. ${relationText(report,active.relations,dailyContext.background.currentDaeyun)}`:fortune.cycles.status==='gender_required'?'현재 성별이 선택되지 않아 대운 순역을 계산하지 않았어요. 이직이나 이사를 대운과 함께 읽고 싶다면 성별을 선택하고 다시 계산해야겠어요.':'조회일에 활성 대운이 없어요. 시작 전이거나 표시 범위 밖인 구간을 현재 대운으로 대신 붙이지 않을게요.'},
   {title:'세운과 월운, 계획을 놓을 배경',text:backgroundText(dailyContext)},
  ];
  story.takeaway=clashes.some(r=>r.left==='월주'||r.right==='월주')?'월주를 건드리는 충이 있으니, 변화 계획의 역할·일정·수입 조건을 따로 나누어봐요.':clashes.some(r=>r.left==='일주'||r.right==='일주')?'일주를 건드리는 충이 있으니, 가까운 사람과 생활 기준을 먼저 맞춰봐요.':'이동 자체를 운의 결론으로 삼기보다 원국과 현재 운의 역할을 실제 계획의 조건에 맞춰봐요.';
  story.actions=['이직·이사에서 바꾸려는 이유와 지킬 기준을 각각 적어봐요.','원국과 운에서 확인한 생활 자리의 비용·기한·담당자를 맞춰봐요.'];story.evidence=[...relationEvidence(fortune.natalRelations),...(active?[`현재 ${active.index}대운 ${active.ganji}`,...relationEvidence(active.relations)]:[`대운 상태 ${fortune.cycles.status}`]),...dailyContext.evidence];story.notes.push('충·형을 실제 이사·이직·사고 발생으로 판정하지 않습니다.');
 } else if(topic==='elements') {
  const counts=Object.entries(natal.elementCounts),missing=counts.filter(([,n])=>n===0).map(([e])=>e);
  const hidden=missing.map(element=>({element,sources:natal.pillars.flatMap(p=>p.hiddenStems.filter(s=>s.element===element).map(s=>({position:p.label,branch:branchName(p.branch),stem:stemName(s),hanja:s.hanja})))}));
  story.title=`${master} 일간의 오행과 월령`;
  story.opening=`자, ${name}은 ${master} 일간, ${branchName(month.branch)} 월지의 ${profile.season} 사주예요. 표면 오행은 ${counts.map(([e,n])=>`${e} ${n}`).join('·')}로 계산됐지만, 할매는 지장간과 통근도 같이 볼 거예요.`;
  story.chapters=[
   {title:'지장간: 표면에 없는 오행도 확인하기',text:hidden.length?hidden.map(({element,sources})=>sources.length?`${element}은 겉의 여덟 글자에는 없지만 ${sources.map(s=>`${s.position} ${s.branch} 속 ${s.stem}`).join(', ')}의 지장간에 있어요. 지장간은 지지에 담긴 천간이니, 없는 오행이라고 바로 결론내리면 놓치는 부분이지요.`:`${element}은 지장간까지 살펴봐도 없어요. 오행의 부재를 능력이나 인연의 부재로 옮기진 않고 다른 십성의 쓰임을 함께 봐요.`).join(' '):'다섯 오행이 표면에 모두 있어요. 오행이 모두 있다는 사실은 각 오행의 계절상 역할이나 강도까지 같다는 뜻은 아니에요.'},
   {title:'통근: 같은 오행의 뿌리 확인하기',text:rootText(report)},
   {title:'월령과 십성으로 읽는 실제 역할',text:`월지 ${branchName(month.branch)}의 본기 ${stemName(month.hiddenStems[0])}는 ${particle(profile.monthMainGod,'이','가')}에요. ${guide[profile.monthMainGod].meaning}이라 ${guide[profile.monthMainGod].work}과 연결해서 읽어요. 개수표 다음에 이 계절과 역할을 놓아야 사주 원국의 맥락이 보이는구먼.`},
  ];
  story.takeaway=`오행의 개수뿐 아니라 ${branchName(month.branch)} 월령과 ${profile.monthMainGod}의 쓰임을 함께 읽어봐요.`;
  story.actions=['표면에 없는 오행이 지장간에도 없는지 계산 근거를 확인해봐요.',guide[profile.monthMainGod].action];story.evidence=[...counts.map(([e,n])=>`표면 오행 ${e}: ${n}`),...hidden.flatMap(({element,sources})=>sources.map(s=>`${s.position} 지장간 ${s.hanja}: ${element}`)),...monthEvidence,...rootEvidence];story.notes.push('오행 개수는 강도 점수가 아닙니다. 신강·신약, 용신·희신은 판정하지 않습니다.');
 } else {
  const context=topic==='daily'?dailyContext:buildReadingContext(report,topic),p=context.period;
  const queryYear=topic==='nextYear'?fortune.referenceYear+1:fortune.referenceYear;
  const period=topic==='daily'?`${fortune.referenceDate} 하루`:topic==='cycles'?'현재 대운':`${queryYear}년`;
  story.title=topic==='daily'?`${fortune.referenceDate} ${p?.korean||''}일의 개인 운세`:topic==='cycles'?`${p?.korean||''} 대운 이야기`:`${queryYear}년 ${p?.korean||''} 세운 이야기`;
  if(context.availability!=='ready'||!p) {
   const before=context.availability==='before_birth',gender=context.availability==='gender_required';
   story.opening=before?`자, ${name}의 출생일은 ${natal.solarDate}인데 조회 구간은 태어나기 전이에요. 아직 태어나기 전 날짜에 개인 운세를 붙이지 않고 날짜부터 맞추겠어요.`:gender?`자, ${name}은 ${master} 일간인데, 대운 계산에 필요한 성별이 선택되지 않았어요. 이 정보가 없으면 대운 순역을 짐작해 정하지 않을게요.`:`자, ${name}의 ${period}은 계산된 현재 운 구간에 없어요. 시작 전인지 표시 범위 밖인지 조회 날짜부터 확인해야겠어요.`;
   const next=fortune.cycles.periods.find(c=>c.startDate.slice(0,10)>fortune.referenceDate);
   story.chapters=[
    {title:before?'출생 전 구간 확인':gender?'대운 순역에 필요한 정보':'현재 구간이 없는 이유',text:before?`양력 출생일 ${natal.solarDate}과 조회 ${period}을 나란히 확인해봐요. 미래의 출생정보를 시험 입력했다면 원국 계산까지만 볼 수 있어요.`:gender?'이 프로그램의 전통 대운법은 년간 음양과 성별로 순행·역행을 정해요. 성별을 선택하고 다시 계산하면 절입과 출생시각으로 대운 시작일을 계산해드려요.':next?`대운이 시작되기 전 구간이에요. 첫 대운의 실제 시작일은 ${next.startDate.slice(0,10)}이니 시작 전 시간을 첫 대운으로 바꾸지 않아요.`:'조회일은 표시하는 대운 구간 밖이거나 선택한 운 자료가 없는 구간이에요. 다른 구간을 대신 가져오지 않아요.'},
    {title:'입력 화면에서 다시 확인',text:gender?'성별을 선택하고 다시 계산해주세요. 같은 원국으로 방향만 짐작해 붙이지 않을게요.':'출생일과 조회 날짜·연도를 확인하고 출생 이후의 계산된 구간으로 다시 조회해주세요.'},
    {title:'원국 풀이를 먼저 읽어도 좋아요',text:`이미 계산된 ${master} 원국의 월령, 지장간, 합충은 따로 볼 수 있어요. 타고난 모습이나 재물·관계 이야기는 그 구조를 근거로 차근차근 읽어드려요.`},
   ];
   story.takeaway=gender?'대운을 보고 싶다면 성별을 선택하고 다시 계산해주세요.':before?'출생 이후의 조회 구간인지 먼저 확인해주세요.':next?`첫 대운의 시작일은 ${next.startDate.slice(0,10)}예요.`:'조회 날짜와 표시하는 운 구간을 확인해주세요.';
   story.actions=[gender?'입력 화면에서 성별을 선택하고 다시 계산해주세요.':'출생일과 조회 날짜·연도를 확인해주세요.'];story.evidence=[...context.evidence,`양력 출생일 ${natal.solarDate}`,`대운 상태: ${fortune.cycles.status}`];story.notes.push(...context.cautions);
  } else {
   story.opening=periodOpening(name,master,p,period);
   const rawRelations:Relation[]=context.natalLinks;
   story.chapters=[
    {title:topic==='cycles'?'이 대운이 원국에 만나는 자리':'원국과 이번 운의 합·충',text:relationText(report,rawRelations,p)},
    {title:'일과 재물에서는 이렇게 풀어요',text:luckWorkMoney(p)},
    {title:'가까운 관계에서 살펴볼 부분',text:luckRelationship(report,p,rawRelations)},
   ];
   if(topic==='daily')story.chapters.push({title:'대운·세운·월운 위에 놓인 하루',text:backgroundText(context)});
   else if(topic==='cycles')story.chapters.push({title:'이 대운의 실제 구간과 현재 세운·월운',text:`조회일 ${fortune.referenceDate}은 ${p.startDate.slice(0,10)}부터 ${p.endDate.slice(0,10)} 전까지의 ${p.label} 구간이에요. ${backgroundText(context)}`});
   else {
    const midpoint=`${queryYear}-07-01 12:00:00`,cycle=fortune.cycles.periods.find(c=>midpoint>=c.startDate&&midpoint<c.endDate);
    const annual=fortune.annual.find(a=>a.year===queryYear);
    story.chapters.push({title:`${queryYear}년 세운의 구간과 대운`,text:`이 세운은 입춘 ${p.startDate.slice(0,10)}부터 다음 입춘 ${p.endDate.slice(0,10)} 전까지예요. ${cycle?`${queryYear}년 7월 기준으로는 ${ganji(cycle)} 대운(${cycle.stemTenGod}·${cycle.branchTenGod})이 배경이에요.${annual?.cycleRelations.length?` 대운과 세운 사이에는 ${annual.cycleRelations.map(relationName).join('·')}이 있어 장기 계획과 이 해의 역할을 함께 조율하는 관점으로 읽어요.`:''}`:'해당 연도의 대운은 성별 미선택이나 표시 범위 때문에 붙이지 않았어요.'}`});
   }
   story.takeaway=`${p.stemTenGod}의 역할을 실제 하루나 계획에 옮겨봐요. ${guide[p.stemTenGod].action}`;
   story.actions=[guide[p.stemTenGod].action,...(p.stemTenGod!==p.branchTenGod?[guide[p.branchTenGod].action]:[]),...(rawRelations.some(r=>r.type==='충')?['충이 닿는 생활 자리의 일정과 약속 하나를 다시 맞춰봐요.']:[])];
   story.evidence=context.evidence;story.notes.push(...context.cautions);
   if(topic==='daily')story.notes.push('일진은 조회 날짜의 한국 표준시 정오 기준입니다. 이 계산 규칙에서 밤 23시 이후는 다음 일진으로 봅니다.');
   if(topic==='cycles')story.notes.push('대운 기산법·학파별 반올림에 따라 시작 날짜가 달라질 수 있습니다.');
  }
 }
 return {...story,evidence:[...new Set(story.evidence)],actions:[...new Set(story.actions)],notes:[...new Set(story.notes)]};
}

/** Other charts require a new input, never an unannounced reuse of the current person. */
export function consultationNeedsProfileChange(question:string):boolean {
  const text=question.replace(/\s+/g,'');
  if(/궁합|상대(?:방)?의?(?:이름|사주|생년|출생|생일)|다른(?:사람|분|가족).*(?:사주|운세|봐|볼|입력)|(?:저|제|나)말고/.test(text))return true;
  if(/\d{2,4}년생|(?:생년월일|출생일|출생시간|출생지역|양력|음력).*(?:\d|바꾸|수정)/.test(text))return true;
  const other='(?:남자친구|여자친구|남친|여친|남편|아내|엄마|어머니|아빠|아버지|친구|아들|딸|아이|자녀|손주|동생|누나|형|오빠|언니|가족)';
  return new RegExp(`${other}(?:의|는|도|한테|정보|생년|출생|생일|\\d|사주|운세|오늘|올해|내년).*?(?:사주|운세|봐|볼|생년|출생|생일|\\d{2,4}년)|${other}(?:의|은|는|도)?(?:사주|운세|오늘|올해|내년|재물|성격|직업|대운|어떤사람|생년|출생|생일)`).test(text);
}

/** Routing to supported local stories, not an open-ended AI answer or prediction. */
export function consultationTopicForQuestion(question:string):ConsultationTopic|null {
  const text=question.trim().replace(/\s+/g,'');
  if(!text||consultationNeedsProfileChange(text))return null;
  if(/건강|질병|병원|병(?:에|이|을|걸|은|없|있)|아픈|수명|사망|죽음|죽을|암에|임신|출산|로또|복권|당첨|번호추천|신강|신약|용신|희신|내일|일진날짜|월운|합격|대박|확실|보장|부자(?:가)?(?:될|되)|성공(?:할|하나|하나요)/.test(text))return null;
  if(/(?:돈|재물|수입|부자|재산).*(?:언제|몇년|몇월|몇살)|(?:언제|몇년|몇월|몇살).*(?:돈|재물|수입|부자|재산)/.test(text))return null;
  if(/(?:결혼|이혼).*(?:언제|시기|날짜|몇살|몇년|몇월|할수|하게|하나요)|(?:언제|시기|날짜|몇살|몇년|몇월).*?(?:결혼|이혼)/.test(text))return null;
  if(/대운|십년|10년|큰흐름/.test(text))return 'cycles';
  if(/내년|다음해/.test(text))return 'nextYear';
  if(/올해|금년|이번해|연운|세운/.test(text))return 'annual';
  if(/오늘|하루운|오늘운|일진/.test(text))return 'daily';
  if(/오행|목화토금수|균형|기운의개수/.test(text))return 'elements';
  if(/이직|이사|이동|변화|옮기|옮길/.test(text))return 'change';
  if(/재물|돈|금전|수입|지출|저축|재산|사업운/.test(text))return 'wealth';
  if(/직업|직장|취업|승진|일하는|일할|일운|업무|진로/.test(text))return 'career';
  if(/연애|사랑|배우자|관계|결혼|연인|인연/.test(text))return 'relationship';
  if(/성격|성향|어떤사람|기질|장점|단점|사주|나는어때|저는어때/.test(text))return 'nature';
  return null;
}
