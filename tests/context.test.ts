import {describe,it,expect} from 'vitest';
import {calculateSaju} from '../src/engine/calculate';
import {calculateFortune} from '../src/engine/fortune';
import type {BirthInput} from '../src/engine/types';
import type {FullReport} from '../src/engine/fortuneTypes';
import {interpretReport} from '../src/interpretation/readings';
import {buildReadingContext} from '../src/interpretation/context';

const input:BirthInput={name:'검증',gender:'남성',calendar:'solar',date:'1988-01-03',time:'12:00',region:'서울',leapMonth:false};
function report(date='2026-10-08',year=2026,patch:Partial<BirthInput>={}):FullReport{
  const natal=calculateSaju({...input,...patch}),fortune=calculateFortune(natal,year,date);
  return {schemaVersion:'2.0',natal,fortune,interpretation:interpretReport(natal,fortune)};
}

describe('명리 풀이의 실제 원국·운 관계',()=>{
  it('일간 丁과 일진 乙卯를 명시하고 천간·지지 본기 십성을 구분한다',()=>{
    const context=buildReadingContext(report(),'daily');
    expect(context.dayMaster).toMatchObject({hanja:'丁',korean:'정',element:'화',polarity:'음'});
    expect(context.period).toMatchObject({ganji:'乙卯',korean:'을묘',stemTenGod:'편인',branchTenGod:'편인',branchMainStem:{hanja:'乙'}});
    expect(context.themes.find(t=>t.code==='천간:편인')?.facts[0]).toContain('천간 乙(을)');
    expect(context.themes.find(t=>t.code==='지지본기:편인')?.facts[0]).toContain('지지 卯(묘)의 본기 乙');
    expect(context.period?.startDate).toBe('2026-10-07 23:00:00');
    expect(context.period?.endDate).toBe('2026-10-08 23:00:00');
  });
  it('같은 일진이라도 戊 일간에게는 정관이며 생극은 목극토다',()=>{
    const context=buildReadingContext(report('2026-10-08',2026,{date:'1988-01-04'}),'daily');
    expect(context.dayMaster.hanja).toBe('戊');
    expect(context.period).toMatchObject({ganji:'乙卯',stemTenGod:'정관',branchTenGod:'정관'});
    expect(context.themes.find(t=>t.category==='생극'&&t.code.endsWith('목극토'))?.facts[0]).toContain('일간을 극하는 오행');
    expect(context.themes.find(t=>t.code==='천간:정관')?.interpretation).toContain('음양이 다릅니다');
  });
  it('같은 丁 일간이라도 원국 월지가 子와 寅이면 개인별 자묘형 관계가 달라진다',()=>{
    const a=buildReadingContext(report(),'daily'),b=buildReadingContext(report('2026-10-08',2026,{date:'1988-03-03'}),'daily');
    expect(a.dayMaster.hanja).toBe(b.dayMaster.hanja);
    expect(a.period?.ganji).toBe(b.period?.ganji);
    const month=a.natalLinks.find(r=>r.natalKey==='month'&&r.type==='형');
    expect(month).toMatchObject({name:'자묘형',natalLabel:'월주',palace:'월주 · 사회생활과 일의 환경'});
    expect(month?.facts[0]).toBe('월주 지지 子(자)와 2026-10-08 일진 지지 卯(묘)의 자묘형');
    expect(b.natalLinks.some(r=>r.natalKey==='month'&&r.type==='형')).toBe(false);
    expect(a.natalLinks).not.toEqual(b.natalLinks);
  });
  it('년주·월주·일주·시주의 글자를 실제 출처로 보존한다',()=>{
    const r=report(),context=buildReadingContext(r,'daily');
    for(const link of context.natalLinks){
      const pillar=r.natal.pillars.find(p=>p.key===link.natalKey)!;
      expect(link.natalLabel).toBe(pillar.label);
      expect(link.pair[0]).toBe(link.type==='천간합'?pillar.stem.hanja:pillar.branch.hanja);
      expect(link.pair[1]).toBe(link.type==='천간합'?context.period!.stem.hanja:context.period!.branch.hanja);
    }
    expect(context.natalLinks.find(r=>r.natalKey==='hour'&&r.type==='파')?.name).toBe('묘오파');
  });
  it('오행 생은 丁 일간에 오는 乙의 목생화 관계이며 희기를 붙이지 않는다',()=>{
    const context=buildReadingContext(report(),'daily'),theme=context.themes.find(t=>t.category==='생극'&&t.code.endsWith('목생화'))!;
    expect(theme.facts[0]).toContain('일간 丁(화)');
    expect(theme.facts[0]).toContain('천간 乙(목)');
    expect(theme.interpretation).toContain('인성');
    expect(theme.cautions.join(' ')).toContain('희기');
    expect(Object.keys(context)).not.toContain('score');
    expect(Object.keys(context)).not.toContain('yongsin');
  });
  it('2026 丙午 세운의 천간 겁재와 午 본기 丁 비견을 섞지 않는다',()=>{
    const context=buildReadingContext(report(),'annual');
    expect(context.period).toMatchObject({ganji:'丙午',stemTenGod:'겁재',branchTenGod:'비견',branchMainStem:{hanja:'丁',polarity:'음'}});
    expect(context.themes.find(t=>t.code==='지지본기:비견')?.facts[0]).toContain('본기 丁');
  });
  it('성별 미선택은 현재 대운을 만들지 않되 일진·절기 연월은 유지한다',()=>{
    const r=report('2026-10-08',2026,{gender:'선택 안 함'}),context=buildReadingContext(r,'cycles');
    expect(context.availability).toBe('gender_required');
    expect(context.period).toBeNull();expect(context.background.currentDaeyun).toBeNull();
    expect(context.background.currentSolarYear?.ganji).toBe('丙午');
    expect(context.background.currentSolarMonth?.ganji).toBe('丁酉');
    expect(context.themes).toEqual([]);
  });
  it('출생 전에는 개인 운 해석을 생성하지 않는다',()=>{
    const context=buildReadingContext(report('2026-10-08',2026,{date:'2030-07-12'}),'daily');
    expect(context.availability).toBe('before_birth');expect(context.themes).toEqual([]);
    expect(context.cautions.join(' ')).toContain('출생 전');
  });
  it('계산된 원국·운·리포트를 바꾸지 않으며 JSON으로 보존된다',()=>{
    const r=report(),before=JSON.stringify(r),a=buildReadingContext(r,'daily'),b=buildReadingContext(r,'daily');
    expect(JSON.stringify(r)).toBe(before);expect(a).toEqual(b);expect(JSON.parse(JSON.stringify(a))).toEqual(a);
  });
});

