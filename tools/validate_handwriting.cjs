/* Local-only hero handwriting checks. No requests leave the repository. */
const fs=require('fs'),path=require('path'),assert=require('assert');
let playwright;try{playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');}
catch{playwright=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const root=path.resolve(__dirname,'..');
async function local(route){
 const url=new URL(route.request().url());if(url.hostname!=='local.test')return route.abort();
 let file=path.join(root,decodeURIComponent(url.pathname.replace(/^\/shuttertrends\//,'')));
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file))return route.fulfill({status:404,body:''});
 return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream'});
}
(async()=>{
 const engine=process.env.ST_BROWSER==='webkit'?'webkit':'chromium';
 const browser=await playwright[engine].launch({...engine==='chromium'?{channel:'chrome'}:{},headless:true});
 try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',local);
 await page.addInitScript(()=>{
  const params=new URL(location.href).searchParams;
  if(params.has('choice')){sessionStorage.removeItem('shuttertrend.previousHeroWord');Math.random=()=>Number(params.get('choice'));}
  if(params.has('blocked'))Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Storage blocked');}});
 });
 const words=['Unscripted.','Unfiltered.','Unposed.','Unplanned.','Unrehearsed.','Uninterrupted.'];
 const tagline=page.locator('[data-st-hero-tagline]');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let i=0;i<words.length;i++){
  await page.goto('https://local.test/shuttertrends/?choice='+((i+.1)/6));
  assert.equal(await tagline.getAttribute('data-word'),words[i]);assert.equal(await tagline.getAttribute('aria-label'),'Life, '+words[i]);
  assert.equal(await tagline.locator('svg').count(),1);assert.equal(await tagline.locator('.st-hero-tagline__fallback').count(),0);
  assert(await tagline.locator('path').evaluateAll(es=>es.every(e=>e.getTotalLength()>0&&parseFloat(e.style.strokeDashoffset)===0)));
  assert.equal(await tagline.evaluate(e=>e.getAnimations({subtree:true}).length),0);
 }
 for(const width of [320,375,390,430,767,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.goto('https://local.test/shuttertrends/?choice=.99');await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const bounds=await tagline.boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width+1);
  assert.equal(await page.locator('h1').innerText(),'The moments in between.');
  // Every stroke lies within the shared viewport, including long words and descenders.
  assert(await tagline.locator('svg').evaluate(svg=>[...svg.children].every(p=>{const b=p.getBBox(),x=p.transform.baseVal.consolidate().matrix.e;return b.x+x>=-3&&b.x+x+b.width<=svg.viewBox.baseVal.width-4&&b.y>=1&&b.y+b.height<99;})));
 }
 // Storage guards prevent immediate repeats across reloads in the same tab.
 await page.goto('https://local.test/shuttertrends/');let previous=await tagline.getAttribute('data-word');
 for(let i=0;i<6;i++){await page.reload();const chosen=await tagline.getAttribute('data-word');assert.notEqual(chosen,previous);previous=chosen;}
 await page.goto('https://local.test/shuttertrends/?blocked');assert(words.includes(await tagline.getAttribute('data-word')));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('https://local.test/shuttertrends/?choice=.99');await page.evaluate(()=>document.fonts.ready);
 const word=await tagline.getAttribute('data-word'),before=await page.locator('#home-hero .wp-block-buttons').boundingBox();
 assert((await tagline.evaluate(e=>e.getAnimations({subtree:true}).length))>0);
 await page.waitForTimeout(2850);
 assert.equal(await tagline.getAttribute('data-word'),word);assert(await tagline.locator('path').evaluateAll(es=>es.every(e=>parseFloat(e.style.strokeDashoffset)===0)));
 assert.equal(await tagline.evaluate(e=>e.getAnimations({subtree:true}).length),0);
 const after=await page.locator('#home-hero .wp-block-buttons').boundingBox();assert(Math.abs(before.y-after.y)<1,'handwriting shifted layout');
 await page.waitForTimeout(300);assert.equal(await tagline.getAttribute('data-word'),word);
 // Page-cache/visibility lifecycle completes the same word; it never starts a new one.
 await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new Event('pageshow'));document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await tagline.getAttribute('data-word'),word);
 const plain=await browser.newContext({javaScriptEnabled:false});await plain.route('**/*',local);const fallback=await plain.newPage();await fallback.goto('https://local.test/shuttertrends/');
 assert.equal(await fallback.locator('[data-st-hero-tagline]').getAttribute('aria-label'),'Life, Unscripted.');assert(await fallback.locator('.st-hero-tagline__fallback').isVisible());await plain.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: all six SVG words, one selection per load, immediate-repeat guard, blocked storage, 2.5s once-only stroke animation, stable layout at 320/375/390/430/767/1440/1920, reduced motion, accessible phrase and no-JS fallback.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
