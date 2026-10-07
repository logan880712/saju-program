import {describe,it,expect} from 'vitest';
import {calculateSaju} from '../src/engine/calculate';
import {calculateNatalProfile} from '../src/engine/profile';
import {calculateFortune,calculateCalendarDay} from '../src/engine/fortune';
import {interpretReport} from '../src/interpretation/readings';
import {pairRelations} from '../src/engine/relations';
import type {BirthInput} from '../src/engine/types';
const base:BirthInput={name:'테스트',gender:'선택 안 함',calendar:'solar',date:'1988-01-03',time:'12:00',region:'서울',leapMonth:false};
const report=(date=base.date)=>{const n=calculateSaju({...base,date}),f=calculateFortune(n,2026,'2026-10-07');return {n,f,r:interpretReport(n,f)};};
describe('본문 풀이의 구조 자료와 지장간 보완',()=>{
 it('1988-01-03: 표면 식상 0이어도 사·오의 지장간 무·기를 놓치지 않음',()=>{const {n,f,r}=report();expect(n.pillars[2].stem.hanja).toBe('丁');expect(f.profile.groups.식상.visible).toHaveLength(0);expect(f.profile.groups.식상.hidden.map(s=>s.hanja)).toEqual(['戊','己']);const wealth=r.sections.find(s=>s.id==='wealth')!;expect(wealth.evidence).toContain('일주 지장간 戊: 상관');expect(wealth.evidence).toContain('시주 지장간 己: 식신');expect(wealth.paragraphs.join(' ')).not.toContain('식상은 지장간까지 살펴봐도 없어요');});
 it('계절과 월지 본기는 실제 계산 결과에서 읽음',()=>{const {n,f,r}=report();expect(f.profile.season).toBe('겨울');expect(f.profile.monthBranch).toBe('子');expect(f.profile.monthMainGod).toBe(n.pillars[1].branchTenGod);expect(r.sections[0].paragraphs.join(' ')).toContain('겨울');expect(r.sections.find(s=>s.id==='career')!.subtitle).toContain(n.pillars[1].branchTenGod);});
 it('뿌리는 일간 동오행의 실제 지장간만 포함',()=>{const {n,f}=report();for(const root of f.profile.roots){const pillar=n.pillars.find(p=>p.label===root.position)!;for(const stem of root.stems)expect(pillar.hiddenStems.find(s=>s.hanja===stem)!.element).toBe(n.pillars[2].stem.element);}expect(f.profile.roots.map(p=>p.branch)).toEqual(['巳','午']);});
 it('같은 일간이어도 월지·지장간이 다르면 본문이 달라짐',()=>{const a=report(),b=report('1988-03-03');expect(a.n.pillars[2].stem.hanja).toBe(b.n.pillars[2].stem.hanja);expect(a.f.profile.season).not.toBe(b.f.profile.season);expect(a.r.sections[0].paragraphs).not.toEqual(b.r.sections[0].paragraphs);});
 it('진진 자형에 삼형 설명을 붙이지 않음',()=>{const r=pairRelations('甲辰','乙辰','년주','일주').find(r=>r.type==='형')!;expect(r.description).toContain('자형');expect(r.description).not.toContain('삼형');});
 it('해석 한계는 본문 대신 별도의 notes로 제공',()=>{const {r}=report();expect(r.sections[0].notes?.join(' ')).toContain('신강');expect(r.sections[0].paragraphs.join(' ')).not.toContain('미구현');expect(r.sections[5].paragraphs.join(' ')).not.toContain('계산하지');});
 it('구조 자료는 원국을 바꾸지 않고 강도·용신 점수를 만들지 않음',()=>{const {n}=report(),before=JSON.stringify(n),p=calculateNatalProfile(n);expect(JSON.stringify(n)).toBe(before);expect(Object.keys(p)).not.toContain('strength');expect(Object.keys(p)).not.toContain('yongsin');});
});
describe('출생정보 없는 공통 일진은 개인 십성을 만들지 않음',()=>{
 it('공통 일진은 개인별 계산의 날짜 간지와 동일',()=>{const common=calculateCalendarDay('2026-10-07');expect(common.ganji).toBe(report().f.daily.ganji);expect(Object.keys(common)).not.toContain('stemTenGod');});
 it('공통 날짜 계산도 존재하지 않는 날짜 거부',()=>expect(()=>calculateCalendarDay('2026-02-30')).toThrow());
 it('사람이 바뀌면 같은 날짜에도 개인 십성과 풀이 근거가 달라짐',()=>{const a=report(),b=report('1988-01-04');expect(a.f.daily.ganji).toBe(b.f.daily.ganji);expect(a.f.daily.stemTenGod).not.toBe(b.f.daily.stemTenGod);expect(a.r.daily.paragraphs).not.toEqual(b.r.daily.paragraphs);});
});
