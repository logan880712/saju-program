import type {AnnualLuck, FullReport, LuckPillar, Relation} from '../engine/fortuneTypes';
import type {GodGroup, GodSource} from '../engine/profile';
import {gods, traits} from './themes';

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

const seasonPicture = {
  봄:'봄밭은 아직 자리를 잡아가는 곳이에요. 작은 시도와 주변의 도움을 함께 살피는 풍경으로 읽어요.',
  여름:'여름밭은 햇볕과 움직임이 눈에 잘 들어오는 곳이에요. 힘껏 하는 일과 쉬어갈 시간을 함께 챙기는 풍경으로 읽어요.',
  가을:'가을밭은 자란 것을 살피고 거두어 정리하는 곳이에요. 남길 것과 다듬을 것을 나누는 풍경으로 읽어요.',
  겨울:'겨울밭은 겉으로 조용해 보여도 안에 다음 계절의 준비가 담겨 있어요. 살펴보고 준비할 시간을 챙기는 풍경으로 읽어요.',
};
const roleName:Record<string,string> = {
  비견:'내 기준을 지키며 함께하는 모습',겁재:'사람들과 힘을 모으는 모습',
  식신:'솜씨를 꾸준히 쌓는 모습',상관:'새 생각을 꺼내는 모습',
  편재:'사람과 새로운 기회를 잇는 모습',정재:'살림을 차곡차곡 챙기는 모습',
  편관:'큰 과제를 나누어 감당하는 모습',정관:'약속으로 신뢰를 쌓는 모습',
  편인:'남다른 관점으로 살펴보는 모습',정인:'배우고 기댈 자리를 만드는 모습',
};
const workPicture:Record<string,string> = {
  비견:'각자 맡을 자리가 분명하고, 서로의 의견을 동등하게 나누는 일',
  겁재:'혼자 다 하는 대신 사람을 모으고 역할을 나누는 일',
  식신:'손에 익는 과정을 반복하며 품질을 높이는 제작이나 운영',
  상관:'불편한 점을 찾아 개선하거나 생각을 글과 작품으로 꺼내는 일',
  편재:'사람과 필요한 자원을 이어주는 거래나 프로젝트',
  정재:'비용과 일정, 자료를 꾸준히 챙기는 실무',
  편관:'권한과 도움을 갖추고 까다로운 과제를 해결하는 일',
  정관:'함께 지킬 기준과 약속을 정하고 관리하는 일',
  편인:'새 분야를 조사하고 다른 관점을 제안하는 일',
  정인:'배운 것을 정리하고 다른 사람에게 전하는 일',
};
const relationshipPicture:Record<string,string> = {
  비견:'나란히 걷는 두 사람처럼, 가까워도 각자의 선택과 자리를 존중하는 이야기예요.',
  겁재:'잔치를 함께 준비하듯 같이 움직이는 이야기예요. 다정함과 별개로 돈과 맡을 일은 미리 나누면 편해요.',
  식신:'밥 한 끼를 꾸준히 챙겨주듯, 작은 표현과 편안한 일상을 나누는 이야기예요.',
  상관:'닫힌 창문을 열듯 생각을 솔직하게 꺼내는 이야기예요. 시원한 바람도 상대가 추우면 조금 조절해주면 좋겠지요.',
  편재:'같이 장터를 구경하듯 경험을 넓히는 이야기예요. 즐길 시간과 쓸 돈의 기준도 함께 나눠보세요.',
  정재:'살림의 자리를 하나씩 맞추듯, 작은 약속을 쌓아가는 이야기예요. 익숙해져도 고마운 마음은 말로 전해보세요.',
  편관:'무거운 짐을 함께 들듯 책임을 나누는 이야기예요. 잘해내려는 마음만큼 서로 얼마나 감당할 수 있는지도 물어보세요.',
  정관:'같은 집의 생활 약속을 정하듯, 신뢰할 기준을 맞추는 이야기예요. 정해진 틀 안에도 서로의 사정이 들어갈 자리를 남겨두세요.',
  편인:'각자 읽던 책을 들려주듯, 다른 관심과 생각할 시간을 존중하는 이야기예요.',
  정인:'그늘 아래서 쉬어가듯, 서로에게 배우고 마음을 기댈 자리를 만드는 이야기예요.',
};
const elementPictures:Record<string,string> = {목:'나무처럼 자라고 이어가기',화:'불빛처럼 밖으로 표현하기',토:'흙처럼 자리 잡고 돌보기',금:'도구처럼 기준을 세우고 다듬기',수:'물처럼 살피고 연결하기'};
const plainPosition:Record<string,string> = {년주:'태어난 해',월주:'태어난 달',일주:'태어난 날',시주:'태어난 시각'};
const positions = (sources:GodSource[]) => [...new Set(sources.map(s=>plainPosition[s.position]||s.position))].join('과 ');
const sourceEvidence = (report:FullReport, ...groups:GodGroup[]) => groups.flatMap(group => [...report.fortune.profile.groups[group].visible,...report.fortune.profile.groups[group].hidden].map(s=>`${s.position} ${s.layer} ${s.hanja}: ${s.god}`));
const relationEvidence = (relations:Relation[]) => relations.map(r=>`${r.left} ↔ ${r.right}: ${r.pair} ${r.type}`);
const sourceDescription = (report:FullReport, group:GodGroup, noun:string) => {
  const {visible,hidden}=report.fortune.profile.groups[group];
  if(visible.length&&hidden.length)return `${noun}에 관한 재료는 ${positions(visible)}의 겉으로 드러난 부분에도, ${positions(hidden)}의 안쪽에도 있어요. 상 위에 놓인 그릇만 보지 말고 찬장 안의 그릇도 함께 살펴보는 셈이지요.`;
  if(visible.length)return `${noun}에 관한 재료가 ${positions(visible)}의 겉으로 드러난 부분에 있어요. 자주 꺼내 쓰는 그릇처럼 이 주제를 먼저 살펴볼 수 있어요.`;
  if(hidden.length)return `${noun}에 관한 재료는 겉에 바로 드러나지 않고 ${positions(hidden)}의 안쪽에 담겨 있어요. 찬장 안에 둔 그릇도 필요할 때 꺼내 쓰듯, 속에 든 글자까지 함께 읽어야 해요.`;
  return `${noun}에 해당하는 글자는 겉과 속을 함께 살펴봐도 없어요. 그렇다고 그 능력이나 인연이 없다는 말은 아니에요. 사주에 없는 이야기는 실제 경험과 생활 속 연습에서 따로 살펴보면 돼요.`;
};

