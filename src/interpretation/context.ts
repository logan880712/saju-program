import type {AnnualLuck,FullReport,LuckPillar,LuckPeriod,MonthLuck,Relation} from '../engine/fortuneTypes';
import type {Character,Pillar,Element} from '../engine/types';
import {character} from '../engine/calculate';

export type ReadingTopic='daily'|'annual'|'nextYear'|'cycles';
export interface ReadingPeriod extends LuckPillar {
  korean:string;
  label:string;
  startDate:string;
  endDate:string;
  branchMainStem:Character;
}
export interface ReadingLink extends Relation {
  natalKey:Pillar['key'];
  natalLabel:string;
  palace:string;
  targetLabel:string;
  name:string;
  facts:string[];
  interpretation:string;
  advice:string;
}
export interface ReadingTheme {
  category:'십성'|'생극'|'원국관계'|'배경흐름';
  code:string;
  facts:string[];
  interpretation:string;
  advice:string;
  cautions:string[];
}
export interface ReadingContext {
  topic:ReadingTopic;
  dayMaster:Character;
  period:ReadingPeriod|null;
  natalLinks:ReadingLink[];
  background:{
    referenceDate:string;
    currentDaeyun:ReadingPeriod|null;
    currentSolarYear:ReadingPeriod|null;
    currentSolarMonth:ReadingPeriod|null;
    queriedYearDaeyun:ReadingPeriod|null;
  };
  themes:ReadingTheme[];
  evidence:string[];
  cautions:string[];
  availability:'ready'|'before_birth'|'gender_required'|'outside_cycles'|'missing_period';
}

