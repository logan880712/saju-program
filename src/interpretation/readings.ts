import type {Character,SajuResult} from '../engine/types';
import type {FortuneData,Interpretation,LuckPillar,ReadingSection,Relation} from '../engine/fortuneTypes';
const traits:Record<string,{title:string;image:string;strength:string;balance:string}>={
 甲:{title:'방향을 세우는 큰 나무',image:'곧게 자라는 큰 나무',strength:'큰 방향을 세우고 원칙을 지키는 태도를 상징합니다. 계획의 이유를 이해할 때 꾸준함과 책임감이 살아나는 유형으로 읽습니다.',balance:'옳은 방향을 지키는 힘이 경직된 기준으로 변하지 않도록, 다른 사람의 방식과 작은 수정에도 여지를 두어보세요.'},
 乙:{title:'유연하게 길을 찾는 풀과 꽃',image:'환경에 맞춰 자라는 풀과 꽃',strength:'관계를 읽고 상황에 맞는 경로를 찾는 유연함을 상징합니다. 정면돌파보다 연결과 조율에서 자신의 방식을 찾는 이미지입니다.',balance:'관계를 유지하려고 자신의 기준을 지나치게 뒤로 미루지 않도록, 선택의 우선순위를 글로 정리해보세요.'},
 丙:{title:'넓게 비추는 햇빛',image:'주변을 밝히는 햇빛',strength:'생각과 에너지를 밖으로 표현하는 개방성을 상징합니다. 목표를 공유하고 사람들을 움직이는 방식에 초점을 둔 이미지입니다.',balance:'추진력을 오래 유지하려면 처음의 열기와 실제로 감당할 수 있는 일의 양을 구분해보세요.'},
 丁:{title:'깊이를 더하는 작은 불빛',image:'필요한 곳을 비추는 등불',strength:'세부에 집중하고 의미를 발견하는 집중력을 상징합니다. 대상을 자세히 관찰하며 완성도를 높이는 방식으로 읽습니다.',balance:'마음에 남는 일을 혼자 오래 품기보다 확인할 것과 내려놓을 것을 구분해보세요.'},
 戊:{title:'기준을 지키는 넓은 산',image:'흔들림 없이 자리한 산',strength:'신뢰와 안정된 기준을 상징합니다. 빠른 변화보다 기반을 만들고 유지하는 태도에 초점을 둔 이미지입니다.',balance:'오래 유지한 방식이 지금도 맞는지 주기적으로 점검하면 안정감이 새로운 선택을 막지 않게 됩니다.'},
 己:{title:'삶을 가꾸는 부드러운 흙',image:'씨앗을 기르는 밭',strength:'생활의 세부를 돌보고 정돈하는 힘을 상징합니다. 현실적인 필요를 살피고 작은 개선을 쌓는 방식으로 읽습니다.',balance:'돌봄과 책임을 전부 맡기보다 자신의 몫과 다른 사람의 몫을 나눠두면 부담을 조절하기 쉽습니다.'},
 庚:{title:'결단으로 형태를 만드는 금속',image:'형태를 만드는 단단한 금속',strength:'기준을 분명히 하고 불필요한 것을 정리하는 결단을 상징합니다. 문제의 핵심을 직접 다루는 방식에 초점을 둡니다.',balance:'분명한 판단을 전달할 때는 결론뿐 아니라 이유와 조율할 수 있는 범위도 함께 설명해보세요.'},
 辛:{title:'디테일을 완성하는 보석',image:'정교하게 다듬은 보석',strength:'차이를 구별하고 품질을 높이는 섬세함을 상징합니다. 기준과 완성도를 다루는 방식으로 읽습니다.',balance:'좋은 기준과 과도한 자기평가를 구분해보세요. 완벽한 준비보다 충분한 검토 후 시작하는 경험도 도움이 됩니다.'},
 壬:{title:'가능성을 연결하는 큰 물',image:'넓게 흐르는 강과 바다',strength:'넓은 시야와 다양한 가능성을 연결하는 흐름을 상징합니다. 정보를 모으고 새로운 경로를 탐색하는 방식으로 읽습니다.',balance:'가능성이 많을수록 한 번에 붙잡을 목표를 줄이고, 선택을 마무리할 기준을 정해보세요.'},
 癸:{title:'세밀하게 스며드는 빗물',image:'조용히 스며드는 비와 이슬',strength:'작은 단서와 맥락을 세밀하게 읽는 관찰을 상징합니다. 정보를 충분히 이해한 뒤 움직이는 방식으로 읽습니다.',balance:'충분히 생각하는 장점이 결정의 지연으로 이어지지 않도록 작은 실행 기한을 정해보세요.'},
};
interface GodTheme{theme:string;meaning:string;action:string;watch:string;}
const gods:Record<string,GodTheme>={
 비견:{theme:'자기 기준과 동료',meaning:'자신의 기준, 동등한 관계, 자립이라는 주제를 다룹니다.',action:'내가 책임질 역할과 함께할 역할을 구분해보세요.',watch:'고집이나 역할 중복을 줄이려면 기준을 먼저 공유하세요.'},
 겁재:{theme:'협력과 경쟁',meaning:'동료와 자원을 나누는 방식, 경쟁과 협업의 균형을 다룹니다.',action:'공동 지출과 협업의 책임 범위를 문서로 정리해보세요.',watch:'친밀감과 금전 책임은 분리해 확인하세요.'},
 식신:{theme:'꾸준한 생산과 생활',meaning:'지속적인 표현, 결과물, 생활의 리듬을 다룹니다.',action:'작게라도 반복해서 만들어낼 수 있는 루틴을 정해보세요.',watch:'편안함만 유지하기보다 결과물을 끝까지 마무리해보세요.'},
 상관:{theme:'표현과 개선',meaning:'새로운 표현과 기존 방식의 개선이라는 주제를 다룹니다.',action:'바꾸고 싶은 점을 비판만 하기보다 실행 가능한 대안으로 제시해보세요.',watch:'표현의 속도와 상대가 받아들이는 속도를 맞춰보세요.'},
 편재:{theme:'기회와 자원 연결',meaning:'외부 기회, 관계를 통한 자원 활용, 여러 선택지를 다룹니다.',action:'새로운 기회는 비용과 회수 계획을 함께 적어 검토해보세요.',watch:'규모가 큰 제안일수록 손실 가능성과 조건을 따로 확인하세요.'},
 정재:{theme:'관리와 꾸준한 축적',meaning:'예측 가능한 수입, 예산, 일상의 자원 관리를 다룹니다.',action:'수입·지출과 장기 목표를 같은 기준으로 정리해보세요.',watch:'유지할 것과 새롭게 바꿀 것을 구분하면 경직된 관리가 줄어듭니다.'},
 편관:{theme:'도전과 책임 조절',meaning:'높은 요구, 도전 과제, 긴장 속의 책임을 다룹니다.',action:'해야 할 일을 세분화하고 도움을 요청할 기준을 정해보세요.',watch:'속도를 높이기 전에 감당 가능한 일정과 회복 시간을 확인하세요.'},
 정관:{theme:'신뢰와 역할',meaning:'약속, 기준, 사회적 역할과 신뢰를 다룹니다.',action:'업무·관계에서 기대하는 역할과 마감 기준을 명확히 해보세요.',watch:'타인의 기대를 전부 충족하려 하기보다 내 기준도 함께 말해보세요.'},
 편인:{theme:'탐색과 새로운 관점',meaning:'비정형 학습, 관찰, 새로운 관점을 다룹니다.',action:'관심 분야 하나를 골라 직접 조사하고 작은 실험을 해보세요.',watch:'생각과 탐색이 실행을 대신하지 않도록 결과물을 남겨보세요.'},
 정인:{theme:'학습과 기반',meaning:'학습, 지원, 경험을 정리하고 기반을 다지는 주제를 다룹니다.',action:'익힌 내용을 정리하고 실제 생활에 적용할 한 가지를 골라보세요.',watch:'준비가 충분해진 뒤에는 작은 실행으로 이해를 확인해보세요.'},
};
const family=(god:string)=>god==='비견'||god==='겁재'?'비겁':god==='식신'||god==='상관'?'식상':god==='편재'||god==='정재'?'재성':god==='편관'||god==='정관'?'관성':'인성';
const compact=(p:{stem:Character;branch:Character})=>`${p.stem.korean}${p.branch.korean}(${p.stem.hanja}${p.branch.hanja})`;
function relationParagraph(relations:Relation[]):string{
 const clashes=relations.filter(r=>r.type==='충');
 if(clashes.length)return `${clashes.map(r=>`${r.left}와 ${r.right}의 ${r.pair}충`).join(', ')}이 계산됩니다. 전통적으로 방향과 생활 구조의 조정을 살펴보는 관계입니다. 이동·퇴사·이별 같은 사건이 일어난다는 의미로 해석하지 않습니다.`;
 const joins=relations.filter(r=>r.type==='육합'||r.type==='천간합');
 if(joins.length)return `${joins.map(r=>`${r.left}와 ${r.right}의 ${r.pair}${r.type}`).join(', ')}이 계산됩니다. 연결과 협력이라는 관점에서 살펴볼 수 있으나, 합이 반드시 좋은 결과나 실제 합화를 뜻하지는 않습니다.`;
 return '이 구간과 원국 사이에 표시할 천간합·육합·충이 없습니다. 이것만으로 평온하거나 불리한 시기라고 판단하지 않습니다.';
}
export function luckReading(p:LuckPillar & {relations:Relation[]},id:string,title:string,subtitle:string):ReadingSection{
 const stem=gods[p.stemTenGod],branch=gods[p.branchTenGod];
 return {id,title,subtitle,paragraphs:[`${compact(p)}의 천간은 일간에 대해 ${p.stemTenGod}, 지지 본기는 ${p.branchTenGod}입니다. ${stem.meaning} ${p.stemTenGod===p.branchTenGod?'같은 십성 주제가 천간과 지지 본기에 함께 나타납니다.':`지지 본기에서는 ${branch.meaning}`}`,relationParagraph(p.relations),`${stem.theme}라는 주제로 실제 일정과 선택을 돌아보는 참고 자료입니다. 운세의 좋고 나쁨이나 결과를 점수로 확정하지 않습니다.`],evidence:[`운 간지 ${p.ganji}`,`천간 십성 ${p.stemTenGod}`,`본기 십성 ${p.branchTenGod}`,...p.relations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`)],actions:[stem.action,branch.action===stem.action?stem.watch:branch.action,stem.watch]};
}
export function interpretReport(natal:SajuResult,fortune:FortuneData):Interpretation{
 const day=natal.pillars[2].stem,trait=traits[day.hanja];
 const visible=natal.pillars.flatMap(p=>[...(p.key==='day'?[]:[p.stemTenGod]),p.branchTenGod]);
 const counts:Record<string,number>={비겁:0,식상:0,재성:0,관성:0,인성:0};visible.forEach(g=>counts[family(g)]++);
 const evidence=natal.pillars.map(p=>`${p.label} ${compact(p)} · 천간 ${p.stemTenGod} / 지지 본기 ${p.branchTenGod}`);
 const presence=(group:string)=>counts[group]>0?`천간·지지 본기 7개 배속에서 ${group}이 ${counts[group]}회 확인됩니다.`:`천간·지지 본기 7개 배속에는 ${group}이 드러나지 않습니다. 지장간과 실제 삶의 조건은 별도로 살펴야 합니다.`;
 const sections:ReadingSection[]=[
  {id:'nature',title:trait.title,subtitle:`일간 ${day.hanja}(${day.korean}) · ${day.polarity}${day.element}`,paragraphs:[`전통 명리학에서 일간 ${day.hanja}는 ${trait.image}에 빗대어 설명합니다. ${trait.strength}`,trait.balance,'일간의 이미지만으로 성격을 확정할 수는 없습니다. 월령, 다른 글자의 배속, 실제 경험을 함께 보며 자신의 행동을 돌아보는 방식으로 읽어주세요.'],evidence:[`일주 ${natal.pillars[2].ganji}`,`일간 ${day.polarity}${day.element}`],actions:[trait.balance,'잘 맞는 설명과 맞지 않는 설명을 구분해 자신의 경험에 대조해보세요.']},
  {id:'wealth',title:'재물 · 자원의 흐름',subtitle:counts.재성?'관리와 기회를 함께 읽기':'드러난 재성보다 실제 관리 습관을 보기',paragraphs:[presence('재성'),counts.재성?'재성은 자원을 확보하고 운영하는 방식의 상징입니다. 편재는 기회와 연결, 정재는 꾸준한 관리라는 차이가 있으므로 원국의 배속을 구분해서 보세요.':'재성이 겉에 드러나지 않는다는 것은 재산이나 수입이 없다는 뜻이 아닙니다. 원국의 일부 배속만으로 실제 경제 수준을 판단하지 않습니다.',`${presence('식상')} 식상은 표현과 생산의 관점에서 함께 읽을 수 있지만, 식상과 재성의 개수만으로 수입 증가를 예측하지 않습니다.`],evidence:evidence.filter(e=>/재|식신|상관/.test(e)),actions:['예산을 고정 비용·변동 비용·장기 준비로 나눠 기록해보세요.','새로운 거래는 기대 수익뿐 아니라 비용과 조건을 따로 확인하세요.']},
  {id:'career',title:'직업 · 일하는 방식',subtitle:'직업명이 아닌 역할과 환경의 힌트',paragraphs:[`${presence('관성')} 관성은 기준과 책임, 인성은 학습과 지원, 식상은 표현과 결과물이라는 서로 다른 역할을 살펴보는 관점입니다.`,counts.관성?'관성 배속을 근거로 역할과 약속이 분명한 환경을 검토해볼 수 있습니다. 관성이 있다는 이유만으로 특정 직업이나 승진이 정해지는 것은 아닙니다.':'관성이 겉에 드러나지 않더라도 조직 생활이나 책임 있는 일을 할 수 있습니다. 자신의 경력과 역량을 실제 기준으로 평가하세요.',`${presence('인성')} ${presence('식상')} 세 배속의 유무를 참고해 배우는 역할, 만드는 역할, 운영하는 역할 중 자신의 경험에 맞는 방식을 비교해보세요.`],evidence:evidence.filter(e=>/관|인|식신|상관/.test(e)),actions:['업무에서 잘하는 일·에너지가 소모되는 일·배우고 싶은 일을 따로 적어보세요.','이직 여부는 보상·역할·생활 조건을 비교해 결정하세요.']},
  {id:'relationship',title:'관계 · 배우자',subtitle:'일지와 관계 방식에서 시작하는 풀이',paragraphs:[`일지는 ${natal.pillars[2].branch.korean}(${natal.pillars[2].branch.hanja}), 본기 십성은 ${natal.pillars[2].branchTenGod}입니다. 전통적으로 일지는 가까운 관계를 살펴보는 자리이며, ${gods[natal.pillars[2].branchTenGod].meaning}`,relationParagraph(fortune.natalRelations.filter(r=>r.left==='일주'||r.right==='일주')),'배우자의 성격·성별·직업이나 결혼 시기를 원국 하나로 확정하지 않습니다. 재성·관성의 유무를 곧바로 결혼의 성공과 실패로 연결하지 않습니다.'],evidence:[`일지 ${natal.pillars[2].branch.hanja}`,`일지 본기 십성 ${natal.pillars[2].branchTenGod}`,...fortune.natalRelations.filter(r=>r.left==='일주'||r.right==='일주').map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`)],actions:['가까운 관계에서 기대하는 시간·돈·연락의 기준을 구체적으로 나눠보세요.','궁합은 두 사람의 원국과 실제 관계 맥락이 필요하므로 이 리포트에서는 단정하지 않습니다.']},
  {id:'change',title:'변화 · 이동의 관점',subtitle:'충을 사건 예측 대신 조정의 신호로 읽기',paragraphs:[relationParagraph(fortune.natalRelations),'이동수가 있다고 확정하려면 신살과 운의 작용 등 별도의 검증이 필요합니다. 현재는 계산된 쌍별 합·충·형·파·해 관계만 보여주며 이사·해외 이동·퇴사를 예언하지 않습니다.'],evidence:fortune.natalRelations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`),actions:['이동을 계획한다면 일정·비용·유지할 관계를 먼저 정리해보세요.','변화를 주고 싶은 이유와 지금 유지해야 할 기반을 함께 적어보세요.']},
  {id:'elements',title:'오행 · 생활의 균형',subtitle:'원국 8글자의 분포를 읽는 방법',paragraphs:[`천간·지지의 단순 분포는 ${Object.entries(natal.elementCounts).map(([e,n])=>`${e} ${n}`).join(' · ')}입니다. 가장 많거나 없는 오행은 관찰할 정보이며 그 자체로 좋고 나쁨을 뜻하지 않습니다.`,'계절의 힘, 뿌리, 생극의 실제 작용을 평가하지 않은 단순 개수로 신강·신약이나 용신·희신을 정하면 안 됩니다. 이 두 판정은 아직 계산하지 않습니다.'],evidence:Object.entries(natal.elementCounts).map(([e,n])=>`${e}: ${n}/8`),actions:['오행 수를 채우기 위해 소비하거나 중요한 결정을 바꾸기보다 생활의 균형을 실제 경험에서 점검해보세요.']},
 ];
 return {method:'traditional-rules-v1',intro:`${natal.input.name||'나'}의 일간은 ${day.hanja}(${day.korean}), ${trait.image}의 이미지입니다. 계산된 원국과 십성 관계를 바탕으로 성향·일·재물·관계를 차례로 살펴보세요.`,sections,annual:Object.fromEntries(fortune.annual.map(p=>{
 const section=luckReading(p,`annual-${p.year}`,`${p.year}년의 흐름`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)} · 입춘 기준`);
 const stemFamily=family(p.stemTenGod),branchFamily=family(p.branchTenGod);
 section.paragraphs.push(`재물·일의 관점에서는 ${stemFamily==='재성'||branchFamily==='재성'?'재성 배속이 나타나므로 자원 관리와 기회 검토라는 주제를 중심으로 읽습니다.':stemFamily==='식상'||branchFamily==='식상'?'식상 배속이 나타나므로 결과물을 만들고 표현하는 과정을 살펴봅니다.':'재성이나 식상 이외의 배속이 중심이므로 수익의 증감보다 일하는 방식과 자원 운영의 조건을 살펴봅니다.'} ${stemFamily==='관성'||branchFamily==='관성'?'관성은 역할과 약속을 점검하는 관점으로 함께 읽을 수 있습니다.':'성과와 진로는 실제 경험·시장·선택의 조건과 함께 판단해야 합니다.'}`);
 const spouseRelations=p.relations.filter(r=>r.left==='일주');section.paragraphs.push(`가까운 관계에서는 ${spouseRelations.length?spouseRelations.map(r=>`일주와 연운의 ${r.pair}${r.type}`).join(', ')+ '이 배속됩니다. 생활의 기준과 서로의 기대를 구체적으로 나눠보는 관점입니다.':'일주와 연운 사이에 표시할 쌍별 관계가 없습니다. 관계의 좋고 나쁨을 이 유무만으로 결정하지 않습니다.'}`);
 if(p.cycleRelations.length){section.paragraphs.push(`대운과 연운을 함께 보면 ${p.cycleRelations.map(r=>r.pair+r.type).join(', ')}이 배속됩니다. ${p.year}년 7월 기준 대운과 비교한 값으로, 그해에 대운이 바뀌면 전후 구간은 따로 읽어야 합니다.`);section.evidence.push(...p.cycleRelations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`));}
 return [p.year,section];
 })),months:fortune.months.map(p=>luckReading(p,`month-${p.index}`,`${p.term}부터의 월운`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)}`)),daily:luckReading(fortune.daily,'daily','오늘의 일진 풀이',fortune.referenceDate),cycles:fortune.cycles.periods.map(p=>luckReading(p,`cycle-${p.index}`,`${p.index}대운 · ${compact(p)}`,`${p.startDate.slice(0,10)} ~ ${p.endDate.slice(0,10)}`)),limitations:['이 풀이는 전통 배속과 공개된 규칙을 적용한 해석이며 AI가 생성한 예언이 아닙니다.','개인의 성격·사건·성과를 확정하거나 운세 점수를 임의로 만들지 않습니다.','신강·신약, 용신·희신, 실제 합화, 궁합과 결혼 시기 판정은 미구현입니다.','절입 천문 모델의 KASI 전 기간 독립 대조는 아직 TODO입니다.']};
}
