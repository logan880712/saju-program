import {describe,it,expect} from 'vitest';
import {resolveKoreaTime} from '../src/engine/koreaTime';
import {calculateSaju} from '../src/engine/calculate';
import type {BirthInput} from '../src/engine/types';
const input:BirthInput={name:'',gender:'선택 안 함',calendar:'solar',date:'1988-07-12',time:'01:30',region:'서울',leapMonth:false};
describe('한국 역사적 시각: IANA tzdb ROK/Asia/Seoul 기준값',()=>{
 it.each([
  [1950,1,1,12,0,540,0,'1950-01-01T03:00:00.000Z'],
  [1950,7,1,12,0,600,60,'1950-07-01T02:00:00.000Z'],
  [1954,7,1,12,0,510,0,'1954-07-01T03:30:00.000Z'],
  [1955,7,1,12,0,570,60,'1955-07-01T02:30:00.000Z'],
  [1961,8,9,12,0,510,0,'1961-08-09T03:30:00.000Z'],
  [1961,8,10,12,0,540,0,'1961-08-10T03:00:00.000Z'],
  [1988,5,8,1,59,540,0,'1988-05-07T16:59:00.000Z'],
  [1988,5,8,3,0,600,60,'1988-05-07T17:00:00.000Z'],
  [1988,10,9,1,59,600,60,'1988-10-08T15:59:00.000Z'],
  [1988,10,9,3,0,540,0,'1988-10-08T18:00:00.000Z'],
  [2030,12,31,12,0,540,0,'2030-12-31T03:00:00.000Z'],
 ] as const)('%i-%i-%i %i:%i UTC 오프셋', (y,m,d,h,min,offset,dst,utc)=>{const t=resolveKoreaTime(y,m,d,h,min);expect(t.offsetMinutes).toBe(offset);expect(t.dstMinutes).toBe(dst);expect(t.utc.toISOString()).toBe(utc);});
 it.each([[1950,4,1,0,30],[1961,8,10,0,15],[1987,5,10,2,30],[1988,5,8,2,30]])('존재하지 않는 전환 시각 거부: %j',(y,m,d,h,min)=>expect(()=>resolveKoreaTime(y,m,d,h,min)).toThrow('존재하지 않는'));
 it.each([[1954,3,20,23,45],[1987,10,11,2,30],[1988,10,9,2,30]])('두 번 존재하는 시각을 임의로 결정하지 않음: %j',(y,m,d,h,min)=>expect(()=>resolveKoreaTime(y,m,d,h,min)).toThrow('두 번 존재'));
 it('1988 여름 01:30은 표준시 00:30: 자시로 계산',()=>{const r=calculateSaju(input);expect(r.pillars[3].branch.hanja).toBe('子');expect(r.calculation.standardTime).toBe('1988-07-12 00:30');expect(r.calculation.dstCorrectionMinutes).toBe(60);});
 it('1988 겨울에는 서머타임 보정 없음',()=>{const r=calculateSaju({...input,date:'1988-01-12'});expect(r.pillars[3].branch.hanja).toBe('丑');expect(r.calculation.dstCorrectionMinutes).toBe(0);});
 it('서머타임 보정 후 23시 일주 전환',()=>{const r=calculateSaju({...input,time:'23:30'});expect(r.calculation.standardTime).toBe('1988-07-12 22:30');expect(r.pillars[2]).toEqual(calculateSaju({...input,time:'12:00'}).pillars[2]);});
 it('지원 양력 경계와 음력의 동일 출생 허용',()=>{expect(calculateSaju({...input,date:'1950-01-01'}).solarDate).toBe('1950-01-01');expect(calculateSaju({...input,date:'2030-12-31'}).solarDate).toBe('2030-12-31');expect(calculateSaju({...input,calendar:'lunar',date:'1988-05-29'}).solarDate).toBe('1988-07-12');});
});