/** Describe only relations computed by the engine; do not turn a pair into an event. */
function relationStory(relations:Relation[], context:'natal'|'luck'):string {
  const clashes=relations.filter(r=>r.type==='충');
  const joins=relations.filter(r=>r.type==='육합'||r.type==='천간합');
  const work=relations.some(r=>r.left==='월주'||r.right==='월주');
  const close=relations.some(r=>r.left==='일주'||r.right==='일주');
  const area=work&&close?'일의 약속과 가까운 사람의 사정':work?'일의 일정과 맡을 역할':close?'가까운 사람과의 약속과 생활 리듬':'생활의 일정과 서로의 기대';
  if(clashes.length)return `계산된 글자 사이에는 서로 다른 방향을 보는 짝이 있어요. 한쪽은 빨리 가자 하고 한쪽은 잠깐 쉬자 하는 모습으로 생각하면 쉬워요. ${area}을 한 번에 맞추려 하지 말고, 바꿀 부분을 하나씩 이야기해보세요.${joins.length?' 함께 묶이는 짝도 있으니, 함께할 일과 각자 맡을 일을 나누면 이야기가 더 분명해져요.':''}`;
  if(joins.length)return `계산된 글자 사이에는 서로 묶이는 짝이 있어요. 두 사람이 한 바구니를 함께 드는 모습과 비슷해요. ${area}을 함께 정하되, 바구니 속 짐이 한쪽으로만 쏠리지 않도록 각자의 몫을 나눠보세요.`;
  if(relations.some(r=>r.type==='형'&&r.pair[0]===r.pair[1]))return `같은 자리에 두 번 바느질하듯, 같은 글자가 반복된 짝이 있어요. 이미 정한 기준을 다시 되짚는 이미지로 읽어요. 마음속에서만 여러 번 생각한 일이 있다면 실제 대화로 한 번 확인해보세요.`;
  if(relations.length)return `계산된 글자 사이에는 약속의 세부나 서로 다른 기대를 살펴보는 짝이 있어요. 옷의 작은 단추를 다시 달듯, 큰 결론을 내리기보다 ${area}에서 어긋난 부분 하나부터 맞춰보세요.`;
  return context==='natal'?'서로 맞서거나 묶이는 특별한 짝은 표시되지 않았어요. 큰 변화를 억지로 찾아내기보다 지금 지켜온 약속과 생활 리듬을 먼저 돌아보면 좋아요.':'이 흐름과 태어난 글자 사이에는 표시할 특별한 짝이 없어요. 그래서 좋다 나쁘다를 붙이기보다, 앞서 나눈 주제를 내 일정에 어떻게 담을지 살펴보면 돼요.';
}

