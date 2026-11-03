let playwright;
try { playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright'); }
catch { playwright=require(require('path').join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const engine=process.env.ST_BROWSER==='webkit'?'webkit':'chromium';
const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{const browser=await playwright[engine].launch({...(engine==='chromium'?{channel:'chrome'}:{}),headless:true});const page=await browser.newPage({hasTouch:true,isMobile:true});const root=path.resolve(__dirname,'..');const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='local.test')return route.abort();let f=path.join(root,decodeURIComponent(u.pathname.replace(/^\/shuttertrends\//,'')));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))return route.fulfill({status:404,body:''});const ext=path.extname(f);return route.fulfill({body:fs.readFileSync(f),contentType:({'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.webp':'image/webp'})[ext]||'application/octet-stream'});});



for(const width of [375,390,430,767]){
 await page.setViewportSize({width,height:950});await page.goto('https://local.test/shuttertrends/');
 const reel=page.locator('[data-st-filmstrip]'),track=page.locator('.st-film-track'),hero=page.locator('#home-hero'),boundary=page.locator('.st-home-reel-boundary');
 await page.waitForTimeout(300);
 assert.equal(await reel.getAttribute('data-axis'),'mobile-background');assert.equal(await reel.getAttribute('aria-hidden'),'true');assert(await reel.evaluate(e=>e.inert));
 assert.equal(await boundary.evaluate(e=>getComputedStyle(e).position),'fixed');assert(await boundary.evaluate(e=>e.parentElement===document.body));
 const b=await boundary.boundingBox(),h=await hero.boundingBox();assert(Math.abs(b.width/width-.48)<.001);assert(Math.abs(b.x+b.width-width)<1);assert(Math.abs(b.height-950)<2);
 assert.equal(await track.evaluate(e=>getComputedStyle(e).flexDirection),'column');
 assert.equal(await page.locator('.st-film-group:visible').count(),3);
 await page.locator('.st-film-frame').first().evaluate(e=>e.click());assert.equal(await page.locator('.st-reel-viewer[open]').count(),0,'decorative reel cannot open lightbox');
 const pos=await track.evaluate(e=>e.style.transform);await page.waitForTimeout(350);assert.notEqual(await track.evaluate(e=>e.style.transform),pos,'upward motion');
 const copies=await page.locator('.st-film-group').evaluateAll(es=>es.map(e=>({height:e.getBoundingClientRect().height,ids:[...e.children].map(c=>c.dataset.photoId)})));assert.deepEqual(copies[0].ids,copies[1].ids);assert.deepEqual(copies[1].ids,copies[2].ids);assert(copies.every(c=>Math.abs(c.height-copies[0].height)<.01));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const cta=page.locator('#home-hero .wp-block-buttons a');assert(await cta.evaluate(e=>{const b=e.getBoundingClientRect();return e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}));
 await page.locator('[data-st-menu-toggle]').click();assert.equal(await page.locator('[data-st-menu-toggle]').getAttribute('aria-expanded'),'true');await page.locator('[data-st-menu-toggle]').click();
 for(const target of ['.st-home-intro','.st-home-feature:last-child','footer']){
  const previous=await track.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m42);
  await page.locator(target).scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  const box=await boundary.boundingBox();assert(Math.abs(box.y)<1&&Math.abs(box.height-950)<2,'fixed full-page layer');
  const current=await track.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m42);assert(current<previous&&previous-current<100,'motion continues without resets');
  assert.equal(await reel.getAttribute('data-axis'),'mobile-background');
 }
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
 if(width===390){await page.screenshot({path:'work/mobile-background-reel.png'});await page.waitForFunction(()=>document.querySelectorAll('.st-film-frame.is-burning').length===1,{},{timeout:17000});assert.equal(await page.locator('.is-burning').count(),1);await page.waitForTimeout(500);const color=await page.locator('.is-burning img').evaluate(e=>getComputedStyle(e).filter);assert(!color.includes('grayscale(1)'),'burn reveals color');await page.waitForTimeout(1000);assert.equal(await page.locator('.is-burning').count(),0);}
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await track.evaluate(e=>e.style.transform);await page.waitForTimeout(250);assert.equal(await track.evaluate(e=>e.style.transform),hidden);assert.equal(await page.locator('.is-burning').count(),0);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.emulateMedia({reducedMotion:'reduce'});const still=await track.evaluate(e=>e.style.transform);await page.waitForTimeout(300);assert.equal(await track.evaluate(e=>e.style.transform),still);assert.equal(await page.locator('.is-burning').count(),0);await page.emulateMedia({reducedMotion:'no-preference'});
}
await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(300);assert(await page.locator('.st-home-reel-boundary').evaluate(e=>e.parentElement.classList.contains('entry-content')));assert.equal(await page.locator('[data-st-filmstrip]').getAttribute('aria-hidden'),null);assert.equal(await page.locator('[data-st-filmstrip]').getAttribute('data-axis'),'vertical');
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: mobile background reel at 375/390/430/767; three identical looping copies, upward motion, one brief burn, reduced-motion freeze, noninteractive layer, CTA/menu usable, 48vw fixed full-page layer, continuous motion through scrolling, no overflow and desktop restoration.');})().catch(e=>{console.error(e);process.exit(1)});