// These are labels for the engine's already-computed branch-main ten-god, not a new chart calculation.
const mainStems:Record<string,string>={子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'};
const elements:Element[]=['목','화','토','금','수'];
const conventionalPairs:Record<Relation['type'],string[]>={
  천간합:['甲己','乙庚','丙辛','丁壬','戊癸'],
  육합:['子丑','寅亥','卯戌','辰酉','巳申','午未'],
  충:['子午','丑未','寅申','卯酉','辰戌','巳亥'],
  형:['寅巳','巳申','寅申','丑戌','戌未','丑未','子卯','辰辰','午午','酉酉','亥亥'],
  파:['子酉','丑辰','寅亥','卯午','巳申','未戌'],
  해:['子未','丑午','寅巳','卯辰','申亥','酉戌'],
};
const godMeanings:Record<string,{interpretation:string;advice:string}>={
  비견:{interpretation:'일간과 오행·음양이 같은 기운입니다. 자기 기준, 독립적인 역할, 동료와 대등한 관계를 살피는 십성입니다.',advice:'내가 결정할 몫과 함께 의논할 몫을 구분해보세요.'},
  겁재:{interpretation:'일간과 오행은 같고 음양은 다른 기운입니다. 사람들과 자원·기회를 나누는 일, 협력과 경쟁의 경계를 살피는 십성입니다.',advice:'함께 쓰는 비용과 역할을 미리 정해두세요.'},
  식신:{interpretation:'일간이 생하는 오행이며 음양이 같습니다. 꾸준한 표현, 제작, 생활의 돌봄처럼 자기 힘을 결과물로 내놓는 십성입니다.',advice:'손에 익은 일을 하나 끝내고, 반복할 수 있는 순서를 남겨보세요.'},
  상관:{interpretation:'일간이 생하는 오행이며 음양이 다릅니다. 자기 생각을 드러내고 기존 방식의 불편함을 바꾸는 십성입니다.',advice:'바꾸고 싶은 이유와 대안을 함께 말하고, 표현할 때 상대의 역할도 살펴보세요.'},
  편재:{interpretation:'일간이 극하는 오행이며 음양이 같습니다. 외부의 자원, 거래, 여러 사람과 연결되는 기회를 살피는 십성입니다.',advice:'새 기회에는 예상 수입뿐 아니라 지출·책임·회수 조건도 나란히 적어보세요.'},
  정재:{interpretation:'일간이 극하는 오행이며 음양이 다릅니다. 구체적인 자원과 비용을 일정하게 관리하는 십성입니다.',advice:'고정 비용과 반드시 챙길 약속부터 확인해보세요.'},
  편관:{interpretation:'일간을 극하는 오행이며 음양이 같습니다. 요구, 경쟁, 책임과 통제에 대응하는 십성입니다.',advice:'큰 요구를 작은 과제로 나누고 권한·기한·도움을 함께 확인해보세요.'},
  정관:{interpretation:'일간을 극하는 오행이며 음양이 다릅니다. 정해진 역할, 규칙, 약속을 지키며 신뢰를 쌓는 십성입니다.',advice:'중요한 일정과 맡은 책임을 확인하고, 감당하기 어려운 몫은 미리 조율해보세요.'},
  편인:{interpretation:'일간을 생하는 오행이며 음양이 같습니다. 독특한 관점, 탐색, 비정형적인 학습과 지원을 살피는 십성입니다.',advice:'새롭게 본 점을 하나 기록하되, 실제로 확인한 사실과 추측을 나눠보세요.'},
  정인:{interpretation:'일간을 생하는 오행이며 음양이 다릅니다. 배우기, 문서·지식, 돌봄과 지원을 살피는 십성입니다.',advice:'필요한 자료를 확인하고 도움을 받을 부분을 구체적으로 요청해보세요.'},
};

function period(p:LuckPillar,startDate:string,endDate:string,label:string):ReadingPeriod{
  return {ganji:p.ganji,stem:{...p.stem},branch:{...p.branch},stemTenGod:p.stemTenGod,branchTenGod:p.branchTenGod,korean:p.stem.korean+p.branch.korean,startDate,endDate,label,branchMainStem:character(mainStems[p.branch.hanja])};
}
function annualPeriod(p:AnnualLuck):ReadingPeriod{return period(p,p.startDate,p.endDate,`${p.year}년 세운`);}
function monthPeriod(p:MonthLuck):ReadingPeriod{return period(p,p.startDate,p.endDate,`${p.term} 절기 월운`);}
function cyclePeriod(p:LuckPeriod):ReadingPeriod{return period(p,p.startDate,p.endDate,`${p.index}대운`);}
function priorDate(date:string):string{const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);}
function palace(p:Pillar,type:Relation['type']):string{
  if(p.key==='day')return type==='천간합'?'일간 · 나의 기준과 대응':'일지 · 가까운 관계와 생활 자리';
  return {year:'년주 · 성장 배경과 바깥 관계',month:'월주 · 사회생활과 일의 환경',hour:'시주 · 장기 계획과 돌봄의 자리'}[p.key];
}
function relationName(r:Relation):string{
  const pair=conventionalPairs[r.type].find(p=>p===r.pair||p===r.pair[1]+r.pair[0])??r.pair;
  if(r.type==='형'&&pair[0]===pair[1])return `${character(pair[0]).korean}${character(pair[1]).korean}자형`;
  return [...pair].map(c=>character(c).korean).join('')+(r.type==='천간합'?'합':r.type==='육합'?'육합':r.type);
}
function annotateLink(r:Relation,natal:Pillar[],target:ReadingPeriod):ReadingLink|null{
  const source=natal.find(p=>p.label===r.left)||natal.find(p=>p.label===r.right);
  if(!source)return null;
  const isStem=r.type==='천간합',a=isStem?source.stem:source.branch,b=isStem?target.stem:target.branch;
  const place=palace(source,r.type),name=relationName(r),fact=`${source.label} ${isStem?'천간':'지지'} ${a.hanja}(${a.korean})와 ${target.label} ${isStem?'천간':'지지'} ${b.hanja}(${b.korean})의 ${name}`;
  const meaning={
    천간합:'서로 다른 역할을 연결하거나 조율하는 관계로 읽습니다. 두 천간이 사라지거나 다른 오행으로 변했다고 판정하지 않습니다.',
    육합:'관심과 역할이 연결되는 관계로 읽습니다. 연결되는 일의 조건과 의존 관계도 함께 살펴야 합니다.',
    충:'서로 반대 방향에 놓인 지지가 만났습니다. 해당 자리의 익숙한 방식과 들어오는 조건을 다시 맞추는 주제로 읽습니다.',
    형:r.pair[0]===r.pair[1]?'같은 지지가 반복된 자형 배속입니다. 그 자리에서 되풀이하는 요구와 기준을 점검하는 주제로 읽습니다.':'형의 쌍별 배속입니다. 해당 자리의 규칙과 기대가 서로 맞는지 점검하는 주제로 읽습니다.',
    파:'쌍별 파 배속입니다. 해당 자리에서 약속의 세부 조건이나 유지 방식을 다시 확인하는 주제로 읽습니다.',
    해:'쌍별 해 배속입니다. 해당 자리에서 말로 정한 기대와 실제 이해가 어긋나는지 확인하는 주제로 읽습니다.',
  }[r.type];
  const advice={천간합:'함께할 일의 역할과 조건을 분명히 정해보세요.',육합:'도움을 주고받을 때 서로 맡을 몫도 함께 정해보세요.',충:'바뀌는 일정과 지키고 싶은 생활 기준을 나눠 적어보세요.',형:'반복해서 신경 쓰이는 기준 하나를 실제 대화에서 확인해보세요.',파:'작은 약속의 기한·비용·방법을 다시 확인해보세요.',해:'상대가 같은 뜻으로 이해했는지 구체적인 말로 확인해보세요.'}[r.type];
  return {...r,natalKey:source.key,natalLabel:source.label,palace:place,targetLabel:target.label,name,facts:[fact,`전통 자리 배속: ${place}`],interpretation:meaning,advice};
}

