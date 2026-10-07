import {useState} from 'react';
import {calculateCalendarDay} from '../engine/fortune';
const dayThemes:Record<string,{title:string;text:string;action:string}>={
 목:{title:'계획을 세우고 연결을 넓히는 하루',text:'목은 새순이 자라는 나무에 빗대어 읽어요. 오늘의 공통 일진을 보며, 작은 씨앗 하나를 심듯 시작할 일의 방향과 이어갈 인연을 생각해보세요.',action:'새로 시작할 일 하나와 이어갈 관계 하나를 골라보세요.'},
 화:{title:'생각을 표현하고 서로 확인하는 하루',text:'화는 방 안을 밝히는 불빛에 빗대어 읽어요. 생각을 마음에만 두기보다 따뜻한 말로 꺼내보고, 상대에게 어떻게 전해졌는지도 한번 들어보세요.',action:'중요한 대화는 결론과 이유를 함께 전달해보세요.'},
 토:{title:'진행한 일을 정리하고 기반을 다지는 하루',text:'토는 여러 식구가 기대어 사는 집의 터에 빗대어 읽어요. 여기저기 벌여둔 일을 하나씩 챙기고, 오래 이어갈 생활의 기준을 다져보세요.',action:'미뤄둔 정리 한 가지를 마치고 다음 일정의 기준을 정해보세요.'},
 금:{title:'선택의 기준을 분명히 하는 하루',text:'금은 바느질을 마친 뒤 실 끝을 가지런히 정리하는 모습에 빗대어 읽어요. 무엇을 남기고 무엇을 마무리할지, 선택의 기준을 한 가지씩 정해보세요.',action:'선택지의 장단점을 적고 마무리할 일 하나를 골라보세요.'},
 수:{title:'정보를 살피고 여유 있게 연결하는 하루',text:'수는 길을 따라 천천히 흐르는 물에 빗대어 읽어요. 서둘러 결론을 내리기보다 필요한 이야기를 모으고, 앞뒤 사정을 살펴볼 여유를 가져보세요.',action:'결정에 필요한 정보를 확인하고 생각을 정리할 시간을 확보해보세요.'},
};
export function DailyHub({date,onPersonal,initialOpen=false}:{date:string;onPersonal:()=>void;initialOpen?:boolean}){
 const [open,setOpen]=useState(initialOpen),day=calculateCalendarDay(date),theme=dayThemes[day.stem.element];
 return <section className="daily-hub" aria-label="첫 화면 오늘 운세"><div className="daily-hub-top"><div><p className="eyebrow">{date} · 오늘의 일진</p><h2>오늘의 운세, 바로 확인하세요</h2><p>공통 흐름은 입력 없이, 개인 운세는 누구의 출생정보든 입력해서 볼 수 있습니다.</p></div><span className={'daily-ganji '+day.stem.element}>{day.ganji}<small>{day.stem.korean}{day.branch.korean}일</small></span></div><div className="daily-hub-actions"><button onClick={()=>setOpen(v=>!v)} aria-expanded={open}>{open?'공통 일진 접기':'입력 없이 오늘의 공통 흐름 보기'}</button><button className="daily-personal" onClick={onPersonal}>개인별 오늘 운세 바로 보기 →</button></div>{open&&<div className="common-daily"><span className="common-label">공통 일진 · 개인별 운세 아님</span><h3>{theme.title}</h3><p>{theme.text}</p><div className="practice">{theme.action}</div><details><summary>공통 흐름의 계산 근거</summary><p>{day.ganji} · 천간 {day.stem.polarity}{day.stem.element} · 지지 {day.branch.polarity}{day.branch.element}</p><p>{day.timeBasis}. 공통 흐름은 일진 오행의 전통 상징이며 개인의 길흉이나 십성은 출생정보를 입력한 뒤 계산합니다.</p></details></div>}</section>;
}
