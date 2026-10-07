import { resolveKoreaTime } from './koreaTime';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { Solar } from 'lunar-javascript';
import type { BirthInput, Character, Element, Pillar, SajuResult } from './types';
const stems='甲乙丙丁戊己庚辛壬癸', branches='子丑寅卯辰巳午未申酉戌亥';
const stemNames='갑을병정무기경신임계', branchNames='자축인묘진사오미신유술해';
const elements:Element[]=['목','화','토','금','수'];
const branchElements:Element[]=['수','토','목','목','토','화','화','토','금','금','토','수'];
// 본기 → 중기 → 여기 순서. 학파별 배속 순서 차이는 README 참고.
const hidden=['癸','己癸辛','甲丙戊','乙','戊乙癸','丙戊庚','丁己','己丁乙','庚壬戊','辛','戊辛丁','壬甲'];
export const REGIONS=['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'];
export function character(hanja:string):Character {
 const s=stems.indexOf(hanja), b=branches.indexOf(hanja);
 if(s<0 && b<0) throw new Error('지원하지 않는 간지');
 const i=s>=0?s:b;
 return {hanja,korean:(s>=0?stemNames:branchNames)[i],element:s>=0?elements[Math.floor(s/2)]:branchElements[b],polarity:i%2===0?'양':'음'};
}
export function tenGod(dayStem:string,target:string):string {
 const a=character(dayStem), b=character(target), delta=(elements.indexOf(b.element)-elements.indexOf(a.element)+5)%5, same=a.polarity===b.polarity;
 return [['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']][delta][same?0:1];
}
const pad=(n:number)=>String(n).padStart(2,'0');
export function calculateSaju(input:BirthInput):SajuResult {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) throw new Error('올바른 생년월일과 출생시간을 입력하세요.');
 if(!['solar','lunar'].includes(input.calendar)||!REGIONS.includes(input.region)||!['남성','여성','선택 안 함'].includes(input.gender)) throw new Error('지원하는 입력값을 선택하세요.');
 if(input.calendar==='solar'&&input.leapMonth) throw new Error('윤달은 음력에서만 선택할 수 있습니다.');
 const [y,m,d]=input.date.split('-').map(Number), [h,min]=input.time.split(':').map(Number), cal=new KoreanLunarCalendar();
 const valid=input.calendar==='solar'?cal.setSolarDate(y,m,d):cal.setLunarDate(y,m,d,input.leapMonth);
 if(!valid) throw new Error('존재하지 않는 날짜 또는 윤달입니다.');
 const solar=cal.getSolarCalendar();
 if(solar.year<1950||solar.year>2030) throw new Error('1차 버전은 양력 기준 1950~2030년 한국 출생만 지원합니다.');
 const clock=resolveKoreaTime(solar.year,solar.month,solar.day,h,min);
 const standard=clock.standard;
 const local=Solar.fromYmdHms(standard.getUTCFullYear(),standard.getUTCMonth()+1,standard.getUTCDate(),standard.getUTCHours(),standard.getUTCMinutes(),0).getLunar().getEightChar(); local.setSect(1);
 // 절기는 엔진의 UTC+8로 동일 순간을 변환. 당시 실제 UTC 오프셋을 반영합니다.
 const instant=new Date(clock.utc.getTime()+8*60*60000);
 const term=Solar.fromYmdHms(instant.getUTCFullYear(),instant.getUTCMonth()+1,instant.getUTCDate(),instant.getUTCHours(),instant.getUTCMinutes(),0).getLunar().getEightChar(); term.setSect(1);
 const dayStem=local.getDay()[0];
 const pairs=[term.getYear(),term.getMonth(),local.getDay(),local.getTime()];
 const keys=['year','month','day','hour'] as const, labels=['년주','월주','일주','시주'];
 const pillars:Pillar[]=pairs.map((pair,i)=>{
  const hs=[...hidden[branches.indexOf(pair[1])]].map(s=>({...character(s),tenGod:tenGod(dayStem,s)}));
  return {key:keys[i],label:labels[i],ganji:pair,stem:character(pair[0]),branch:character(pair[1]),stemTenGod:i===2?'일원':tenGod(dayStem,pair[0]),branchTenGod:hs[0].tenGod,hiddenStems:hs};
 });
 const counts:Record<Element,number>={목:0,화:0,토:0,금:0,수:0}; pillars.forEach(p=>{counts[p.stem.element]++;counts[p.branch.element]++;});
 return {schemaVersion:'1.0',input:{...input},solarDate:`${solar.year}-${pad(solar.month)}-${pad(solar.day)}`,lunarDate:cal.getLunarCalendar(),pillars,elementCounts:counts,calculation:{engine:'lunar-javascript@1.7.7 + korean-lunar-calendar@'+ '0.4.0',timezone:'Asia/Seoul (역사적 표준시·서머타임 반영)',utcOffsetMinutes:clock.offsetMinutes,dstCorrectionMinutes:clock.dstMinutes,standardTime:standard.toISOString().slice(0,16).replace('T',' '),timeZoneData:'IANA tzdb 2026b',yearBoundary:'입춘 절입 시각',monthBoundary:'12절 절입 시각',dayBoundary:'23:00 자시에서 다음 일주 (sect 1)',timeBasis:'출생 당시 표준시 (서머타임 제거) · 진태양시 보정 없음'},warnings:['절기 천문 모델은 lunar-javascript 기준입니다. KASI 절입 시각과의 독립 대조는 TODO이며 경계 근처 결과는 확인이 필요합니다.','출생지역은 기록용이며 경도·균시차 보정은 적용하지 않습니다.','오행 개수는 천간·지지 8글자 단순 집계이며 신강/신약·용신 판단이 아닙니다.']};
}
