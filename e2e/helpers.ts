import {expect,type Page} from '@playwright/test';

/** Detailed calculations remain available below the default consultation. */
export async function openFullReport(page:Page){
 const details=page.locator('#report-anchor .full-report-details');
 await expect(details).toBeVisible();
 if(!await details.evaluate(element=>(element as HTMLDetailsElement).open)){
  await details.getByText('상세 만세력·리포트 보기',{exact:true}).click();
 }
}
