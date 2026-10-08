import {describe,it,expect} from 'vitest';
import {calculateSaju} from '../src/engine/calculate';
import {calculateFortune,seoulToday} from '../src/engine/fortune';
import {pairRelations} from '../src/engine/relations';
import {interpretReport,luckReading} from '../src/interpretation/readings';
import {buildConsultation} from '../src/interpretation/consultation';
import type {BirthInput} from '../src/engine/types';
const input:BirthInput={name:'검증',gender:'남성',calendar:'solar',date:'1988-07-12',time:'12:00',region:'서울',leapMonth:false};
const run=(patch:Partial<BirthInput>={})=>calculateFortune(calculateSaju({...input,...patch}),2026,'2026-10-07');
describe('대운 · 연운 · 월운 · 일진',()=>{
 it('2026 병오와 2027 정미: 양력 1월이 아닌 입춘 경계',()=>{const f=run();expect(f.annual.map(p=>p.ganji)).toEqual(['丙午','丁未']);expect(f.annual[0].startDate.slice(0,10)).toBe('2026-02-04');expect(f.annual[0].endDate).toBe(f.annual[1].startDate);});
 it('2026년 절입 월간지 12개와 연속 구간',()=>{const m=run().months;expect(m.map(p=>p.ganji)).toEqual(['庚寅','辛卯','壬辰','癸巳','甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑']);expect(m[0].startDate).toBe(run().annual[0].startDate);for(let i=0;i<11;i++)expect(m[i].endDate).toBe(m[i+1].startDate);expect(m[11].endDate).toBe(run().annual[0].endDate);});
 it('양년 남성 순행 · 여성 역행',()=>{expect(run().cycles.direction).toBe('순행');expect(run({gender:'여성'}).cycles.direction).toBe('역행');});
 it('음년 남성 역행 · 여성 순행',()=>{expect(run({date:'1989-07-12'}).cycles.direction).toBe('역행');expect(run({date:'1989-07-12',gender:'여성'}).cycles.direction).toBe('순행');});
 it('입춘 당일의 실제 절입 시각에 따라 년간 음양과 대운 순역이 달라짐',()=>{expect(run({date:'2024-02-04',time:'17:26'}).cycles.direction).toBe('역행');expect(run({date:'2024-02-04',time:'17:28'}).cycles.direction).toBe('순행');});
 it('대운은 월주 다음 간지부터 10개, 현재 구간 하나',()=>{const f=run();expect(f.cycles.periods).toHaveLength(10);expect(f.cycles.periods.filter(p=>p.active)).toHaveLength(1);const month=calculateSaju(input).pillars[1].ganji;expect(f.cycles.periods[0].ganji).not.toBe(month);for(let i=0;i<9;i++)expect(f.cycles.periods[i].endDate).toBe(f.cycles.periods[i+1].startDate);});
 it('성별 미선택은 방향을 추정하지 않음',()=>{const f=run({gender:'선택 안 함'});expect(f.cycles.status).toBe('gender_required');expect(f.cycles.periods).toEqual([]);expect(f.cycles.direction).toBeUndefined();expect(f.annual).toHaveLength(2);});
 it('라이브러리 공개 기산 회귀값: 2022-03-09 20:51 UTC+8 → 21:51 한국',()=>{
  // https://github.com/6tail/lunar-javascript/blob/master/__tests__/Yun.test.js (test5)
  const f=run({date:'2022-03-09',time:'21:51'});expect(f.cycles.startAge).toMatchObject({years:8,months:9,days:2});expect(f.cycles.startDate?.slice(0,10)).toBe('2030-12-12');expect(f.cycles.periods.some(p=>p.active)).toBe(false);
 });
 it('라이브러리 공개 기산 회귀값: 2018-06-11 09:30 UTC+8 → 10:30 한국',()=>{
  // Same upstream test file (test6), female / minute-based sect 2.
  expect(run({date:'2018-06-11',time:'10:30',gender:'여성'}).cycles.startDate?.slice(0,10)).toBe('2020-03-21');
 });
 it('일진은 별도 원국 계산의 정오 일주와 같음',()=>{expect(run().daily.ganji).toBe(calculateSaju({...input,date:'2026-10-07'}).pillars[2].ganji);});
 it('조회 날짜와 연도는 별도: 다른 연도를 골라도 오늘 일진은 유지',()=>{const natal=calculateSaju(input),a=calculateFortune(natal,2026,'2026-10-07'),b=calculateFortune(natal,2030,'2026-10-07');expect(a.daily).toEqual(b.daily);expect(a.cycles).toEqual(b.cycles);expect(b.annual[0].year).toBe(2030);});
 it('연도 전환 순간도 서울 날짜를 사용',()=>{expect(seoulToday(new Date('2025-12-31T15:00:00Z'))).toBe('2026-01-01');expect(seoulToday(new Date('2025-12-31T14:59:59Z'))).toBe('2025-12-31');});
 it.each([1949,2131,2026.5,NaN])('지원 밖 연도 거부 %s',year=>expect(()=>calculateFortune(calculateSaju(input),year)).toThrow());
 it('존재하지 않는 조회 날짜 거부',()=>expect(()=>calculateFortune(calculateSaju(input),2026,'2026-02-30')).toThrow());
});
describe('쌍별 관계와 규칙 기반 해석의 데이터 계약',()=>{
 it('갑기 천간합 · 자축 육합',()=>{expect(pairRelations('甲子','己丑','a','b').map(r=>r.type)).toEqual(['천간합','육합']);});
 it('자오 충 · 묘유 충',()=>{expect(pairRelations('甲子','丙午','a','b').some(r=>r.type==='충')).toBe(true);expect(pairRelations('乙卯','丁酉','a','b').some(r=>r.type==='충')).toBe(true);});
 it('자묘형, 진진 자형, 자유파, 자미해',()=>{expect(pairRelations('甲子','乙卯','a','b').some(r=>r.type==='형')).toBe(true);expect(pairRelations('甲辰','乙辰','a','b').some(r=>r.type==='형')).toBe(true);expect(pairRelations('甲子','乙酉','a','b').some(r=>r.type==='파')).toBe(true);expect(pairRelations('甲子','乙未','a','b').some(r=>r.type==='해')).toBe(true);});
 it('관계는 좌우를 바꿔도 같은 종류',()=>{expect(pairRelations('甲子','乙卯','a','b').map(r=>r.type)).toEqual(pairRelations('乙卯','甲子','b','a').map(r=>r.type));});
 it('성향·재물·직업·관계·변화·오행 6개, 운마다 실제 근거 포함',()=>{const natal=calculateSaju(input),f=run(),r=interpretReport(natal,f);expect(r.sections.map(s=>s.id)).toEqual(['nature','wealth','career','relationship','change','elements']);expect(r.annual[2026].evidence).toContain('운 간지 丙午');expect(r.months).toHaveLength(12);expect(r.cycles).toHaveLength(10);expect(r.daily.evidence).toContain(`운 간지 ${f.daily.ganji}`);expect(r.method).toBe('traditional-rules-v2');});
 it('두 사람의 일간이 다르면 성향 풀이도 달라짐',()=>{const a=calculateSaju(input),b=calculateSaju({...input,date:'1988-07-13'});expect(interpretReport(a,run()).sections[0].title).not.toBe(interpretReport(b,run({date:'1988-07-13'})).sections[0].title);});
 it('풀이가 원국을 변경하지 않으며 같은 데이터의 결과는 동일',()=>{const n=calculateSaju(input),f=run(),before=JSON.stringify({n,f});const a=interpretReport(n,f);expect(interpretReport(n,f)).toEqual(a);expect(JSON.stringify({n,f})).toBe(before);expect(JSON.parse(JSON.stringify(a))).toEqual(a);});
 it('종합·인쇄·JSON의 원국/오늘 본문은 같은 계산 자료의 상담을 사용하고 기존 근거를 보존함',()=>{
  const natal=calculateSaju({...input,date:'1988-01-03',gender:'여성'}),fortune=calculateFortune(natal,2026,'2026-10-08');
  const before=JSON.stringify({natal,fortune}),r=interpretReport(natal,fortune),story=buildConsultation({natal,fortune},'daily');
  expect(r.daily.paragraphs).toEqual([story.opening,...story.chapters.map(c=>c.text),story.takeaway]);
  expect(r.daily.evidence).toContain(`운 간지 ${fortune.daily.ganji}`);
  expect(r.daily.evidence.join(' ')).toContain('자묘형');
  expect(r.daily.paragraphs.join(' ')).toContain('편인·편인');
  expect(r.sections.find(s=>s.id==='wealth')!.paragraphs[0]).toBe(buildConsultation({natal,fortune},'wealth').opening);
  expect(r.sections.find(s=>s.id==='wealth')!.evidence).toContain('일주 지장간 庚: 정재');
  expect(JSON.stringify({natal,fortune})).toBe(before);
 });
 it('2030년 연운의 전체 리포트는 선택 연도와 해당 연도의 대운을 상담과 일치시킴',()=>{
  const natal=calculateSaju(input),fortune=calculateFortune(natal,2030,'2026-10-08'),r=interpretReport(natal,fortune);
  const story=buildConsultation({natal,fortune},'annual');
  expect(r.annual[2030].paragraphs[0]).toBe(story.opening);
  expect(r.annual[2030].paragraphs.join(' ')).toContain('2030년 7월 기준');
  expect(r.annual[2030].paragraphs.join(' ')).not.toContain('올해');
  expect(r.annual[2031].paragraphs[0]).toBe(buildConsultation({natal,fortune},'nextYear').opening);
  expect(r.daily.paragraphs.join(' ')).toContain('2026-10-08');
  expect(r.daily.paragraphs.join(' ')).not.toContain('2030년');
 });
 it('2030년 미래 출생으로 조회한 2026년 월운은 달력 자료만 보존하고 개인 운세를 붙이지 않음',()=>{
  const natal=calculateSaju({...input,date:'2030-06-02'}),fortune=calculateFortune(natal,2026,'2026-10-08'),before=JSON.stringify({natal,fortune}),r=interpretReport(natal,fortune);
  for(const [index,section] of r.months.entries()){
   expect(section.paragraphs.join(' ')).toContain('출생 전 기간');
   expect(section.paragraphs.join(' ')).toContain('개인 운세를 붙이지 않고');
   expect(section.paragraphs.join(' ')).not.toContain('에 초점을 두고 읽는 흐름');
   expect(section.evidence).toContain(`운 간지 ${fortune.months[index].ganji}`);
   expect(section.id).toBe(`month-${index}`);
  }
  for(const id of ['wealth','career','relationship']){
   const section=r.sections.find(s=>s.id===id)!;
   expect(section.paragraphs.join(' ')).toContain('개인화된 배경으로 붙이지 않고');
   expect(section.paragraphs.join(' ')).not.toContain('2026-10-08 정오 기준 배경은');
  }
  expect(JSON.stringify({natal,fortune})).toBe(before);
 });
 it('출생 시각을 걸친 월운은 그 시각 이후의 부분만 참고한다고 명시함',()=>{
  const natal=calculateSaju({...input,date:'2030-02-15'}),fortune=calculateFortune(natal,2030,'2030-03-01'),r=interpretReport(natal,fortune);
  expect(fortune.months[0].startDate<`${natal.calculation.standardTime}:00`).toBe(true);
  expect(r.months[0].paragraphs[0]).toContain('출생 시각을 걸쳐');
  expect(r.months[0].paragraphs[0]).toContain('2030-02-15 12:00:00부터');
  expect(r.months[0].paragraphs[0]).toContain(`${fortune.months[0].endDate} 전까지`);
  expect(r.months[0].paragraphs[1]).toContain('에 초점을 두고 읽는 흐름');
  expect(r.months[1].paragraphs[0]).not.toContain('출생 시각을 걸쳐');
 });
 it('종료가 출생 시각과 같으면 출생 전이고 정상 성인의 월운·선택 대운은 기존 풀이를 유지함',()=>{
  const natal=calculateSaju(input),fortune=run(),birth=`${natal.calculation.standardTime}:00`;
  const before=luckReading({...fortune.months[0],startDate:'1988-07-11 12:00:00',endDate:birth},'test','검증','검증',natal);
  expect(before.paragraphs[0]).toContain('출생 전 기간');
  const r=interpretReport(natal,fortune);
  expect(r.months[0].paragraphs[0]).toContain('에 초점을 두고 읽는 흐름');
  expect(r.cycles[0].paragraphs[0]).toContain('에 초점을 두고 읽는 흐름');
  expect(r.months[0].paragraphs.join(' ')).not.toContain('출생 전 기간');
 });
});
