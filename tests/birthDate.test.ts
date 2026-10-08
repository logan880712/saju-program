import {describe,it,expect} from 'vitest';
import {birthDateDigits,parseBirthDateDraft} from '../src/input/birthDate';
import {calculateSaju} from '../src/engine/calculate';
import type {BirthInput} from '../src/engine/types';
const base:BirthInput={name:'입력 검증',gender:'선택 안 함',calendar:'solar',date:'',time:'12:00',region:'서울',leapMonth:false};

describe('숫자 생년월일 입력',()=>{
 it.each([['19500101','1950-01-01'],['19880712','1988-07-12'],['20301231','2030-12-31'],['1988-07-12','1988-07-12']])('%s를 완성된 계산용 날짜로 변환', (raw,canonical)=>{
  expect(parseBirthDateDraft(raw)).toEqual({canonical,complete:true,message:''});
  expect(calculateSaju({...base,date:canonical}).solarDate).toBe(canonical);
 });
 it.each(['','1988','198807','1988071','88','880712','1988-07-','1988/07/12'])('부분 입력·두 자리 연도·다른 형식은 추측하지 않음: %s',raw=>{
  const parsed=parseBirthDateDraft(raw);expect(parsed.canonical).toBe('');expect(parsed.complete).toBe(false);expect(parsed.message).not.toBe('');
 });
 it.each(['19880012','19881312','19880700','19880732'])('기본 월·일 범위 오류를 안내: %s',raw=>{
  const parsed=parseBirthDateDraft(raw);expect(parsed.complete).toBe(true);expect(parsed.message).not.toBe('');
 });
 it('저장한 canonical 날짜를 숫자로 표시하고 빈값을 유지',()=>{
  expect(birthDateDigits('1988-07-12')).toBe('19880712');expect(birthDateDigits('')).toBe('');
 });
 it('양력 윤일 존재 여부는 입력 형식이 아닌 계산 엔진에서 검증',()=>{
  const parsed=parseBirthDateDraft('20230229');expect(parsed.message).toBe('');expect(()=>calculateSaju({...base,date:parsed.canonical})).toThrow('존재하지 않는 날짜');
  expect(calculateSaju({...base,date:parseBirthDateDraft('20240229').canonical}).solarDate).toBe('2024-02-29');
 });
 it('음력 날짜에 양력 2월 일수 제한을 적용하지 않음',()=>{
  const parsed=parseBirthDateDraft('20230230');expect(parsed.message).toBe('');expect(parsed.canonical).toBe('2023-02-30');
  expect(()=>calculateSaju({...base,date:parsed.canonical,calendar:'lunar'})).not.toThrow();
 });
 it('윤달 여부와 존재 여부는 한국 음력 계산 엔진이 검증',()=>{
  const date=parseBirthDateDraft('20230201').canonical;
  expect(calculateSaju({...base,date,calendar:'lunar',leapMonth:true}).solarDate).toBe('2023-03-22');
  expect(()=>calculateSaju({...base,date:parseBirthDateDraft('20240101').canonical,calendar:'lunar',leapMonth:true})).toThrow('존재하지 않는 날짜 또는 윤달');
 });
});
