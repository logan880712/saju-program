import {describe,expect,it} from 'vitest';
import {calculateSaju} from '../src/engine/calculate';
import {calculateFortune} from '../src/engine/fortune';
import {interpretReport} from '../src/interpretation/readings';
import type {BirthInput} from '../src/engine/types';
import type {FullReport} from '../src/engine/fortuneTypes';
import {buildConsultation,CONSULTATION_TOPICS,consultationNeedsProfileChange,consultationTopicForQuestion} from '../src/interpretation/consultation';

const base:BirthInput={name:'이야기',gender:'선택 안 함',calendar:'solar',date:'1988-01-03',time:'12:00',region:'서울',leapMonth:false};
function report(input:Partial<BirthInput>={},date='2026-10-07',year=2026):FullReport {
  const natal=calculateSaju({...base,...input}),fortune=calculateFortune(natal,year,date);
  return {schemaVersion:'2.0',natal,fortune,interpretation:interpretReport(natal,fortune)};
}
const mainText=(story:ReturnType<typeof buildConsultation>)=>[story.opening,...story.chapters.map(c=>c.text),story.takeaway,...story.actions].join(' ');

describe('계산된 보고서만 읽는 상담 이야기',()=>{
  it('모든 주제를 같은 보고서에서 읽어도 원국·운·기존 풀이를 바꾸지 않음',()=>{
    const input=report(),before=JSON.stringify(input);
    for(const {id} of CONSULTATION_TOPICS) {
      const story=buildConsultation(input,id);
      expect(story.topic).toBe(id);
      expect(story.chapters.length).toBeGreaterThanOrEqual(3);
      expect(story.chapters.length).toBeLessThanOrEqual(4);
      expect(story.actions.length).toBeGreaterThan(0);
      expect(story.evidence.length).toBeGreaterThan(0);
      expect(story.notes.join(' ')).toContain('전통 해석 규칙');
    }
    expect(JSON.stringify(input)).toBe(before);
  });
  it('이름과 실제 일간의 비유로 시작하며 같은 일간도 계절에 따라 달라짐',()=>{
    const winter=report(),spring=report({date:'1988-03-03'});
    expect(winter.natal.pillars[2].stem.hanja).toBe(spring.natal.pillars[2].stem.hanja);
    const a=buildConsultation(winter,'nature'),b=buildConsultation(spring,'nature');
    expect(a.opening).toContain('이야기님');
    expect(mainText(a)).toContain('등불');expect(mainText(a)).toContain('겨울');
    expect(mainText(b)).toContain('봄');expect(a.chapters).not.toEqual(b.chapters);
    expect(a.evidence).toContain('일간 丁 음화');
  });
  it('1988-01-03의 겉에 없는 재성과 식상도 실제 속의 글자에서 읽음',()=>{
    const input=report();
    expect(input.fortune.profile.groups.재성.visible).toHaveLength(0);
    expect(input.fortune.profile.groups.식상.visible).toHaveLength(0);
    const story=buildConsultation(input,'wealth');
    expect(mainText(story)).toContain('찬장');expect(mainText(story)).toContain('곶감');
    expect(mainText(story)).toContain('태어난 날의 안쪽');
    expect(story.evidence).toContain('일주 지장간 庚: 정재');
    expect(story.evidence).toContain('일주 지장간 戊: 상관');
    expect(story.evidence).toContain('시주 지장간 己: 식신');
    expect(mainText(story)).not.toContain('솜씨와 표현에 해당하는 글자는 겉과 속을 함께 살펴봐도 없어요');
  });
  it('한자와 계산 전문어는 상담 본문에서 빼고 근거에 보존함',()=>{
    const input=report({gender:'여성'});
    for(const {id} of CONSULTATION_TOPICS) {
      const story=buildConsultation(input,id);
      expect(mainText(story)).not.toMatch(/[\u3400-\u9fff]/);
      expect(mainText(story)).not.toMatch(/십성|지장간|월지|일간|통근|천간|본기|신강|용신|합화/);
    }
    expect(buildConsultation(input,'nature').evidence.join(' ')).toContain('丁');
  });
  it('같은 날짜도 다른 사람의 실제 개인 십성에 따라 오늘 이야기가 달라짐',()=>{
    const a=report(),b=report({date:'1988-01-04'});
    expect(a.fortune.daily.ganji).toBe(b.fortune.daily.ganji);
    expect(a.fortune.daily.stemTenGod).not.toBe(b.fortune.daily.stemTenGod);
    const sa=buildConsultation(a,'daily'),sb=buildConsultation(b,'daily');
    expect(sa.chapters).not.toEqual(sb.chapters);
    expect(sa.evidence.join(' ')).toContain(a.fortune.daily.stemTenGod);
    expect(sb.evidence.join(' ')).toContain(b.fortune.daily.stemTenGod);
    expect(sa.title).toContain('2026-10-07');
    expect(sa.notes.join(' ')).toContain('23시');
  });
  it('올해와 내년은 각 연운의 계산된 절입 구간과 십성으로 구분함',()=>{
    const input=report(),a=buildConsultation(input,'annual'),b=buildConsultation(input,'nextYear');
    expect(a.title).toContain('2026');expect(b.title).toContain('2027');
    expect(a.chapters).not.toEqual(b.chapters);
    expect(mainText(a)).toContain(input.fortune.annual[0].startDate.slice(0,10));
    expect(mainText(b)).toContain(input.fortune.annual[1].endDate.slice(0,10));
    expect(mainText(a)).toContain('입춘');
    expect(b.evidence.join(' ')).toContain(input.fortune.annual[1].ganji);
  });
  it('출생 전 오늘·연운에 개인 운세를 만들어 붙이지 않음',()=>{
    const input=report({date:'2030-06-02',gender:'남성'});
    for(const topic of ['daily','annual','nextYear'] as const) {
      const story=buildConsultation(input,topic);
      expect(mainText(story)).toContain('아직 태어나기 전');
      expect(story.evidence).toContain('양력 출생일 2030-06-02');
      expect(story.notes.join(' ')).toContain('출생 전');
      expect(story.evidence.join(' ')).not.toContain('운 간지');
    }
  });
  it('성별 미선택이면 대운 방향·개시일을 추측하지 않고 재입력을 안내함',()=>{
    const story=buildConsultation(report(),'cycles');
    expect(mainText(story)).toContain('성별이 선택되지');
    expect(mainText(story)).toContain('다시 계산');
    expect(story.evidence).toEqual(['대운 상태: gender_required']);
    expect(mainText(story)).not.toMatch(/순행|역행|\d번째 큰 흐름/);
  });
  it('활성 대운은 엔진에서 계산된 구간만 현재 구간으로 읽음',()=>{
    const input=report({gender:'여성'}),active=input.fortune.cycles.periods.find(p=>p.active)!;
    expect(active).toBeDefined();
    const story=buildConsultation(input,'cycles');
    expect(mainText(story)).toContain(`${active.index}번째 큰 흐름`);
    expect(mainText(story)).toContain(active.startDate.slice(0,10));
    expect(mainText(story)).toContain(active.endDate.slice(0,10));
    expect(story.evidence.join(' ')).toContain(`${active.index}대운 ${active.ganji}`);
  });
  it('대운 시작 전은 임의의 현재 대운 없이 실제 시작일을 안내함',()=>{
    const input=report({gender:'여성'},'1988-01-04',1988);
    expect(input.fortune.cycles.periods.some(p=>p.active)).toBe(false);
    const story=buildConsultation(input,'cycles');
    expect(mainText(story)).toContain('대운이 시작되기 전');
    expect(mainText(story)).toContain(input.fortune.cycles.startDate!.slice(0,10));
    expect(mainText(story)).not.toContain('번째 큰 흐름에 들어');
  });
  it('오행 표면에 없는 금도 실제 지장간에 있음을 설명함',()=>{
    const input=report();expect(input.natal.elementCounts.금).toBe(0);
    const story=buildConsultation(input,'elements');
    expect(mainText(story)).toContain('금은 겉에 없지만');
    expect(story.evidence).toContain('일주 지장간 庚: 금');
    expect(story.notes.join(' ')).toContain('강도 점수가 아니');
  });
  it('동일한 입력으로 동일한 상담 결과를 생성함',()=>{
    const input=report();expect(buildConsultation(input,'relationship')).toEqual(buildConsultation(input,'relationship'));
  });
});

