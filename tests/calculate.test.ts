import { describe,it,expect } from 'vitest';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { calculateSaju, character,tenGod } from '../src/engine/calculate';
import type { BirthInput } from '../src/engine/types';
const base:BirthInput={name:'검증',gender:'선택 안 함',calendar:'solar',date:'2024-02-10',time:'12:00',region:'서울',leapMonth:false};
const calc=(patch:Partial<BirthInput>={})=>calculateSaju({...base,...patch});
describe('독립 달력 기준값과 음력 변환',()=>{
 it('2024 설날과 갑진·병인·갑진·경오 원국',()=>{
  const r=calc();expect(r.lunarDate).toMatchObject({year:2024,month:1,day:1,intercalation:false});
  expect(r.pillars.map(p=>p.ganji)).toEqual(['甲辰','丙寅','甲辰','庚午']);
 });
 it('양력과 한국 음력의 동일 결과',()=>{expect(calc({calendar:'lunar',date:'2024-01-01'}).pillars).toEqual(calc().pillars);});
 it('2023 윤2월 1일은 3월 22일',()=>{expect(calc({calendar:'lunar',date:'2023-02-01',leapMonth:true}).solarDate).toBe('2023-03-22');});
 it('한국과 중국 음력이 다른 2020년 10월 17일: 한국 9월 1일',()=>{expect(calc({date:'2020-10-17'}).lunarDate).toMatchObject({month:9,day:1});expect(calc({calendar:'lunar',date:'2020-09-01'}).solarDate).toBe('2020-10-17');});
 it.each(['1950-01-01','1954-07-12','1988-07-12','2000-02-29','2030-12-31'])('별도 한국 달력과 일주 비교: %s',date=>{
  const c=new KoreanLunarCalendar();const [y,m,d]=date.split('-').map(Number);expect(c.setSolarDate(y,m,d)).toBe(true);expect(calc({date}).pillars[2].ganji).toBe(c.getChineseGapja().day.slice(0,2));
 });
});
describe('절기·시각 경계',()=>{
 it('입춘은 KST 2024-02-04 17:27 부근: 1시간 변환 적용',()=>{
  expect(calc({date:'2024-02-04',time:'17:26'}).pillars.slice(0,2).map(p=>p.ganji)).toEqual(['癸卯','乙丑']);
  expect(calc({date:'2024-02-04',time:'17:28'}).pillars.slice(0,2).map(p=>p.ganji)).toEqual(['甲辰','丙寅']);
 });
 it('경칩 월주 경계: KST 2024-03-05 11:23 부근',()=>{
  expect(calc({date:'2024-03-05',time:'11:22'}).pillars[1].ganji).toBe('丙寅');
  expect(calc({date:'2024-03-05',time:'11:24'}).pillars[1].ganji).toBe('丁卯');
 });
 it('23시 일주 전환과 자시 천간',()=>{
  const before=calc({time:'22:59'}),at=calc({time:'23:00'}),next=calc({date:'2024-02-11',time:'00:00'});
  expect(before.pillars[2].ganji).toBe('甲辰');expect(at.pillars[2].ganji).toBe('乙巳');expect(at.pillars[2]).toEqual(next.pillars[2]);expect(at.pillars[3].ganji).toBe('丙子');expect(at.pillars[3]).toEqual(next.pillars[3]);
 });
 it('01시 축시 시작',()=>{expect(calc({time:'00:59'}).pillars[3].branch.hanja).toBe('子');expect(calc({time:'01:00'}).pillars[3].branch.hanja).toBe('丑');});
});
describe('배속과 데이터 계약',()=>{
 it('갑 기준 십성 10개',()=>{expect([...'甲乙丙丁戊己庚辛壬癸'].map(s=>tenGod('甲',s))).toEqual(['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인']);});
 it('음간 기준 정편 반전과 생성 관계',()=>{expect(tenGod('乙','丙')).toBe('상관');expect(tenGod('癸','甲')).toBe('상관');expect(()=>tenGod('庚','土')).toThrow();});
 it('지장간과 지지 본기 십성',()=>{const p=calc().pillars[1];expect(p.hiddenStems.map(s=>s.hanja)).toEqual(['甲','丙','戊']);expect(p.branchTenGod).toBe('비견');});
 it('오행 8글자, 음양, JSON 왕복, 입력 불변성',()=>{const copy={...base};const r=calculateSaju(copy);expect(copy).toEqual(base);expect(Object.values(r.elementCounts).reduce((a,b)=>a+b,0)).toBe(8);expect(character('子').polarity).toBe('양');expect(character('癸').polarity).toBe('음');expect(JSON.parse(JSON.stringify(r))).toEqual(r);});
 it('지역·성별은 원국에 영향 없음',()=>{expect(calc({region:'부산',gender:'여성'}).pillars).toEqual(calc().pillars);});
});
describe('임의 추측 대신 잘못된 입력 거부',()=>{
 it.each([{date:'2023-02-29'},{date:'2024-13-01'},{date:'1949-12-31'},{date:'2031-01-01'},{time:''},{time:'24:00'},{calendar:'lunar' as const,date:'2024-01-01',leapMonth:true},{region:'뉴욕'},{leapMonth:true}])('지원하지 않는 입력: %j',patch=>expect(()=>calc(patch)).toThrow());
});
