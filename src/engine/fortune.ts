import {calculateNatalProfile} from './profile';
import {Solar} from 'lunar-javascript';
import type {SolarDate} from 'lunar-javascript';
import type {SajuResult} from './types';
import type {AnnualLuck,FortuneData,LuckPillar,LuckPeriod,MonthLuck} from './fortuneTypes';
import {koreanStandardAt,resolveKoreaTime} from './koreaTime';
import {character,tenGod} from './calculate';
import {natalRelations,pairRelations} from './relations';
const mainHidden:Record<string,string>={子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'};
export function luckPillar(ganji:string,dayStem:string):LuckPillar{return {ganji,stem:character(ganji[0]),branch:character(ganji[1]),stemTenGod:tenGod(dayStem,ganji[0]),branchTenGod:tenGod(dayStem,mainHidden[ganji[1]])};}
export function seoulToday(now=new Date()):string{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>parts.find(p=>p.type===k)!.value).join('-');}
function timestamp(s:SolarDate):number{return Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond());}
function fromDate(d:Date):SolarDate{return Solar.fromYmdHms(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds());}
function text(ms:number):string{return new Date(ms).toISOString().slice(0,19).replace('T',' ');}
// Engine timestamps are civil UTC+8. Report terms in modern KST (UTC+9).
const termNames=['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
const termKorean=['입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설','소한'];
export function calculateFortune(natal:SajuResult,year:number,referenceDate=seoulToday()):FortuneData{
 if(!Number.isInteger(year)||year<1950||year>2130)throw new Error('운세 조회 연도는 1950~2130년을 선택하세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(referenceDate))throw new Error('조회 날짜를 확인하세요.');
 const [ry,rm,rd]=referenceDate.split('-').map(Number),check=new Date(Date.UTC(ry,rm-1,rd));
 if(check.toISOString().slice(0,10)!==referenceDate||ry<1950||ry>2130)throw new Error('조회 날짜는 1950~2130년의 실제 날짜여야 합니다.');
 const dayStem=natal.pillars[2].stem.hanja;
 const relations=(ganji:string,label:string)=>natal.pillars.flatMap(p=>pairRelations(p.ganji,ganji,p.label,label));
 const table=(y:number)=>Solar.fromYmdHms(y,7,1,12,0,0).getLunar().getJieQiTable();
 const termAt=(y:number,key:string)=>{const s=table(y)[key];if(!s||s.getYear()!==y)throw new Error('절기 자료를 찾을 수 없습니다.');return timestamp(s);};
 const annual:AnnualLuck[]=[year,year+1].map(y=>{
  const ganji=Solar.fromYmdHms(y,7,1,12,0,0).getLunar().getEightChar().getYear();
  return {...luckPillar(ganji,dayStem),year:y,startDate:text(koreanStandardAt(termAt(y,'立春')-8*3600000)),endDate:text(koreanStandardAt(termAt(y+1,'立春')-8*3600000)),relations:relations(ganji,`${y}년`),cycleRelations:[]};
 });
 const starts=termNames.map((name,i)=>termAt(i===11?year+1:year,name));starts.push(termAt(year+1,'立春'));
 const months:MonthLuck[]=starts.slice(0,12).map((start,i)=>{
  const ganji=fromDate(new Date(start+60000)).getLunar().getEightChar().getMonth();
  return {...luckPillar(ganji,dayStem),index:i,term:termKorean[i],startDate:text(koreanStandardAt(start-8*3600000)),endDate:text(koreanStandardAt(starts[i+1]-8*3600000)),relations:relations(ganji,`${termKorean[i]} 월운`)};
 });
 // Daily lookup is the civil day's noon: 23:00 boundary is documented separately.
 const dailyChar=Solar.fromYmdHms(ry,rm,rd,12,0,0).getLunar().getEightChar();dailyChar.setSect(1);
 const dailyGanji=dailyChar.getDay();
 let cycles:FortuneData['cycles']={status:'gender_required',periods:[],note:'전통 대운 순역은 년간 음양과 성별을 사용합니다. 성별을 선택하면 대운을 계산하며 선택하지 않은 경우 추측하지 않습니다.'};
 if(natal.input.gender!=='선택 안 함'){
  const [y,m,d]=natal.solarDate.split('-').map(Number),[h,min]=natal.input.time.split(':').map(Number);
  const birthUtc=Date.UTC(y,m-1,d,h,min)-natal.calculation.utcOffsetMinutes*60000;
  const termBirth=fromDate(new Date(birthUtc+8*3600000)).getLunar().getEightChar();termBirth.setSect(1);
  const yun=termBirth.getYun(natal.input.gender==='남성'?1:0,2);
  // Use engine's calendar-based onset; never turn the placeholder pre-onset period into a daeyun.
  const onset=yun.getStartSolar(), periods:LuckPeriod[]=yun.getDaYun(11).slice(1).map((cycle,i)=>{
   const start=timestamp(onset.nextYear(i*10)),end=timestamp(onset.nextYear((i+1)*10));
   const actualNow=ry<=2030?resolveKoreaTime(ry,rm,rd,12,0).utc.getTime():Date.UTC(ry,rm-1,rd,12)-9*3600000;
   const ganji=cycle.getGanZhi();
   return {...luckPillar(ganji,dayStem),index:i+1,startDate:text(koreanStandardAt(start-8*3600000)),endDate:text(koreanStandardAt(end-8*3600000)),approxAge:yun.getStartYear()+i*10,active:actualNow>=start-8*3600000&&actualNow<end-8*3600000,relations:relations(ganji,`${i+1}대운`)};
  });
  cycles={status:'calculated',direction:yun.isForward()?'순행':'역행',startAge:{years:yun.getStartYear(),months:yun.getStartMonth(),days:yun.getStartDay(),hours:yun.getStartHour()},startDate:periods[0].startDate,periods,note:'양남·음녀 순행 / 음남·양녀 역행. 인접 절까지의 차이를 3일=1년으로 환산하는 분 단위 기산법(sect 2)입니다. 시작일은 엔진 기산값을 서머타임을 제거한 역사적 한국 표준시로 표시한 값이며 학파별 기산법·반올림에 따라 달라질 수 있습니다. 나이는 대운 개시까지의 경과연수를 약식 표시합니다.'};
 }
 annual.forEach(a=>{const midpoint=`${a.year}-07-01 12:00:00`;const cycle=cycles.periods.find(p=>midpoint>=p.startDate&&midpoint<p.endDate);if(cycle)a.cycleRelations=pairRelations(cycle.ganji,a.ganji,`${a.year}년 7월 기준 대운`,`${a.year}년`);});
 return {profile:calculateNatalProfile(natal),referenceDate,referenceYear:year,cycles,annual,months,daily:{...luckPillar(dailyGanji,dayStem),date:referenceDate,relations:relations(dailyGanji,'일진')},natalRelations:natalRelations(natal.pillars),methods:['연운은 양력 1월 1일이 아닌 입춘부터 다음 입춘까지입니다.','월운은 12절의 실제 절입 시각으로 구분하며 음력 월·달력 월과 다릅니다.','일진은 선택 날짜의 한국 표준시 정오 기준입니다. 23시 이후는 다음 일진으로 봅니다.','합·충·형·파·해는 쌍별 배속을 표시합니다. 합화·삼합·삼형 완성 및 길흉의 강도는 판정하지 않습니다.','대운 시작 전 또는 10개 대운 범위 밖에는 현재 대운을 표시하지 않습니다.']};
}
/** Common calendar day only: no invented personal ten-gods without a birth chart. */
export function calculateCalendarDay(date=seoulToday()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('올바른 조회 날짜를 입력하세요.');
 const [y,m,d]=date.split('-').map(Number),check=new Date(Date.UTC(y,m-1,d));
 if(y<1950||y>2130||check.toISOString().slice(0,10)!==date)throw new Error('조회 날짜를 확인하세요.');
 const chart=Solar.fromYmdHms(y,m,d,12,0,0).getLunar().getEightChar();chart.setSect(1);
 const ganji=chart.getDay();return {date,ganji,stem:character(ganji[0]),branch:character(ganji[1]),timeBasis:'한국 날짜 정오 일진 · 23시부터 다음 일진'};
}
