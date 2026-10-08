import {test,expect,type Page} from '@playwright/test';
import {openFullReport} from './helpers';

async function createConsultation(page:Page,name='봄이',date='1988-01-03'){
 await page.goto('/');
 await page.getByLabel('이름').fill(name);
 await page.getByLabel('생년월일').fill(date);await page.getByLabel('출생시간').fill('12:00');
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기'}).click();
 const consultation=page.getByRole('region',{name:'정원할매 상담'});
 await expect(consultation).toBeVisible();
 return consultation;
}

test('처음 결과는 할매 상담, 이야기 순서대로 듣고 다시 시작하기',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const consultation=await createConsultation(page);
 await expect(consultation).toHaveAttribute('data-topic','nature');
 await expect(consultation).toContainText('봄이');
 await expect(consultation).toContainText('1988-01-03');
 await expect(page.getByRole('region',{name:'종합 사주 리포트'})).toBeHidden();
 const initial=await consultation.innerText();
 await consultation.getByRole('button',{name:'다음 이야기 듣기',exact:true}).click();
 const firstChapter=await consultation.innerText();expect(firstChapter).not.toBe(initial);
 await consultation.getByRole('button',{name:'다음 이야기 듣기',exact:true}).click();
 expect(await consultation.innerText()).not.toBe(firstChapter);
 await consultation.getByRole('button',{name:'전체 이야기 펼치기',exact:true}).click();
 await consultation.getByRole('button',{name:'이 이야기 처음부터',exact:true}).click();
 await expect(consultation.getByRole('button',{name:'다음 이야기 듣기',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});

test('선택 질문과 직접 입력은 계산된 풀이만 읽고 다른 주제는 안내',async({page})=>{
 const consultation=await createConsultation(page);
 await consultation.getByRole('button',{name:'돈과 재물 이야기',exact:true}).click();
 await expect(consultation).toHaveAttribute('data-topic','wealth');
 await consultation.getByText('이 이야기는 무엇을 보고 풀었나요?',{exact:true}).click();
 await expect(consultation.locator('.consultation-evidence')).toContainText('庚');
 await expect(consultation.locator('.consultation-evidence')).toContainText('정재');
 await consultation.getByRole('button',{name:'일과 직업 이야기',exact:true}).click();
 await expect(consultation).toHaveAttribute('data-topic','career');
 const question=consultation.getByRole('textbox',{name:'할매에게 물어볼 이야기',exact:true});
 await question.fill('제 돈 이야기를 들려주세요');
 await consultation.getByRole('button',{name:'질문 보내기',exact:true}).click();
 await expect(consultation).toHaveAttribute('data-topic','wealth');
 await question.fill('양자역학의 파동방정식을 풀어주세요');
 await consultation.getByRole('button',{name:'질문 보내기',exact:true}).click();
 await expect(consultation.getByRole('status')).toContainText('그 질문은 지금 계산한 자료만으로 답을 정하기 어려워요.');
 await expect(consultation).toHaveAttribute('data-topic','wealth');
 await question.fill('제 친구의 오늘 운세도 봐주세요');
 await consultation.getByRole('button',{name:'질문 보내기',exact:true}).click();
 await expect(consultation.getByRole('status')).toContainText('다른 분의 이야기는 그분의 사주가 있어야 살펴볼 수 있어요.');
});

test('사람을 바꾸면 상담과 원국이 함께 초기화되고 새 자료로 계산',async({page})=>{
 const consultation=await createConsultation(page,'첫상담','1988-01-03');
 await consultation.getByRole('button',{name:'돈과 재물 이야기',exact:true}).click();
 await expect(consultation).toHaveAttribute('data-topic','wealth');
 await page.getByRole('button',{name:'다른 사람 입력',exact:true}).click();
 await expect(consultation).toHaveCount(0);
 await expect(page.getByLabel('생년월일')).toHaveValue('');
 await page.getByLabel('이름').fill('새상담');
 await page.getByLabel('생년월일').fill('1988-01-04');await page.getByLabel('출생시간').fill('12:00');
 await page.getByRole('button',{name:'오늘 운세 바로 보기',exact:true}).click();
 await expect(consultation).toBeVisible();
 await expect(consultation).toHaveAttribute('data-topic','daily');
 await expect(consultation).toContainText('새상담');
 await expect(consultation).not.toContainText('첫상담');
 await expect(consultation).not.toContainText('곶감');
 const opening=consultation.locator('.opening-bubble>p').last();
 await expect(opening).toContainText('일간');await expect(opening).toContainText('일진');
 await consultation.getByRole('button',{name:'다음 이야기 듣기',exact:true}).click();
 expect(await consultation.locator('.story-chapter>p').first().innerText()).not.toBe(await opening.innerText());
 await openFullReport(page);
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'리포트 저장',exact:true}).click();
 const fs=await import('node:fs/promises');
 const report=JSON.parse(await fs.readFile((await (await download).path())!,'utf8'));
 expect(report.natal.input.name).toBe('새상담');
 expect(report.natal.solarDate).toBe('1988-01-04');
 expect(report.interpretation.sections).toHaveLength(6);
 expect(report.natal.pillars[2].ganji).toBe('戊午');
 await expect(opening).toContainText('무토');
 await expect(opening).toContainText(report.fortune.daily.stemTenGod);
 await expect(opening).toContainText(report.fortune.daily.branchTenGod);
 const openingText=await opening.innerText();
 expect(report.interpretation.daily.paragraphs[0]).toBe(openingText);
 await expect(page.getByRole('region',{name:'종합 사주 리포트'}).locator('.reading-card>p:not(.card-kicker)').first()).toHaveText(openingText);
 const basis=consultation.getByRole('complementary',{name:'이번 풀이의 명리 근거'});
 await expect(basis).toContainText('무토');await expect(basis).toContainText(report.fortune.daily.ganji);
 await expect(basis).toContainText(report.fortune.daily.stemTenGod);await expect(basis).toContainText(report.fortune.daily.branchTenGod);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('앱 메뉴로 원국을 보고 돌아와도 듣던 상담과 진행이 유지',async({page})=>{
 const consultation=await createConsultation(page);
 await consultation.getByRole('button',{name:'돈과 재물 이야기',exact:true}).click();
 await consultation.getByRole('button',{name:'다음 이야기 듣기',exact:true}).click();
 await expect(consultation.locator('.story-chapter')).toHaveCount(1);
 const menu=page.getByRole('navigation',{name:'앱 메뉴',exact:true});
 await menu.getByRole('button',{name:'원국',exact:true}).click();
 await expect(page.getByRole('table')).toBeVisible();
 await menu.getByRole('button',{name:'상담',exact:true}).click();
 await expect(consultation).toHaveAttribute('data-topic','wealth');
 await expect(consultation.locator('.story-chapter')).toHaveCount(1);
 await menu.getByRole('button',{name:'내 정보',exact:true}).click();
 await menu.getByRole('button',{name:'상담',exact:true}).click();
 await expect(consultation).toHaveAttribute('data-topic','wealth');
 await expect(consultation.locator('.story-chapter')).toHaveCount(1);
});

test('출생시간은 빈칸으로 시작하고 입력 전에는 시주와 상담을 만들지 않음',async({page})=>{
 await page.goto('/');
 const time=page.getByLabel('출생시간');
 await expect(time).toHaveValue('');
 await page.getByLabel('생년월일').fill('1988-07-12');
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 expect(await time.evaluate(input=>(input as HTMLInputElement).validity.valueMissing)).toBe(true);
 await expect(page.getByRole('region',{name:'정원할매 상담'})).toHaveCount(0);
 await expect(page.getByRole('table')).toHaveCount(0);
 await time.fill('12:00');
 await page.getByRole('button',{name:'할매에게 사주 이야기 듣기',exact:true}).click();
 await expect(page.getByRole('region',{name:'정원할매 상담'})).toBeVisible();
});
