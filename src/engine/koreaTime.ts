// Asia/Seoul transitions for 1950–2030. IANA tzdb 2026b, asia: ROK rules / Asia/Seoul zone.
// https://data.iana.org/time-zones/releases/tzdata2026b.tar.gz
// UTC instant, total offset minutes, daylight-saving minutes.
const changes:[string,number,number][]=[
 ['1950-03-31T15:00:00Z',600,60],['1950-09-09T14:00:00Z',540,0],
 ['1951-05-05T15:00:00Z',600,60],['1951-09-08T14:00:00Z',540,0],
 ['1954-03-20T15:00:00Z',510,0],
 ['1955-05-04T15:30:00Z',570,60],['1955-09-08T14:30:00Z',510,0],
 ['1956-05-19T15:30:00Z',570,60],['1956-09-29T14:30:00Z',510,0],
 ['1957-05-04T15:30:00Z',570,60],['1957-09-21T14:30:00Z',510,0],
 ['1958-05-03T15:30:00Z',570,60],['1958-09-20T14:30:00Z',510,0],
 ['1959-05-02T15:30:00Z',570,60],['1959-09-19T14:30:00Z',510,0],
 ['1960-04-30T15:30:00Z',570,60],['1960-09-17T14:30:00Z',510,0],
 ['1961-08-09T15:30:00Z',540,0],
 ['1987-05-09T17:00:00Z',600,60],['1987-10-10T17:00:00Z',540,0],
 ['1988-05-07T17:00:00Z',600,60],['1988-10-08T17:00:00Z',540,0],
];
const transitions=changes.map(([date,offset,dst])=>({at:Date.parse(date),offset,dst}));
function stateAt(utc:number){
 let state={offset:540,dst:0};
 for(const t of transitions){if(utc<t.at)break;state=t;}
 return state;
}
/** Input is the wall-clock time recorded at birth. Never guess a repeated/skipped time. */
export function resolveKoreaTime(year:number,month:number,day:number,hour:number,minute:number){
 const wall=Date.UTC(year,month-1,day,hour,minute);
 const candidates=[510,540,570,600].flatMap(offset=>{
  const utc=wall-offset*60000, state=stateAt(utc);
  return state.offset===offset?[{utc,...state}]:[];
 });
 if(candidates.length===0)throw new Error('표준시·서머타임 전환으로 존재하지 않는 출생시각입니다. 출생기록을 확인하세요.');
 if(candidates.length>1)throw new Error('표준시·서머타임 종료로 두 번 존재하는 출생시각입니다. 어느 시각인지 구분하는 기능은 TODO입니다.');
 const chosen=candidates[0];
 // 사주 일주/시주는 출생 당시 표준시를 사용하고 서머타임만 제거합니다.
 return {utc:new Date(chosen.utc),standard:new Date(wall-chosen.dst*60000),offsetMinutes:chosen.offset,dstMinutes:chosen.dst};
}
/** UTC instant to historical Korean standard time; daylight saving is removed. */
export function koreanStandardAt(utc:number):number{const s=stateAt(utc);return utc+(s.offset-s.dst)*60000;}