function luckChapters(report:FullReport, pillar:LuckPillar&{relations:Relation[]}, period:string):{title:string;text:string}[] {
  const outer=gods[pillar.stemTenGod],inner=gods[pillar.branchTenGod];
  const native=gods[report.fortune.profile.monthMainGod];
  return [
    {title:`${period}에 꺼내볼 이야기`,text:`이 시기의 바깥 글자는 ${roleName[pillar.stemTenGod]}에 빗대어 읽어요. ${outer.meaning}`},
    {title:'내 사주와 포개어 보면',text:pillar.stemTenGod===pillar.branchTenGod?`안쪽의 중심 글자도 같은 주제로 계산됐어요. 같은 이야기를 두 번 만나는 셈이니, ${outer.action} 태어난 달에는 ${roleName[report.fortune.profile.monthMainGod]}라는 재료가 있어요. 그 바탕 위에 이번 주제를 포개어 읽어보세요.`:`안쪽의 중심 글자는 ${roleName[pillar.branchTenGod]}라는 또 다른 이야기예요. ${inner.meaning} 태어난 달의 바탕은 ${roleName[report.fortune.profile.monthMainGod]}라서, ${native.action}`},
    {title:'약속을 살필 자리',text:relationStory(pillar.relations,'luck')},
  ];
}