function elementTheme(day:Character,target:Character,label:string):ReadingTheme{
  const delta=(elements.indexOf(target.element)-elements.indexOf(day.element)+5)%5;
  const relation=['같은 오행','일간이 생하는 오행','일간이 극하는 오행','일간을 극하는 오행','일간을 생하는 오행'][delta];
  const formula=delta===0?`${day.element}와 ${target.element}의 동오행`:delta===1||delta===4?`${delta===1?day.element:target.element}생${delta===1?target.element:day.element}`:`${delta===2?day.element:target.element}극${delta===2?target.element:day.element}`;
  const meanings=[
    '내 힘과 같은 성질의 역할이 함께 놓였습니다. 자기 기준과 동료·경쟁자의 몫을 살피는 비겁의 관점입니다.',
    '내 기운을 밖으로 내보내는 생의 관계입니다. 표현·생산·돌봄에 쓰는 힘과 그 결과를 살피는 식상의 관점입니다.',
    '내가 다루고 관리하는 극의 관계입니다. 자원·거래·비용을 감당하는 재성의 관점입니다.',
    '밖의 조건이 내게 요구를 가하는 극의 관계입니다. 역할·규칙·책임을 조율하는 관성의 관점입니다.',
    '밖의 기운이 나를 생하는 관계입니다. 배움·자료·지원과 그것을 활용하는 인성의 관점입니다.',
  ];
  return {category:'생극',code:`${label}:${formula}`,facts:[`일간 ${day.hanja}(${day.element}) ↔ ${label} ${target.hanja}(${target.element}): ${formula}, ${relation}`],interpretation:meanings[delta],advice:['서로 맡을 몫을 구분해보세요.','내 힘을 어떤 결과물에 쓰는지 살펴보세요.','관리해야 할 비용과 조건을 먼저 확인해보세요.','요구받는 역할과 내가 감당할 범위를 맞춰보세요.','배운 내용을 실제 한 가지 일에 써보세요.'][delta],cautions:['생은 무조건 길하고 극은 무조건 흉한 것이 아닙니다. 월령·통근·전체 배합을 심사하지 않았으므로 강도나 희기를 판정하지 않습니다.']};
}
function periodEvidence(p:ReadingPeriod):string[]{return [`${p.label} ${p.ganji}(${p.korean}): ${p.startDate} ~ ${p.endDate} 전`,`천간 ${p.stem.hanja}: ${p.stemTenGod}`,`지지 ${p.branch.hanja} 본기 ${p.branchMainStem.hanja}: ${p.branchTenGod}`];}

