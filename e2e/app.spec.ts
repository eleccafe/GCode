import {test,expect} from '@playwright/test';
test('input → related chord → browser back → direct URL',async({page})=>{
 await page.goto('./');await expect(page.getByTestId('main-chord-name')).toHaveText('A');
 for(const name of ['D','E','F#m','Bm','C#m'])await expect(page.getByRole('button',{name:new RegExp(`^${name.replace('#','\\#')} 코드,`)})).toBeVisible();
 await page.getByRole('button',{name:'E 코드, 5도',exact:true}).click();await expect(page.getByTestId('main-chord-name')).toHaveText('E');await expect(page).toHaveURL(/chord=E/);
 await page.goBack();await expect(page.getByTestId('main-chord-name')).toHaveText('A');
 await page.goto('./?chord=F%23m');await expect(page.getByTestId('main-chord-name')).toHaveText('F#m');
});
test('normalization, invalid input, Bb spelling and slash bass',async({page})=>{
 await page.goto('./');const input=page.getByRole('combobox',{name:'코드 입력'});
 for(const text of ['am','A-','Amin']){await input.fill(text);await input.press('Enter');await expect(page.getByTestId('main-chord-name')).toHaveText('Am');}
 await input.fill('Xyz');await input.press('Enter');await expect(page.getByRole('alert')).toContainText('알 수 없는 코드');await expect(page.locator('.input-error button')).toHaveCount(3);
 await input.fill('Bb');await input.press('Enter');await expect(page.getByRole('button',{name:'Eb 코드, 4도',exact:true})).toBeVisible();
 await input.fill('G/B');await input.press('Enter');await expect(page.getByTestId('main-chord-name')).toHaveText('G/B');await expect(page.locator('.no-voicing')).toHaveCount(0);
});
test('barres, left handed geometry, dark mode, keyboard and saved preferences',async({page})=>{
 await page.goto('./?chord=F');await expect(page.locator('.diagram-button [data-testid=barre]')).toHaveCount(1);
 await expect(page.locator('.diagram-button .finger-number,.diagram-button .root-number')).toHaveText(['1','3','4','2']);
 const before=await page.locator('.diagram-button [data-string="6"] circle').getAttribute('cx');
 await page.getByRole('button',{name:'설정 열기'}).click();await page.getByLabel('왼손잡이 모드').check();await page.getByLabel('다크 모드').check();await page.getByRole('button',{name:'설정 닫기'}).click();
 expect(await page.locator('.diagram-button [data-string="6"] circle').getAttribute('cx')).not.toBe(before);await expect(page.locator('html')).toHaveClass('dark');
 await page.reload();await expect(page.locator('html')).toHaveClass('dark');
 await page.locator('.chord-card').first().focus();await page.keyboard.press('ArrowRight');await expect(page.locator('.chord-card').nth(1)).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByTestId('main-chord-name')).not.toHaveText('F');
});
test('voicing controls, swipe, key lock and narrow layout',async({page,isMobile})=>{
 await page.goto('./?chord=A');await expect(page.locator('.voicing-pagination b')).toHaveText('1');await page.getByRole('button',{name:'다음 운지'}).click();await expect(page.locator('.voicing-pagination b')).toHaveText('2');
 const diagram=page.locator('.diagram-button');
 const target=await diagram.elementHandle();
 await diagram.dispatchEvent('touchstart',{touches:[{identifier:1,target,clientX:250,clientY:300}]});
 await diagram.dispatchEvent('touchend',{touches:[],changedTouches:[{identifier:1,target,clientX:100,clientY:305}]});
 await expect(page.locator('.voicing-pagination b')).toHaveText('1');
 await page.getByLabel('키 선택',{exact:true}).selectOption('G');await expect(page.locator('.degree-badge')).toHaveText('II');await expect(page.getByRole('button',{name:'고정됨'})).toHaveAttribute('aria-pressed','true');
 if(isMobile){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);for(const card of await page.locator('.chord-card').all()){const box=await card.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(64);expect(box!.height).toBeGreaterThanOrEqual(80);}}
});
test('works offline after first visit, including a new chord query',async({page,context})=>{
 await page.goto('./');await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));});
 await expect(page.locator('.connection')).toContainText('오프라인 준비됨');
 await context.setOffline(true);await page.goto('./?chord=Bm');await expect(page.getByTestId('main-chord-name')).toHaveText('Bm');await expect(page.locator('.diagram-button .fret-label')).toHaveText('2fr');await expect(page.locator('.connection')).toContainText('오프라인');
});

test('production assets and service worker stay inside the deployment path',async({page,baseURL})=>{
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto('./');
 expect(response?.status()).toBe(200);
 await expect(page.getByTestId('main-chord-name')).toHaveText('A');
 const basePath=new URL(baseURL!).pathname;
 const script=await page.locator('script[type="module"][src]').getAttribute('src');
 expect(script).toMatch(/\/assets\/.*\.js$/);
 const asset=new URL(script!,page.url());
 expect(asset.pathname.startsWith(basePath)).toBe(true);
 const assetResponse=await page.request.get(asset.href);
 expect(assetResponse.status()).toBe(200);
 expect(assetResponse.headers()['content-type']).toMatch(/javascript/);
 const scope=await page.evaluate(async()=>(await navigator.serviceWorker.ready).scope);
 expect(new URL(scope).pathname).toBe(basePath);
 expect(errors).toEqual([]);
});
