import {test,expect} from '@playwright/test';
import {openFullReport} from './helpers';

for(const [digits,canonical] of [['19500101','1950-01-01'],['19880712','1988-07-12'],['20301231','2030-12-31']]){
 test(`숫자로 ${digits} 입력하면 ${canonical} 출생 원국 계산`,async({page})=>{
  await page.goto('/');
  const date=page.getByLabel('생년월일');
  await expect(date).toHaveAttribute('type','text');await expect(date).toHaveAttribute('inputmode','numeric');
  await date.fill(digits);await page.getByLabel('출생시간').fill('12:00');
  await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
  await expect(page.getByRole('region',{name:'정원할매 상담'})).toBeVisible();await expect(date).toHaveValue(digits);
  await openFullReport(page);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'리포트 저장',exact:true}).click();
  const fs=await import('node:fs/promises'),report=JSON.parse(await fs.readFile((await (await download).path())!,'utf8'));
  expect(report.natal.input.date).toBe(canonical);expect(report.natal.solarDate).toBe(canonical);
 });
}

test('부분 입력은 그대로 남기고 예전 원국을 계산에 재사용하지 않음',async({page})=>{
 await page.setViewportSize({width:320,height:844});await page.goto('/');
 const date=page.getByLabel('생년월일'),consultation=page.getByRole('region',{name:'정원할매 상담'});
 await date.fill('19880712');await page.getByLabel('출생시간').fill('12:00');
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();await expect(consultation).toBeVisible();
 await date.fill('1988');await expect(date).toHaveValue('1988');await expect(consultation).toHaveCount(0);
 await page.getByRole('button',{name:'개인별 오늘 운세 바로 보기 →',exact:true}).click();await expect(consultation).toHaveCount(0);
 await page.getByRole('button',{name:'오늘 운세 바로 보기',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('연도 4자리');await expect(date).toHaveValue('1988');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'다른 사람 입력',exact:true}).click();await expect(date).toHaveValue('');
});

test('숫자로 입력한 한국 음력과 윤달 날짜는 음력 엔진으로 검증',async({page})=>{
 await page.goto('/');await page.getByRole('radio',{name:'음력',exact:true}).check();
 const date=page.getByLabel('생년월일'),consultation=page.getByRole('region',{name:'정원할매 상담'});
 await date.fill('20230230');await page.getByLabel('출생시간').fill('12:00');
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 await expect(consultation).toContainText('2023-03-21');
 await page.getByLabel('윤달에 태어났어요').check();
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('존재하지 않는 날짜 또는 윤달');await expect(consultation).toHaveCount(0);
 await date.fill('20230201');await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 await expect(consultation).toContainText('2023-03-22');
 await page.getByRole('radio',{name:'양력',exact:true}).check();await date.fill('20230229');
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('존재하지 않는 날짜');await expect(consultation).toHaveCount(0);
});

test('저장한 표준 날짜를 숫자 입력칸에 복원하고 다른 사람은 빈칸으로 시작',async({page})=>{
 await page.goto('/');const date=page.getByLabel('생년월일');
 await date.fill('19880712');await page.getByLabel('출생시간').fill('12:00');await page.getByLabel('이 기기에 출생정보 저장').check();
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('출생정보를 저장');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('saju-garden-birth-v1')!).date)).toBe('1988-07-12');
 await page.reload();await expect(date).toHaveValue('');await page.getByRole('button',{name:'저장한 정보 불러오기',exact:true}).click();
 await expect(date).toHaveValue('19880712');await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 await expect(page.getByRole('region',{name:'정원할매 상담'})).toContainText('1988-07-12');
 await date.fill('1988');await page.getByRole('button',{name:'저장한 정보 불러오기',exact:true}).click();await expect(date).toHaveValue('19880712');
 await page.getByRole('button',{name:'다른 사람 입력',exact:true}).click();await expect(date).toHaveValue('');
});