/** Build auditable reading facts from a completed report. It never changes or infers a natal chart. */
export function buildReadingContext(report:Pick<FullReport,'natal'|'fortune'>,topic:ReadingTopic):ReadingContext{
  const {natal,fortune}=report,dayMaster={...natal.pillars[2].stem};
  const active=fortune.cycles.periods.find(p=>p.active);
  const queryYear=fortune.referenceYear+(topic==='nextYear'?1:0);
  const queryMidpoint=`${queryYear}-07-01 12:00:00`,queryCycle=fortune.cycles.periods.find(p=>queryMidpoint>=p.startDate&&queryMidpoint<p.endDate);
  const queriedYearDaeyun=queryCycle?{...cyclePeriod(queryCycle),label:`${queryYear}년 7월 1일 기준 ${queryCycle.index}대운`}:null;
  const background={referenceDate:fortune.referenceDate,currentDaeyun:active?cyclePeriod(active):null,currentSolarYear:fortune.calendar?annualPeriod(fortune.calendar.annual):null,currentSolarMonth:fortune.calendar?monthPeriod(fortune.calendar.month):null,queriedYearDaeyun:topic==='annual'||topic==='nextYear'?queriedYearDaeyun:null};
  let target:ReadingPeriod|null=null,relations:Relation[]=[];
  if(topic==='daily'){
    target=period(fortune.daily,`${priorDate(fortune.referenceDate)} 23:00:00`,`${fortune.referenceDate} 23:00:00`,`${fortune.referenceDate} 일진`);relations=fortune.daily.relations;
  }else if(topic==='cycles'){
    if(active){target=cyclePeriod(active);relations=active.relations;}
  }else{
    const annual=fortune.annual.find(p=>p.year===fortune.referenceYear+(topic==='nextYear'?1:0));
    if(annual){target=annualPeriod(annual);relations=annual.relations;}
  }
  const beforeBirth=topic==='daily'||topic==='cycles'?fortune.referenceDate<natal.solarDate:!!target&&target.endDate.slice(0,10)<=natal.solarDate;
  const availability:ReadingContext['availability']=beforeBirth?'before_birth':target?'ready':topic==='cycles'?(fortune.cycles.status==='gender_required'?'gender_required':'outside_cycles'):'missing_period';
  const natalLinks=target?relations.map(r=>annotateLink(r,natal.pillars,target!)).filter((r):r is ReadingLink=>r!==null):[];
  const evidence=[`일간 ${dayMaster.hanja}(${dayMaster.korean}), ${dayMaster.polarity}${dayMaster.element}`,`월지 ${natal.pillars[1].branch.hanja}의 본기 ${natal.pillars[1].hiddenStems[0].hanja}: ${natal.pillars[1].branchTenGod}`,...(target?periodEvidence(target):[]),...natalLinks.flatMap(r=>r.facts)];
  const themes:ReadingTheme[]=[];
  const cautions=['천간의 십성과 지지 본기의 십성을 구분합니다. 본기는 지지에 담긴 지장간의 대표이며 별도의 표면 천간이 아닙니다.','합·충·형·파·해는 확인된 쌍별 관계만 읽습니다. 합화·삼합·삼형 완성, 신강·신약, 용신·희신과 길흉 강도는 판정하지 않습니다.'];
  if(target&&availability==='ready'){
    for(const [layer,god,fact] of [
      ['천간',target.stemTenGod,`${target.label} 천간 ${target.stem.hanja}(${target.stem.korean})는 일간 ${dayMaster.hanja} 기준 ${target.stemTenGod}`],
      ['지지본기',target.branchTenGod,`${target.label} 지지 ${target.branch.hanja}(${target.branch.korean})의 본기 ${target.branchMainStem.hanja}는 일간 ${dayMaster.hanja} 기준 ${target.branchTenGod}`],
    ]){
      const meaning=godMeanings[god];
      themes.push({category:'십성',code:`${layer}:${god}`,facts:[fact],interpretation:meaning.interpretation,advice:meaning.advice,cautions:['십성은 관계의 전통 분류입니다. 그 이름만으로 재물의 증가, 취업·승진, 결혼·이별 같은 사건을 확정하지 않습니다.']});
    }
    themes.push(elementTheme(dayMaster,target.stem,`${target.label} 천간`),elementTheme(dayMaster,target.branch,`${target.label} 지지`));
    natalLinks.forEach(link=>themes.push({category:'원국관계',code:`${link.natalKey}:${link.type}:${link.pair}`,facts:link.facts,interpretation:link.interpretation,advice:link.advice,cautions:['궁위는 전통적인 해석의 자리 배속입니다. 특정 가족이나 사건의 발생을 뜻하지 않습니다.']}));
    const backgrounds=topic==='daily'?[background.currentDaeyun,background.currentSolarYear,background.currentSolarMonth]:topic==='cycles'?[background.currentSolarYear,background.currentSolarMonth]:[background.queriedYearDaeyun];
    for(const p of backgrounds)if(p){
      const at=topic==='annual'||topic==='nextYear'?`${queryYear}년 7월 1일 정오`:`${fortune.referenceDate} 정오`;
      themes.push({category:'배경흐름',code:`${p.label}:${p.ganji}`,facts:periodEvidence(p),interpretation:`${at}에는 ${p.korean}(${p.ganji}) ${p.label} 구간이며 천간은 ${p.stemTenGod}, 지지 본기는 ${p.branchTenGod}입니다. 선택한 운의 주제와 이 배경을 구분해서 함께 살핍니다.`,advice:'긴 계획과 해당 시기의 구체적인 할 일을 따로 정리해보세요.',cautions:['서로 다른 기간의 글자를 더해 하나의 길흉 점수로 만들지 않습니다.','연도별 대운 배경은 7월 1일 정오 기준입니다. 같은 해에 대운이 바뀌면 그 해 전체를 하나의 대운으로 해석하지 않습니다.']});
      evidence.push(...periodEvidence(p));
    }
  }else if(beforeBirth)cautions.push('출생 전 기간에는 개인 운세 해석을 생성하지 않습니다.');
  if(topic==='daily')cautions.push('조회 날짜의 한국 표준시 정오 일진입니다. 자시 23시 일주 변경 규칙에 따라 이 일진의 시작은 전날 23시입니다.');
  return {topic,dayMaster,period:target,natalLinks,background,themes,evidence:[...new Set(evidence)],cautions,availability};
}
