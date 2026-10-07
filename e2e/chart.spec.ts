import {test,expect} from '@playwright/test';
import {openFullReport} from './helpers';
test('출생정보 → 원국 → JSON 다운로드',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByLabel('이름').fill('테스트');await page.getByLabel('생년월일').fill('2024-02-10');await page.getByLabel('출생시간').fill('12:00');
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기'}).click();
 await openFullReport(page);
 await expect(page.getByRole('heading',{name:'테스트의 만세력'})).toBeVisible();
 const table=page.getByRole('table');await expect(table).toBeVisible();
 await expect(table.getByRole('columnheader')).toHaveCount(5);
 const hour=await table.getByRole('columnheader',{name:'시주',exact:true}).boundingBox();expect(hour).not.toBeNull();expect(hour!.x+hour!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
 await expect(table.getByText('甲',{exact:true})).toHaveCount(2);
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'JSON 저장'}).click();
 expect((await downloadPromise).suggestedFilename()).toBe('saju-chart.json');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);expect(errors).toEqual([]);
 await page.getByLabel('생년월일').fill('1949-01-01');await page.getByLabel('출생시간').fill('12:00');await page.getByRole('button',{name:'할매에게 사주 이야기 듣기'}).click();await expect(page.getByRole('alert')).toContainText('1950');await expect(table).toHaveCount(0);
});
test('음력 윤달 입력',async({page})=>{await page.goto('/');await page.getByRole('radio',{name:'음력',exact:true}).check();await page.getByLabel('생년월일').fill('2023-02-01');await page.getByLabel('출생시간').fill('12:00');await page.getByLabel('윤달에 태어났어요').check();await page.getByRole('button',{name:'할매에게 사주 이야기 듣기'}).click();await openFullReport(page);await expect(page.locator('#report-anchor').getByText('양력 2023-03-22',{exact:false})).toBeVisible();});

test('1988년 출생 입력 허용',async({page})=>{await page.goto('/');await page.getByLabel('생년월일').fill('1988-07-12');await page.getByLabel('출생시간').fill('12:00');await page.getByRole('button',{name:'할매에게 사주 이야기 듣기'}).click();await openFullReport(page);await expect(page.getByRole('table')).toBeVisible();await page.locator('#report-anchor').getByText('계산 기준과 확인할 사항',{exact:true}).click();await expect(page.locator('#report-anchor').getByText('보정된 표준시: 1988-07-12 11:00',{exact:true})).toBeVisible();await expect(page.getByRole('alert')).toHaveCount(0);});