describe('현재 절기 연월과 선택 조회연도의 분리',()=>{
  it('2026년 1월은 입춘 전 乙巳 세운과 己丑 월운이다',()=>{
    const r=report('2026-01-15',2030),context=buildReadingContext(r,'daily');
    expect(r.fortune.annual[0].ganji).toBe('庚戌');
    expect(r.fortune.calendar).toMatchObject({at:'2026-01-15 12:00:00',annual:{year:2025,ganji:'乙巳'},month:{ganji:'己丑',term:'소한'}});
    expect(context.background.currentSolarYear?.ganji).toBe('乙巳');
    expect(context.background.currentSolarMonth?.ganji).toBe('己丑');
    expect(context.evidence.some(t=>t.startsWith('2030년 세운'))).toBe(false);
  });
  it('입춘 2026-02-04 정오부터 丙午와 庚寅, 전날은 乙巳와 己丑이다',()=>{
    const before=report('2026-02-03').fortune.calendar,after=report('2026-02-04').fortune.calendar;
    expect(before.annual.ganji).toBe('乙巳');expect(before.month.ganji).toBe('己丑');
    expect(after.annual.ganji).toBe('丙午');expect(after.month.ganji).toBe('庚寅');
    expect(after.annual.startDate).toBe('2026-02-04 05:02:08');
    expect(after.month.startDate).toBe(after.annual.startDate);
  });
  it('한로 2026-10-08 15:29:17 이전 정오는 丁酉, 다음날 정오는 戊戌이다',()=>{
    const before=report('2026-10-08').fortune.calendar,after=report('2026-10-09').fortune.calendar;
    expect(before.month).toMatchObject({ganji:'丁酉',term:'백로',endDate:'2026-10-08 15:29:17'});
    expect(after.month).toMatchObject({ganji:'戊戌',term:'한로',startDate:'2026-10-08 15:29:17'});
  });
  it('지원 첫해 1950년 1월도 1949 己丑 세운의 범위로 계산한다',()=>{
    const c=report('1950-01-15',1950,{date:'1950-01-01'}).fortune.calendar;
    expect(c.annual).toMatchObject({year:1949,ganji:'己丑'});
    expect(c.month).toMatchObject({ganji:'丁丑',term:'소한'});
    expect(c.at>=c.month.startDate&&c.at<c.month.endDate).toBe(true);
  });
  it('미래 조회연도 대운은 그해 7월 기준으로 따로 찾고 실제 현재 대운을 섞지 않는다',()=>{
    const context=buildReadingContext(report('2026-10-08',2060,{date:'1988-07-12'}),'annual');
    expect(context.period?.label).toBe('2060년 세운');
    expect(context.background.currentDaeyun).not.toBeNull();
    expect(context.background.queriedYearDaeyun?.label).toContain('2060년 7월 1일 기준');
    expect(context.background.queriedYearDaeyun?.ganji).not.toBe(context.background.currentDaeyun?.ganji);
    const themes=context.themes.filter(t=>t.category==='배경흐름');
    expect(themes).toHaveLength(1);expect(themes[0].facts[0]).toContain('2060년 7월 1일');
    expect(themes[0].interpretation).not.toContain('2026-10-08');
  });
});