/** A local, deterministic narrator. The completed calculation is its only saju source. */
export function buildConsultation(report:FullReport,topic:ConsultationTopic):ConsultationStory {
  const {natal,fortune}=report,profile=fortune.profile,day=natal.pillars[2],month=natal.pillars[1];
  const name=natal.input.name.trim()?`${natal.input.name.trim()}님`:'당신';
  const trait=traits[day.stem.hanja],monthTheme=gods[profile.monthMainGod];
  const story:ConsultationStory={topic,title:CONSULTATION_TOPICS.find(t=>t.id===topic)!.label,opening:`좋아요, ${name}. 계산된 사주를 펼쳐놓고 한 가지씩 이야기해볼게요.`,chapters:[],takeaway:'',actions:[],evidence:[],notes:['계산된 원국에 전통 해석 규칙과 생활 비유를 적용한 상담입니다. AI가 자유롭게 답변하는 기능은 아닙니다.','비유는 자신을 돌아보는 관점이며 성격·사건·성과를 확정하는 판정이 아닙니다.']};
  const monthEvidence=[`일간 ${day.stem.hanja} ${day.stem.polarity}${day.stem.element}`,`월지 ${month.branch.hanja}, 계절 ${profile.season}, 본기 ${month.hiddenStems[0].hanja} ${profile.monthMainGod}`];
  const rootEvidence=profile.roots.map(r=>`${r.position} ${r.branch}: 일간 동오행 지장간 ${r.stems.join('·')}`);
  const roots=profile.roots.length?`${profile.roots.map(r=>plainPosition[r.position]||r.position).join('과 ')}의 안쪽에는 나를 나타내는 글자와 같은 재료가 담겨 있어요. 나무가 땅속에도 뿌리를 둔 모습을 떠올리면 쉬워요. 겉에 드러난 모습과 안에 기댈 자리를 함께 보는 거예요.`:'나를 나타내는 글자와 같은 재료는 땅속의 글자에서 찾지 못했어요. 뿌리가 없다 해서 약한 사람이라는 뜻은 아니에요. 주변 환경과 맡은 역할도 함께 살펴야 하는 부분이에요.';

  if(topic==='nature') {
    story.title='내 마음의 결을 살펴볼까요';
    story.opening=`${name}의 사주 중심은 ${trait.image}에 빗대어 읽어요. 그 풍경이 놓인 계절은 ${profile.season}이에요. 같은 모습도 놓인 계절에 따라 주변 이야기가 달라지니, 두 가지를 함께 살펴봐요.`;
    story.chapters=[
      {title:'나를 닮은 풍경',text:`당신을 나타내는 글자는 ${trait.image}에 빗대어 읽어요. ${trait.strength}`},
      {title:`${profile.season}에 놓인 그 풍경`,text:`같은 씨앗도 놓인 계절에 따라 주변 풍경이 달라지지요. 당신의 태어난 달은 ${profile.season}으로 계산됐어요. ${seasonPicture[profile.season]} 그 달의 중심에는 ${roleName[profile.monthMainGod]}라는 재료가 있어요. ${monthTheme.meaning}`},
      {title:'겉모습 안에 기댈 자리',text:roots},
    ];
    story.takeaway=`${trait.image}이라는 비유에 ${profile.season}의 바탕을 함께 놓고, 실제 내 모습과 닮은 부분부터 찾아보세요.`;
    story.actions=[monthTheme.action,trait.balance];story.evidence=[...monthEvidence,...rootEvidence];
    story.notes.push('계절·동오행 통근의 존재만으로 신강·신약이나 용신·희신을 판정하지 않습니다.');
  } else if(topic==='wealth') {
    const wealth=[...profile.groups.재성.visible,...profile.groups.재성.hidden],output=[...profile.groups.식상.visible,...profile.groups.식상.hidden];
    const steady=wealth.some(s=>s.god==='정재'),opportunity=wealth.some(s=>s.god==='편재');
    story.title='돈 이야기, 살림부터 차근차근';
    story.opening=`${name}의 돈 이야기는 ${steady&&opportunity?'차곡차곡 살림을 챙기는 모습과 장터에서 기회를 잇는 모습이 함께 있는':steady?'곶감을 하나씩 꿰듯 차곡차곡 살림을 챙기는':opportunity?'장터에서 사람과 기회를 이어주는':'타고난 글자보다 실제 살림의 틀을 하나씩 만들어보는'} 흐름으로 읽어요. ${wealth.length&&profile.groups.재성.visible.length===0?'그 재료가 겉보다 안쪽에 담겨 있어서, 바로 보이는 글자만으로 놓치지 않도록 함께 살펴볼게요.':'지킬 돈과 새로 써볼 돈의 그릇을 나누어 놓고 이야기해봐요.'}`;
    story.chapters=[
      {title:'내 살림에 담긴 재료',text:sourceDescription(report,'재성','돈과 자원을 다루는 일')},
      {title:steady&&opportunity?'살림돈과 새 기회를 나누기':steady?'곶감을 하나씩 꿰듯':opportunity?'장터에서 기회를 찾듯':'생활에서 돈의 길 만들기',text:steady&&opportunity?'곶감을 하나씩 꿰어두는 꾸준한 살림과, 장터에서 필요한 사람을 만나는 새로운 기회가 함께 있어요. 익숙한 돈을 지키는 일과 새 일을 해보는 돈을 따로 두면 이야기가 또렷해져요.':steady?'당신의 글자에는 곶감을 하나씩 꿰듯 차곡차곡 챙기는 이야기가 있어요. 반복되는 수입과 지출의 자리를 정하고, 남길 돈을 미리 떼어두는 모습으로 읽어보세요.':opportunity?'당신의 글자에는 장터에서 사람과 재료를 이어주는 이야기가 있어요. 새 거래나 프로젝트를 살펴볼 때는 인연이 좋은지, 조건이 맞는지, 얼마까지 감당할지를 각각 챙겨보세요.':'돈을 다루는 글자가 없다고 돈을 벌지 못한다는 뜻은 아니에요. 타고난 설명에 기대기보다 들어오는 길과 남겨두는 방법을 실제 생활에서 하나씩 만드는 관점으로 읽어요.'},
      {title:'내 솜씨와 돈 사이의 다리',text:`${sourceDescription(report,'식상','솜씨와 표현')} ${output.length?'밥을 잘 짓는 솜씨도 누가 먹을지 정해야 쓰임이 생기지요. 내가 만든 것을 누구에게 어떤 조건으로 건넬지 연결해보세요.':'작게 만든 것을 보여주고 반응을 듣는 일을 생활 속에서 연습해보면 좋아요.'}`},
    ];
    story.takeaway=steady&&opportunity?'지킬 살림과 새로 시도할 돈의 그릇을 따로 놓아보세요.':steady?'크게 한 번보다, 꾸준히 남기는 돈의 자리를 챙겨보세요.':opportunity?'좋아 보이는 기회에도 감당할 돈과 시간을 먼저 적어보세요.':'내 수입과 지출의 길을 실제 장부에서부터 만들어보세요.';
    story.actions=[steady?'반복 수입·고정 지출·저축할 돈을 한 장에 적어보세요.':'새 제안의 비용·기간·책임을 따로 적어보세요.',output.length?'내 결과물을 필요로 하는 사람과 주고받을 조건을 하나씩 정해보세요.':'작은 결과물 하나를 보여주고 실제 반응을 기록해보세요.'];
    story.evidence=sourceEvidence(report,'재성','식상');story.notes.push('재성과 식상의 존재는 재물 액수·수입 증가나 격국의 성립을 판정한 값이 아닙니다.');
  } else if(topic==='career') {
    const support=profile.monthMainGod==='정인'||profile.monthMainGod==='편인'?'식상':'인성';
    story.title='어떤 자리에서 일하기 편할까요';
    story.opening=`${name}의 태어난 달에는 ${roleName[profile.monthMainGod]}가 중심에 있어요. 이를 일로 옮기면 ${workPicture[profile.monthMainGod]}라는 모습이에요. 직업 이름부터 정하기보다, 실제 잘했던 일과 맞닿는 부분을 찾아봐요.`;
    story.chapters=[
      {title:'태어난 달에서 보는 일의 바탕',text:`당신의 태어난 달에는 ${roleName[profile.monthMainGod]}가 중심에 있어요. 일로 옮겨 생각하면 ${workPicture[profile.monthMainGod]}의 모습을 떠올릴 수 있어요. 그 모습이 실제로 해본 일과 어디서 닮았는지 살펴보세요.`},
      {title:'일을 오래 이어갈 재료',text:`${sourceDescription(report,support,support==='인성'?'배우고 도움을 받는 일':'솜씨와 결과물을 만드는 일')} ${support==='인성'?'새 일을 맡는다면 누가 알려줄지, 어떤 자료를 볼지부터 챙겨보세요.':'배운 것을 작게라도 손에 잡히는 결과물로 남겨보세요.'}`},
      {title:'책임에도 받침대가 필요해요',text:`${sourceDescription(report,'관성','약속과 책임')} 무거운 상을 들 때 받침대가 있어야 편하듯, 맡을 일뿐 아니라 결정할 권한과 도움도 함께 확인해보세요.`},
    ];
    story.takeaway=`직업의 이름보다 ‘${workPicture[profile.monthMainGod]}’라는 방식이 내 경험과 맞닿는지 살펴보세요.`;
    story.actions=['잘했던 일 하나와 힘들었던 일 하나를 적고, 그때의 역할과 환경을 비교해보세요.','새 역할을 맡기 전 목표·마감·권한·지원받을 곳을 확인해보세요.'];
    story.evidence=[...monthEvidence,...sourceEvidence(report,support,'관성')];story.notes.push('역할 예시는 전통 배속의 비유이며 특정 직업에 대한 적성 판정이나 취업·승진 예측이 아닙니다.');
  } else if(topic==='relationship') {
    const close=fortune.natalRelations.filter(r=>r.left==='일주'||r.right==='일주');
    story.title='가까운 마음에도 서로의 자리가 있어요';
    story.opening=`${name}의 가까운 관계를 읽는 자리에는 ${roleName[day.branchTenGod]}라는 재료가 있어요. ${relationshipPicture[day.branchTenGod]} 그 모습이 실제 관계에서 어디와 닮았는지 함께 살펴봐요.`;
    story.chapters=[
      {title:'가까운 관계를 읽는 자리',text:`태어난 날의 안쪽 글자는 ${roleName[day.branchTenGod]}에 빗대어 읽어요. ${relationshipPicture[day.branchTenGod]}`},
      {title:'다른 생활 자리와 만나는 부분',text:relationStory(close,'natal')},
      {title:'함께할 것과 내 몫을 나누기',text:`${sourceDescription(report,'비겁','내 기준과 동등한 사람들')} 한 상에서 밥을 먹어도 각자 그릇은 있지요. 같이 정할 일과 스스로 정할 일을 나누어두면 대화할 자리가 생겨요.`},
    ];
    story.takeaway='상대의 마음을 사주로 단정하기보다, 서로 기대하는 약속 하나를 실제 대화에서 맞춰보세요.';
    story.actions=[gods[day.branchTenGod].action,'시간·돈·연락 중 한 가지를 골라 서로 기대하는 기준을 이야기해보세요.'];
    story.evidence=[`일지 ${day.branch.hanja}, 본기 ${day.hiddenStems[0].hanja}: ${day.branchTenGod}`,...relationEvidence(close),...sourceEvidence(report,'비겁')];
    story.notes.push('배우자의 성격·직업·결혼 시기를 확정하지 않습니다. 궁합은 상대의 출생정보를 받아 별도로 계산해야 합니다.');
  } else if(topic==='change') {
    const active=fortune.cycles.periods.find(p=>p.active),clashes=fortune.natalRelations.filter(r=>r.type==='충');
    story.title='문을 옮기기 전에 짐을 살펴봐요';
    story.opening=`${name}의 태어난 글자에는 ${clashes.length?'서로 다른 방향을 보는 짝이 있어요. 한 사람은 빨리 가자 하고 다른 사람은 잠깐 쉬자 하는 모습으로 생각하면 쉬워요.':'서로 정면으로 맞서는 짝이 표시되지 않았어요. 그러니 사주에서 변화의 신호를 억지로 찾기보다 실제로 바꾸고 싶은 이유부터 챙겨봐요.'} 이사나 이직을 생각한다면, 함께 맞출 생활의 조건을 차근차근 나누어봐요.`;
    story.chapters=[
      {title:'원래 사주에 담긴 방향',text:relationStory(fortune.natalRelations,'natal')},
      {title:'현재의 큰 흐름과 함께 보기',text:active?`지금은 ${active.startDate.slice(0,10)}부터 ${active.endDate.slice(0,10)} 전까지의 큰 흐름에 들어 있어요. 그 흐름은 ${roleName[active.stemTenGod]}와 ${roleName[active.branchTenGod]}에 빗대어 읽어요. ${relationStory(active.relations,'luck')}`:fortune.cycles.status==='gender_required'?'큰 흐름의 방향을 계산하는 데 필요한 성별이 아직 선택되지 않았어요. 먼저 방향을 추측하지 않고, 태어난 글자와 조회한 해의 흐름까지만 살펴볼게요.':'조회 날짜는 계산된 큰 흐름의 시작 전이거나 표시하는 범위 밖이에요. 현재 큰 흐름을 억지로 붙이지 않고, 실제 계획의 조건을 먼저 살펴볼게요.'},
      {title:'움직일 이유와 감당할 조건',text:`이직이라면 바꾸고 싶은 역할·수입·생활 리듬을, 이사라면 비용·거리·함께 사는 사람의 사정을 따로 적어보세요. ${clashes.length?'서로 다른 방향의 짝이 있는 만큼 한 번에 모두 해결하려 하지 말고, 바꿀 수 있는 조건부터 순서를 정해보세요.':'변화를 나타내는 짝이 없더라도 현실에서 필요한 변화는 있을 수 있어요. 글자에서 신호를 기다리기보다 실제 이유와 준비를 함께 챙겨보세요.'}`},
    ];
    story.takeaway='큰 결심을 먼저 하기보다, 바꿀 이유와 남길 기준을 각각 한 줄씩 적어보세요.';
    story.actions=['변화의 비용·기한·도움받을 사람을 나누어 적어보세요.','지금 지키고 싶은 생활 기준 하나를 새 계획에도 넣어보세요.'];
    story.evidence=[...relationEvidence(fortune.natalRelations),...(active?[`현재 ${active.index}대운 ${active.ganji}: ${active.startDate} ~ ${active.endDate}`,...relationEvidence(active.relations)]:[`대운 상태: ${fortune.cycles.status}, 조회일 ${fortune.referenceDate}`])];
    story.notes.push('충·형이나 대운의 존재를 이사·이직·사고의 발생 또는 좋은 이동 날짜로 확정하지 않습니다.');
  } else if(topic==='elements') {
    const counts=Object.entries(natal.elementCounts),max=Math.max(...counts.map(([,n])=>n));
    const most=counts.filter(([,n])=>n===max).map(([e])=>e);
    const missing=counts.filter(([,n])=>n===0).map(([e])=>e);
    const hidden=missing.map(element=>({element,sources:natal.pillars.flatMap(p=>p.hiddenStems.filter(s=>s.element===element).map(s=>({position:p.label,hanja:s.hanja})))}));
    story.title='다섯 가지 재료로 보는 내 사주';
    story.opening=`${name}의 겉으로 보이는 사주에는 ${most.join('와 ')} 재료가 가장 많이 보여요. ‘${most.map(e=>elementPictures[e]).join(', ')}’라는 비유예요. 식탁 위 재료만으로 음식의 맛을 정할 수는 없듯, 안에 담긴 재료와 ${profile.season}의 풍경도 함께 살펴봐요.`;
    story.chapters=[
      {title:'겉에 놓인 여덟 글자',text:`겉에 보이는 여덟 글자를 세면 ${counts.map(([e,n])=>`${e} ${n}개`).join(', ')}예요. 가장 많이 보이는 ${most.join('와 ')}은 ${most.map(e=>elementPictures[e]).join(', ')}라는 비유로 읽어요. 많이 보인다는 사실과 좋은 재료라는 평가는 서로 다른 이야기예요.`},
      {title:'찬장 안의 재료도 살펴요',text:hidden.length?hidden.map(({element,sources})=>sources.length?`${element}은 겉에 없지만 ${[...new Set(sources.map(s=>plainPosition[s.position]))].join('과 ')}의 안쪽에 담겨 있어요. 상 위에 없다고 집 안에도 없는 것은 아닌 셈이지요.`:`${element}은 속의 글자까지 살펴봐도 없어요. 그 비유는 ‘${elementPictures[element]}’지만, 그런 능력이 없다는 뜻으로 읽지는 않아요.`).join(' '):'다섯 재료가 모두 겉으로 보이는 글자에 있어요. 다 있다고 완벽한 균형이 되는 것은 아니에요. 놓인 계절과 자리도 함께 봐야 해요.'},
      {title:'개수 다음에 볼 풍경',text:`태어난 달은 ${profile.season}이에요. ${seasonPicture[profile.season]} ${roots} 어느 재료가 꼭 필요하다는 결론을 개수만으로 붙이지는 않을게요.`},
    ];
    story.takeaway='겉으로 보이는 재료와 안쪽에 담긴 재료를 나누어 보고, 실제 내 생활과 닮은 부분부터 찾아보세요.';
    story.actions=['내 생활에서 잘 이어지는 일과 자주 미루는 일을 각각 적어보세요.','부족한 오행을 채우려고 소비하기보다, 필요한 생활 습관을 실제 경험에서 골라보세요.'];
    story.evidence=[...counts.map(([e,n])=>`표면 오행 ${e}: ${n}`),...hidden.flatMap(({element,sources})=>sources.map(s=>`${s.position} 지장간 ${s.hanja}: ${element}`)),...monthEvidence,...rootEvidence];
    story.notes.push('신강·신약, 용신·희신은 판정하지 않습니다. 오행 개수는 강도 점수가 아니며 행운의 색·물건을 산출하지 않습니다.');
  } else if(topic==='daily'||topic==='annual'||topic==='nextYear') {
    const annual:AnnualLuck|undefined=topic==='nextYear'?fortune.annual.find(p=>p.year===fortune.referenceYear+1):fortune.annual.find(p=>p.year===fortune.referenceYear);
    const pillar=topic==='daily'?fortune.daily:annual;
    const period=topic==='daily'?`${fortune.referenceDate} 하루`:`${annual?.year??fortune.referenceYear}년`;
    story.title=topic==='daily'?`${fortune.referenceDate}의 하루 이야기`:`${annual?.year??fortune.referenceYear}년의 이야기`;
    story.opening=pillar?`${name}에게 ${period}의 바깥 글자는 ${roleName[pillar.stemTenGod]}라는 주제로 계산됐어요. ${gods[pillar.stemTenGod].meaning} 내 일정에 어떻게 담을지 당신의 사주와 함께 살펴봐요.`:`${name}, ${period}에 해당하는 계산 결과가 보고서에 없어요. 조회 구간부터 확인해볼게요.`;
    const beforeBirth=topic==='daily'?fortune.referenceDate<natal.solarDate:(annual?.year??fortune.referenceYear)<Number(natal.solarDate.slice(0,4));
    if(beforeBirth||!pillar) {
      story.opening=beforeBirth?`${name}의 입력된 출생일은 ${natal.solarDate}이고, 조회하는 ${period}은 태어나기 전이에요. 이 구간에 개인 운세를 붙이지 않고 날짜부터 맞춰볼게요.`:`${name}, ${period}에 해당하는 계산 결과가 보고서에 없어요. 조회 구간부터 확인해볼게요.`;
      story.chapters=[
        {title:'개인 운세를 붙일 수 없는 구간',text:beforeBirth?`입력된 출생일은 ${natal.solarDate}인데, 조회하는 ${period}은 그보다 앞선 구간이에요. 아직 태어나기 전의 날짜를 개인 운세처럼 이야기하지는 않을게요.`:'이 조회 구간의 계산 결과가 보고서에 없어요. 다른 구간의 결과를 가져와 대신 이야기하지는 않을게요.'},
        {title:'날짜를 맞춰 다시 보기',text:'출생일이 맞는지 확인하고, 출생 이후의 조회 날짜나 해를 골라주세요. 미래의 출생정보를 시험으로 넣었다면 원국의 계산 결과까지만 살펴볼 수 있어요.'},
        {title:'계산 결과는 그대로 두어요',text:'이 상담에서 출생정보를 바꾸거나 다른 사주를 새로 만들지는 않아요. 입력 화면에서 정보를 고친 뒤 계산된 보고서로 다시 이야기할게요.'},
      ];
      story.takeaway='출생 이후의 조회 구간인지 먼저 확인해주세요.';story.actions=['출생일과 조회 날짜를 확인하고 다시 계산해주세요.'];
      story.evidence=[`양력 출생일 ${natal.solarDate}`,`조회 ${period}`];story.notes.push('출생 전 구간의 개인 운세를 생성하지 않습니다.');
    } else {
      story.chapters=luckChapters(report,pillar,period);
      if(annual&&topic!=='daily') {
        story.chapters.push({title:'달력의 시작과는 조금 달라요',text:`이 해의 흐름은 ${annual.startDate.slice(0,10)}부터 ${annual.endDate.slice(0,10)} 전까지예요. 사주에서 한 해를 여는 절기인 입춘을 기준으로 계산했어요.${annual.cycleRelations.length?' 큰 흐름과 이 해의 글자 사이에도 만나는 짝이 있어요. 긴 계획과 올해의 일을 따로 놓고, 같은 약속을 서로 어떻게 맞출지 살펴보세요.':' 긴 계획까지 함께 보고 싶다면 대운 이야기에서 현재 구간도 나란히 살펴보세요.'}`});
      }
      const theme=gods[pillar.stemTenGod];story.takeaway=theme.action;
      story.actions=[...new Set([theme.action,gods[pillar.branchTenGod].action,theme.watch])];
      story.evidence=[`조회 ${period}`,`운 간지 ${pillar.ganji}`,`일간 ${day.stem.hanja} 기준 천간 ${pillar.stemTenGod} / 본기 ${pillar.branchTenGod}`,...monthEvidence,...relationEvidence(pillar.relations),...(annual&&topic!=='daily'?relationEvidence(annual.cycleRelations):[])];
      story.notes.push('합·충·형·파·해는 쌍별 관계 자료이며 사건 발생·길흉 점수나 확정 예언으로 바꾸지 않습니다.');
      if(topic==='daily')story.notes.push('일진은 조회 날짜의 한국 표준시 정오 기준입니다. 이 계산 규칙에서 밤 23시 이후는 다음 일진으로 봅니다.');
    }
  } else {
    const cycles=fortune.cycles,active=cycles.periods.find(p=>p.active);
    story.title='오래 흐르는 물길, 대운 이야기';
    story.opening=active?`${name}의 현재 큰 물길은 ${active.startDate.slice(0,10)}에 시작된 구간이에요. 그 바깥 글자는 ${roleName[active.stemTenGod]}라는 이야기로 읽어요. 긴 물길 안에서도 하루와 해는 다르니, 10년을 한 사건으로 묶지 않고 살펴봐요.`:`${name}의 태어난 달은 ${profile.season}이지만, 조회일 ${fortune.referenceDate}에 해당하는 현재 대운은 표시되지 않았어요. ${cycles.status==='gender_required'?'방향을 계산하는 데 필요한 성별이 아직 선택되지 않았기 때문이에요.':'시작 날짜와 조회하는 구간을 함께 확인해볼게요.'}`;
    if(cycles.status==='gender_required') {
      story.chapters=[
        {title:'방향을 정할 정보가 하나 필요해요',text:'현재 입력에는 성별이 선택되지 않았어요. 이 프로그램이 쓰는 전통 계산법은 태어난 해 글자의 음양과 성별로 큰 흐름의 방향을 정해요. 필요한 정보를 짐작해 채우지는 않을게요.'},
        {title:'입력 화면에서 선택해주세요',text:'성별을 선택하고 다시 계산하면 시작 날짜와 10년씩의 구간을 볼 수 있어요. 계산법에 따라 시작 나이는 조금 달라질 수 있어서, 이 프로그램이 사용한 기준도 함께 보여드려요.'},
        {title:'지금 볼 수 있는 이야기는 있어요',text:'성향, 재물, 관계와 조회한 하루·해의 흐름은 이미 계산된 글자로 읽을 수 있어요. 대운을 정하지 않았다고 다른 이야기를 막거나 임의의 방향을 붙이지 않아요.'},
      ];
      story.takeaway='대운을 보고 싶다면 성별을 선택하고 다시 계산해주세요.';story.actions=['입력 화면에서 성별을 선택한 뒤 사주를 다시 계산해주세요.'];story.evidence=['대운 상태: gender_required'];
    } else if(!active) {
      const next=cycles.periods.find(p=>p.startDate.slice(0,10)>fortune.referenceDate),beforeBirth=fortune.referenceDate<natal.solarDate;
      story.chapters=[
        {title:'아직 현재 구간이 없어요',text:beforeBirth?`조회일 ${fortune.referenceDate}은 입력된 출생일 ${natal.solarDate}보다 앞이에요. 태어나기 전 날짜에 현재 대운을 붙이지 않을게요.`:next?`조회일 ${fortune.referenceDate}은 대운이 시작되기 전이에요. 첫 구간은 ${next.startDate.slice(0,10)}에 시작하도록 계산됐어요.`:`조회일 ${fortune.referenceDate}은 이 프로그램이 표시하는 대운 구간 밖이에요. 다른 구간을 현재 대운으로 대신 붙이지는 않을게요.`},
        {title:'시작 전 시간을 잘못 읽지 않기',text:'대운이 시작되기 전의 기간을 별도의 첫 대운처럼 만들지는 않아요. 시작 날짜와 실제 10년 구간을 구분해서 보면 계산 결과를 더 분명히 읽을 수 있어요.'},
        {title:'보고 싶은 날짜를 맞춰주세요',text:'출생정보와 조회 날짜를 확인하고, 계산된 구간에 해당하는 날짜로 다시 살펴보세요. 지금은 입력된 원국의 성향이나 관계 이야기부터 읽어도 좋아요.'},
      ];
      story.takeaway=beforeBirth?'출생 이후의 조회 날짜인지 확인해주세요.':next?`첫 대운의 시작일은 ${next.startDate.slice(0,10)}예요.`:'조회 날짜와 표시하는 대운 범위를 확인해주세요.';
      story.actions=['출생일과 조회 날짜를 확인해주세요.'];story.evidence=[`조회일 ${fortune.referenceDate}`,`대운 시작 ${cycles.startDate}`];
    } else {
      story.chapters=luckChapters(report,active,'이 큰 흐름');
      story.chapters.unshift({title:'지금 들어 있는 구간',text:`현재 조회일 ${fortune.referenceDate}은 ${active.startDate.slice(0,10)}부터 ${active.endDate.slice(0,10)} 전까지의 ${active.index}번째 큰 흐름에 들어 있어요. 물길이 길다고 매일 같은 물이 흐르는 것은 아니지요. 그 안의 하루와 해는 따로 계산해서 살펴보면 돼요.`});
      story.takeaway=gods[active.stemTenGod].action;story.actions=[...new Set([gods[active.stemTenGod].action,gods[active.branchTenGod].action,'긴 계획 하나와 이번 주 할 일 하나를 나눠 적어보세요.'])];
      story.evidence=[`조회일 ${fortune.referenceDate}`,`${active.index}대운 ${active.ganji}: ${active.startDate} ~ ${active.endDate}`,`천간 ${active.stemTenGod} / 본기 ${active.branchTenGod}`,...relationEvidence(active.relations)];
    }
    story.notes.push('대운 시작은 인접 절과 출생 시각의 차이로 계산하는 분 단위 기산법입니다. 학파별 기산법·반올림에 따라 시작일이 달라질 수 있습니다.');
  }
  return {...story,evidence:[...new Set(story.evidence)],actions:[...new Set(story.actions)]};
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