describe('주제 검색은 지원 범위 밖 질문을 억지로 풀이하지 않음',()=>{
  it.each([
    ['제 성격은 어떤가요?','nature'],['돈 모으는 방법은요?','wealth'],['직업운을 알려주세요','career'],
    ['배우자운이 궁금해요','relationship'],['이직할 때 살펴볼 점은요?','change'],['오행을 설명해주세요','elements'],
    ['오늘 운세는요?','daily'],['올해 운세를 봐주세요','annual'],['내년 흐름은요?','nextYear'],['대운을 설명해주세요','cycles'],
  ])('%s → %s', (question,topic)=>expect(consultationTopicForQuestion(question)).toBe(topic));
  it.each(['건강이 좋아질까요?','질병이 생길까요?','수명이 얼마나 되나요?','로또 번호 추천해주세요','올해 당첨운은요?','언제 결혼하나요?','몇 살에 결혼해요?','돈 언제 벌어요?','언제 부자가 되나요?','시험 합격하나요?','내년에 반드시 성공할까요?','용신은 뭔가요?','내일 운세는요?','아무 관련 없는 질문',''])('%s → 지원하지 않는 질문',question=>expect(consultationTopicForQuestion(question)).toBeNull());
  it.each(['친구 사주도 봐주세요','남편 오늘 운세를 알려주세요','아내는 1989년생인데 사주가 궁금해요','저 말고 어머니 봐주세요','자녀 생년월일을 입력할게요','상대 이름이 민수예요','제 궁합을 봐주세요','1990년생의 재물운을 알려주세요','출생시간을 11시로 바꿔 볼래요'])('%s → 현재 사람의 사주를 재사용하지 않음',question=>{
    expect(consultationNeedsProfileChange(question)).toBe(true);
    expect(consultationTopicForQuestion(question)).toBeNull();
  });
  it('자기 관계·배우자운 질문은 상대 원국 요청과 구분함',()=>{
    expect(consultationNeedsProfileChange('저의 배우자운을 설명해주세요')).toBe(false);
    expect(consultationNeedsProfileChange('남편과 가까운 관계 이야기를 해주세요')).toBe(false);
    expect(consultationTopicForQuestion('저의 배우자운을 설명해주세요')).toBe('relationship');
  });
});
