/* Browser regression check for the current static site. No live form requests. */
const fs=require('fs'),path=require('path'),assert=require('assert');
let playwright;
try { playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright'); }
catch(error) {
  const bundled=path.join(process.env.USERPROFILE||'', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  if(!fs.existsSync(bundled))throw new Error('Install Playwright for development, or set PLAYWRIGHT_MODULE to its module path.',{cause:error});
  playwright=require(bundled);
}
(async()=>{
 const browser=await playwright.chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage(),root=path.resolve(__dirname,'..'),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.hostname!=='site.test')return route.abort();
    let file=path.resolve(root,decodeURIComponent(u.pathname.replace(/^\/shuttertrends\//,'')));
    if(!file.startsWith(root+path.sep)&&file!==root)return route.abort();
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file))return route.fulfill({status:404,body:''});
    return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});
  });
  const routes=['','portraits/','graduations/','weddings/','events/','about/','services/','contact/','collections/'];
  for(const route of routes){
    await page.goto('https://site.test/shuttertrends/'+route);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1,route+' H1');
    if(['graduations/','weddings/'].includes(route)){
      const expected=route==='graduations/'?10:8;
      assert.equal(await page.locator('.st-vertical-gallery figure').count(),expected);
      assert.equal(await page.locator('.st-vertical-gallery figcaption').count(),0);
      assert(!(await page.locator('main').innerText()).includes('Graduation Moments'));
      assert(!(await page.locator('main').innerText()).includes('A Shared Moment'));
    }

    if(route==='services/'){
      const pricing=page.locator('.st-pricing__card');assert.equal(await pricing.count(),4);
      assert.deepEqual(await pricing.locator('h3').allTextContents(),['Portraits & Personal Moments','Graduation Sessions','Events & Celebrations','Intimate Weddings']);
      assert.deepEqual(await pricing.locator('.st-pricing__price').allTextContents(),['Starting at $75','Starting at $100','Starting at $100 per hour','Starting at $400']);
      assert.equal(await pricing.locator('li').count(),13);
      assert.equal(await pricing.locator('a[href="../contact/"]').count(),4);
      const boxes=await pricing.evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
      assert(page.viewportSize().width>700?Math.abs(boxes[0].y-boxes[1].y)<1:boxes[1].y>=boxes[0].y+boxes[0].height,'pricing columns');
    }
    assert.equal(await page.locator('footer.st-footer').count(),1);
    assert.deepEqual(await page.locator('.st-footer__explore a').allTextContents(),['Portraits','Events','Services','About','Contact']);
    assert.equal(await page.locator('.st-footer__cta h2').innerText(),'Have a Moment Worth Capturing?');
    assert.equal(await page.locator('.st-home-contact,#contact-invitation').count(),0);
    assert((await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily)).includes('DM Sans'));
    const brand=page.locator('.st-brand__wordmark');assert((await brand.evaluate(e=>getComputedStyle(e).fontFamily)).includes('Cormorant Garamond'));
    for(const width of [1440,1552,1920,768,390,320,720]){
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflow '+width);
      if(!route&&width>1000){const photo=await page.locator('.st-home-feature__photos').first().boundingBox();const gutter=Math.max(Math.min(64,Math.max(22,width*.04)),(width-1280)/2),edge=Math.min(40,Math.max(24,width*.02)),gap=Math.min(56,Math.max(54,width*.04));assert(Math.abs(photo.width-(width-gutter-edge-Math.min(width*.46,720)-gap-2))<1,'original feature photo width');}
      assert.equal(await page.locator('[data-st-nav-section="events"],#st-mega-events').count(),0);
    }
    await page.setViewportSize({width:1440,height:1000});
    const portraits=page.locator('[data-st-nav-section="portraits"]');await portraits.hover();
    assert.deepEqual(await portraits.locator('.st-mega-card').allTextContents(),['Personal Moments','Graduations','Weddings']);
    await page.keyboard.press('Escape');
    const eventLink=page.locator('.st-nav__link').filter({hasText:/^Events$/});
    assert((await eventLink.getAttribute('href')).endsWith('events/'));
    assert.equal(await eventLink.locator('..').locator('button').count(),0);
  }
  await page.goto('https://site.test/shuttertrends/');await page.setViewportSize({width:1440,height:1000});
  const alignment=await page.locator('#home-hero').boundingBox();const logo=await page.locator('.st-brand').boundingBox();assert(alignment.x>=40&&alignment.x<=60);assert(Math.abs(alignment.x-logo.x)<1);
  const cta=page.locator('#home-hero .wp-block-buttons a');assert.equal(await cta.count(),1);assert.equal(await cta.innerText(),'Book a Session');assert(await cta.evaluate(e=>e.parentElement.classList.contains('is-style-fill')));
  assert.equal((await page.locator('#home-hero h1').innerText()).replace(/\s+/g,' ').trim(),'Real moments. A cinematic perspective.');
  const middle=page.locator('.st-film-group:not([data-reel-repeat])');assert.equal(await middle.locator('.st-film-frame').count(),22);
  await page.mouse.move(10,900);await page.waitForTimeout(300);
  const position=()=>page.locator('.st-film-track').evaluate(e=>e.style.transform);
  const start=await position();await page.waitForTimeout(200);assert.notEqual(await position(),start,'reel advances');
  await page.locator('.st-film-pause').click();const stopped=await position();await page.waitForTimeout(150);assert.equal(await position(),stopped);
  const frame=middle.locator('.st-film-frame').first();await frame.focus();await page.keyboard.press('Enter');
  assert(await page.locator('.st-reel-viewer[open]').isVisible());
  assert.equal(await page.locator('.st-reel-viewer[open] button').count(),1);await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});const still=await position();await page.waitForTimeout(150);assert.equal(await position(),still);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:844});await page.locator('[data-st-menu-toggle]').click();
  await page.locator('.st-nav__link').filter({hasText:/^Events$/}).click();await page.waitForURL('**/events/');
  const panels=page.locator('.st-event-panel');assert.equal(await page.locator('.st-event-panel__copy:visible').count(),0);await panels.first().click();assert.equal(await page.locator('.st-event-panel__copy:visible').count(),1);assert.equal(await panels.first().getAttribute('aria-pressed'),'true');await panels.first().click();assert.equal(await page.locator('.st-event-panel__copy:visible').count(),0);
  await page.goto('https://site.test/shuttertrends/portraits/');
  for(let i=0;i<3;i++){const deck=page.locator('[data-st-portrait-deck]').nth(i),front=()=>deck.locator('[data-depth="0"]');const id=await front().getAttribute('data-photo-id');await front().press('ArrowRight');await page.waitForFunction(({index,previous})=>{const front=document.querySelectorAll('[data-st-portrait-deck]')[index]?.querySelector('[data-depth="0"]');return front&&front.dataset.photoId!==previous;},{index:i,previous:id});await page.keyboard.press('Enter');assert(await page.locator('.st-portrait-deck-viewer[open]').isVisible());await page.keyboard.press('Escape');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
  // Homepage disclosures retain the featured photo and original closed dimensions.
  for(const width of [1920,1440,768,375,390,430]){
    await page.setViewportSize({width,height:1000});await page.goto('https://site.test/shuttertrends/');
    const cards=page.locator('.st-home-feature');assert.equal(await cards.count(),4);assert.equal(await cards.locator('a').count(),0);
    for(let i=0;i<4;i++){
      const card=cards.nth(i),button=card.locator('.st-home-feature__toggle'),gallery=card.locator('.st-home-feature__photos');
      assert.equal(await gallery.locator('img').count(),1);const first=await gallery.locator('[data-photo-id]').first().getAttribute('data-photo-id');
      await button.focus();await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-expanded'),'true');
      const ids=await gallery.locator('[data-photo-id]').evaluateAll(es=>es.map(e=>e.dataset.photoId));assert.equal(ids.length,4);assert.equal(new Set(ids).size,4);assert.equal(ids[0],first);
      await page.waitForTimeout(400);
      const boxes=await gallery.locator('[data-photo-id]').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
      assert(boxes.every(b=>Math.abs(b.w-boxes[0].w)<1&&Math.abs(b.h-boxes[0].h)<1),'equal photo dimensions');
      assert(await gallery.locator('img').evaluateAll(es=>es.every(e=>getComputedStyle(e).objectFit==='contain')),'full photographs remain uncropped');
      if(width<=1000){const fraction=await gallery.evaluate(e=>e.firstElementChild.getBoundingClientRect().width/e.clientWidth);assert(fraction>=.85&&fraction<=.9,'mobile slide width');}
      assert.equal(await button.locator('img').count(),1,'featured photo is the control');
      assert.equal(await card.locator('.st-home-feature__copy button').count(),0);
      await card.locator('h2').click();assert.equal(await button.getAttribute('aria-expanded'),'true','copy does not toggle');
      await button.focus();
      if(width>1000){const tops=await gallery.locator('[data-photo-id]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));assert(Math.max(...tops)-Math.min(...tops)<2);}
      else {assert(await gallery.evaluate(e=>e.scrollWidth>e.clientWidth));await gallery.evaluate(e=>e.scrollLeft=e.clientWidth*.82);assert.equal(await button.getAttribute('aria-expanded'),'true');}
      await page.keyboard.press('Space');assert.equal(await button.getAttribute('aria-expanded'),'false');await page.waitForTimeout(400);assert.equal(await gallery.locator('.st-home-feature__photo:visible').count(),1);
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.goto('https://site.test/shuttertrends/');await page.setViewportSize({width:1440,height:1000});
  const cardButtons=page.locator('.st-home-feature__toggle');await cardButtons.nth(0).click();await cardButtons.nth(1).click();assert.equal(await page.locator('.st-home-feature[data-expanded="true"]').count(),1);
  await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(250);assert.equal(await page.locator('.st-home-feature[data-expanded="true"]').count(),0);
  // Server-rendered gallery photographs remain discoverable with JavaScript disabled.
  const plain=await browser.newContext({javaScriptEnabled:false});const nojs=await plain.newPage();
  await nojs.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='site.test')return r.abort();let f=path.join(root,u.pathname.replace('/shuttertrends/',''));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');return r.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'',contentType:path.extname(f)==='.html'?'text/html':path.extname(f)==='.css'?'text/css':'application/octet-stream'});});
  for(const [route,count] of [['graduations',10],['weddings',8]]){await nojs.goto('https://site.test/shuttertrends/'+route+'/');assert.equal(await nojs.locator('.st-vertical-gallery img').count(),count);}
  await nojs.goto('https://site.test/shuttertrends/collections/');assert.equal(await nojs.locator('noscript img').count(),99);await plain.close();
  // Delay only the gradient script to verify that navigation never paints the old black header.
  let releaseGradient=null;
  await page.route('**/assets/header/gradient.js*',async r=>{await new Promise(resolve=>releaseGradient=resolve);await r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'assets/header/gradient.js'))});});
  await page.goto('https://site.test/shuttertrends/',{waitUntil:'commit'});
  await page.locator('[data-st-header]').waitFor({state:'visible'});
  while(!releaseGradient)await page.waitForTimeout(10);
  assert.equal(await page.locator('[data-st-header]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  releaseGradient();await page.waitForFunction(()=>document.querySelector('[data-st-header]').dataset.scrollGradient==='true');
  assert.deepEqual(errors,[]);
  console.log('PASS: nine pages; local fonts; H1; mobile/tablet/200%-equivalent width; Events direct link desktop/mobile; Portraits menu; single gold CTA; 22-photo reel/play/pause/reduced motion/modal; Events title toggle; three decks; static no-JS galleries and 99-photo discovery.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
