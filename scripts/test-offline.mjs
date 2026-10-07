import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
const browser=await chromium.launch(process.env.SAJU_CHROMIUM_PATH?{executablePath:process.env.SAJU_CHROMIUM_PATH}:{});
try{
 for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:900},offline:true});
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  // The managed cloud browser blocks file:// navigation. Load the exact HTML bytes
  // into an offline blank page instead, without any HTTP server or external assets.
  await page.setContent(await readFile(resolve(import.meta.dirname,'../downloads/saju-program.html'),'utf8'));
  await page.getByLabel('생년월일').fill('1988-07-12');await page.getByRole('button',{name:'사주 원국 계산하기'}).click();
  await page.getByRole('table').waitFor();assert.equal(await page.getByRole('columnheader').count(),5);
  await page.getByText('구조화된 계산 데이터 (JSON)',{exact:true}).click();
  const data=JSON.parse(await page.locator('pre').innerText());
  assert.equal(data.solarDate,'1988-07-12');assert.equal(data.calculation.standardTime,'1988-07-12 11:00');
  assert.equal(data.pillars.length,4);assert.equal(data.calculation.dstCorrectionMinutes,60);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'JSON 저장'}).click();assert.equal((await download).suggestedFilename(),'saju-chart.json');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  await context.close();console.log(`PASS: ${width}px, standalone HTML, 1988 birth calculation, JSON download, no external requests`);
 }
}finally{await browser.close();}
