import {useEffect,useRef,useState} from 'react';
import type {FullReport} from '../engine/fortuneTypes';
import {buildConsultation,CONSULTATION_TOPICS,consultationTopicForQuestion,consultationNeedsProfileChange} from '../interpretation/consultation';
import type {ConsultationTopic} from '../interpretation/consultation';
import {Grandma} from './Grandma';
export function Consultation({report,initialTopic='nature',onNewPerson,onEditProfile,onSave}:{report:FullReport;initialTopic?:ConsultationTopic;onNewPerson:()=>void;onEditProfile:()=>void;onSave:()=>void}){
 const [topic,setTopic]=useState<ConsultationTopic>(initialTopic),[step,setStep]=useState(0),[question,setQuestion]=useState(''),[asked,setAsked]=useState(''),[message,setMessage]=useState(''),[listening,setListening]=useState(false),[speechError,setSpeechError]=useState('');
 const replyEnd=useRef<HTMLDivElement>(null),wasRevealed=useRef(false),speaking=useRef<SpeechSynthesisUtterance|null>(null);
 const editingOwnProfile=/(?:생년월일|출생시간|출생시각|출생일|태어난.*(?:시각|시간|날짜)).*(?:바꾸|바꿔|변경|수정|고쳐)/.test(asked);
 const story=buildConsultation(report,topic),choice=CONSULTATION_TOPICS.find(t=>t.id===topic)!;
 const completed=step>=story.chapters.length;
 const speechAvailable=typeof window!=='undefined'&&'speechSynthesis'in window;
 useEffect(()=>{setTopic(initialTopic);setStep(0);setQuestion('');setAsked('');setMessage('');setSpeechError('');setListening(false);wasRevealed.current=false;return()=>{speaking.current=null;if('speechSynthesis'in window)window.speechSynthesis.cancel();};},[report,initialTopic]);
 useEffect(()=>{if(wasRevealed.current){replyEnd.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});}wasRevealed.current=false;},[step]);
 function stopVoice(){speaking.current=null;if(speechAvailable)window.speechSynthesis.cancel();setListening(false);}
 function selectTopic(next:ConsultationTopic,questionText=''){stopVoice();setTopic(next);setStep(0);setAsked(questionText);setMessage('');setSpeechError('');}
 function ask(event:React.FormEvent){event.preventDefault();const text=question.trim();if(!text)return;stopVoice();setAsked(text);setQuestion('');if(consultationNeedsProfileChange(text)){if(/(?:생년월일|출생시간|출생시각|출생일|태어난.*(?:시각|시간|날짜)).*(?:바꾸|바꿔|변경|수정|고쳐)/.test(text)){setMessage('출생정보가 바뀌면 사주를 다시 계산해야 해요. 입력 화면에서 확인한 날짜와 시각을 고친 뒤 다시 이야기 시작하기를 눌러주세요. 할매가 질문 속 날짜를 임의로 계산에 넣지는 않아요.');return;}setMessage('다른 분의 이야기는 그분의 사주가 있어야 살펴볼 수 있어요. 아래 ‘다른 사람 상담’을 눌러 출생정보를 바꿔주세요. 두 사람의 궁합 판정은 아직 준비 중이에요.');return;}const next=consultationTopicForQuestion(text);if(!next){setMessage('그 질문은 지금 계산한 자료만으로 답을 정하기 어려워요. 타고난 모습, 돈, 일, 관계, 오늘·올해·내년·대운 가운데 궁금한 주제를 골라주시면 차근차근 이야기해드릴게요.');return;}selectTopic(next,text);}
 function listen(){if(!speechAvailable)return;if(listening){stopVoice();return;}setSpeechError('');window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance([story.opening,...story.chapters.slice(0,step).map(c=>c.text),...(completed?[story.takeaway]:[])].join('\n'));utterance.lang='ko-KR';utterance.rate=.9;const voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('ko'));if(voice)utterance.voice=voice;utterance.onend=()=>{if(speaking.current===utterance){speaking.current=null;setListening(false);}};utterance.onerror=()=>{if(speaking.current!==utterance)return;speaking.current=null;setListening(false);setSpeechError('이 기기에서는 음성 읽기를 시작하지 못했어요. 글로 이야기를 이어서 볼 수 있어요.');};speaking.current=utterance;setListening(true);window.speechSynthesis.speak(utterance);}
 return <section className="consultation" id="consultation" aria-label="정원할매 상담" data-topic={topic}>
  <div className="consultation-head"><Grandma small/><div><span className="counselor-name">정원할매</span><h2>{report.natal.input.name?`${report.natal.input.name}님`:'당신'}의 사주 상담</h2><p>{report.natal.solarDate} · {report.natal.input.time} · {report.natal.input.region}</p></div><span className="consultation-mark">이야기 중</span></div>
  <div className="consultation-greeting"><p>어서 와요. 태어난 날과 시각으로 사주를 계산했어요.<br/>마음에 있는 주제를 골라봐요. 할매가 한 가지씩 풀어드릴게요.</p></div>
  <nav className="consultation-topics" aria-label="할매 상담 주제">{CONSULTATION_TOPICS.map(t=><button key={t.id} aria-pressed={topic===t.id} onClick={()=>selectTopic(t.id)}><span aria-hidden="true">{t.icon}</span>{t.label}</button>)}</nav>
  <div className="conversation" aria-live="polite" aria-relevant="additions text">
   <div className="user-bubble">{asked||choice.question}</div>
   {message?<div className="counselor-reply unsupported-reply"><Grandma small/><div className="speech-bubble" role="status"><p>{message}</p>{consultationNeedsProfileChange(asked)&&<button className="next-story" onClick={editingOwnProfile?onEditProfile:onNewPerson}>{editingOwnProfile?'출생정보 수정하기':'다른 사람 상담'}</button>}</div></div>:<>
    <div className="counselor-reply"><Grandma small/><article className="speech-bubble opening-bubble"><p className="story-eyebrow">할매가 들려주는 {choice.label.replace(' 이야기','')}</p><h3>{story.title}</h3><p>{story.opening}</p></article></div>
    {story.chapters.slice(0,step).map((chapter,i)=><div className="counselor-reply chapter-reply" key={`${topic}-${i}`}><span className="reply-dot" aria-hidden="true"/><article className="speech-bubble story-chapter"><span className="chapter-number">이야기 {String(i+1).padStart(2,'0')}</span><h4>{chapter.title}</h4><p>{chapter.text}</p></article></div>)}
    {completed&&<div className="counselor-reply takeaway-reply"><Grandma small/><article className="speech-bubble story-takeaway"><h4>할매가 남기는 한마디</h4><p>{story.takeaway}</p>{story.actions.length>0&&<div className="consultation-practice"><strong>오늘부터 해볼 작은 일</strong><ul>{story.actions.map((action,i)=><li key={i}>{action}</li>)}</ul></div>}</article></div>}
    <div className="story-controls">{!completed?<button className="next-story" onClick={()=>{wasRevealed.current=true;setStep(n=>n+1);}}>다음 이야기 듣기 <span aria-hidden="true">↓</span></button>:<button className="restart-story" onClick={()=>{stopVoice();setStep(0);}}>이 이야기 처음부터</button>}{!completed&&<button className="expand-story" onClick={()=>{wasRevealed.current=true;setStep(story.chapters.length);}}>전체 이야기 펼치기</button>}<span>{Math.min(step,story.chapters.length)} / {story.chapters.length}</span>{speechAvailable&&<button className="voice-story" onClick={listen}>{listening?'읽기 멈추기':'목소리로 읽기'}</button>}</div>
    <details className="consultation-evidence"><summary>이 이야기는 무엇을 보고 풀었나요?</summary><p>계산한 사주에 전통 규칙을 적용한 상담입니다.</p><ul>{story.evidence.map((fact,i)=><li key={i}>{fact}</li>)}</ul>{story.notes.map((note,i)=><p key={i}>{note}</p>)}</details>
   </>}
   <div ref={replyEnd}/>
  </div>
  {speechError&&<p className="speech-error" role="status">{speechError}</p>}
  <form className="consultation-question" onSubmit={ask}><label htmlFor="consult-question">다른 이야기도 궁금한가요?</label><div><input id="consult-question" aria-label="할매에게 물어볼 이야기" placeholder="예: 돈을 어떻게 관리하면 좋을까요?" maxLength={240} value={question} onChange={e=>setQuestion(e.target.value)}/><button type="submit" disabled={!question.trim()} aria-label="질문 보내기">↗</button></div><p>질문에서 상담 주제를 찾아드려요. 입력 내용은 서버로 보내지 않아요.</p></form>
  <div className="consultation-footer"><button onClick={onNewPerson}>다른 사람 상담</button><button onClick={onSave}>내 리포트 저장</button><span>계산에 근거한 전통 규칙 풀이</span></div>
 </section>;
}
