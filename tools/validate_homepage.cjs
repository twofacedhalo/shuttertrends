const fs=require('fs'),vm=require('vm'),assert=require('assert');
let contentHeight=600;
class Element {
 constructor(tag='div'){this.tag=tag;this.dataset={};this.children=[];this.listeners={};this.style={setProperty(){}};this.classList={add(){},remove(){},contains(){return false}};this.isConnected=true;this.clientHeight=200;this.scrollTop=0;this.scrollLeft=0;}
 removeAttribute(k){delete this[k]} focus(){doc.activeElement=this} showModal(){this.open=true} close(){this.open=false;this.emit('close')}
 append(...nodes){this.children.push(...nodes)} replaceChildren(...nodes){this.children=nodes} cloneNode(){return new Element(this.tag)} setAttribute(k,v){this[k]=v} addEventListener(k,f){(this.listeners[k]??=[]).push(f)} emit(k,e={}){for(const f of this.listeners[k]||[])f(e)} getBoundingClientRect(){return {height:contentHeight}} querySelectorAll(s){return s==='img'?this.children.flatMap(c=>c.tag==='img'?[c]:c.querySelectorAll(s)):[]} querySelector(s){return map[s]||null} contains(){return false}
}
const root=new Element(), viewport=new Element(),track=new Element(),pause=new Element(),map={'.st-film-viewport':viewport,'.st-film-track':track,'.st-film-pause':pause};
viewport.getBoundingClientRect=()=>({top:0,height:200});
const doc=new Element();doc.querySelector=()=>root;doc.createElement=t=>new Element(t);doc.hidden=false;doc.body=new Element();doc.documentElement=new Element();
const media={};let queue=new Map(),id=0,clock=1000;
const box={document:doc,window:new Element(),matchMedia:q=>media[q]??=(Object.assign(new Element(),{matches:false})),requestAnimationFrame:f=>{queue.set(++id,f);return id},cancelAnimationFrame:i=>queue.delete(i),queueMicrotask:f=>f(),IntersectionObserver:class{constructor(f){this.f=f}observe(){this.f([{isIntersecting:true}])}},ResizeObserver:class{constructor(f){this.f=f}observe(){this.f()}},Math,Number,String};
box.window.scrollX=0;box.window.scrollY=345;box.window.scrollTo=()=>{};
box.window.shutterTrendsPhotos=[{id:'one',src:'test.webp',fullSrc:'full.webp',alt:'Photo',width:600,height:400},{id:'two',src:'portrait.webp',fullSrc:'portrait-full.webp',alt:'Portrait',width:400,height:600}];
const code=fs.readFileSync('assets/photography/filmstrip.js','utf8');vm.runInNewContext(code,box);
const position=()=>-(Number(track.style.transform.match(/,(-?[\d.]+)px/)[1]));
function advance(n){for(let i=0;i<n;i++){clock+=16;const pending=[...queue.values()];queue.clear();assert(pending.length<=1,'duplicate RAF');pending.forEach(f=>f(clock));}}
advance(100);assert(position()>0,'autoplay starts');let up=false,down=false,previous=position();for(let i=0;i<10000;i++){advance(1);let now=position();assert(now>=0&&now<=400);if(now>previous+.001)up=true;if(now<previous-.001)down=true;previous=now}assert(up&&down,'both directions');
pause.emit('click');const held=position();advance(100);assert.equal(position(),held);pause.emit('click');advance(100);assert.notEqual(position(),held);
doc.hidden=true;doc.emit('visibilitychange');const hidden=position();advance(100);assert.equal(position(),hidden);doc.hidden=false;doc.emit('visibilitychange');advance(100);assert.notEqual(position(),hidden);
media['(prefers-reduced-motion: reduce)'].matches=true;media['(prefers-reduced-motion: reduce)'].emit('change');const still=position();advance(100);assert.equal(position(),still);assert(pause.disabled);
vm.runInNewContext(code,box);assert.equal(track.children.length,1,'init guard');
media['(prefers-reduced-motion: reduce)'].matches=false;
viewport.clientHeight=800;box.window.emit('pageshow');advance(100);assert(pause.disabled,'short reel stays still');assert.equal(queue.size,0);
media['(max-width: 1000px)'].matches=true;media['(max-width: 1000px)'].emit('change');assert.equal(track.style.transform,'none');assert.equal(queue.size,0,'no compact autoplay');
viewport.clientHeight=200;media['(max-width: 1000px)'].matches=false;media['(max-width: 1000px)'].emit('change');advance(100);assert.equal(root.dataset.axis,'vertical');assert(!pause.disabled);assert.equal(queue.size,1,'desktop resumes one loop');
const fine=media['(any-hover: hover) and (any-pointer: fine)'];fine.matches=true;
contentHeight=4200;box.window.emit('pageshow');
const middle=()=>{viewport.emit('keydown',{key:'Home',preventDefault(){}});for(let i=0;i<8;i++)viewport.emit('keydown',{key:'ArrowDown',preventDefault(){}})};
const steer=y=>viewport.emit('pointermove',{pointerType:'mouse',clientY:y});
middle();steer(0);advance(180);let start=position();advance(60);const downward=(start-position())/.96;assert(downward>147&&downward<=151,'top moves visible photos downward at about 150px/s');
middle();steer(100);advance(240);start=position();advance(60);const slow=Math.abs(position()-start)/.96;assert(slow<2,'center crawls');
middle();steer(200);advance(180);start=position();advance(60);const upward=(position()-start)/.96;assert(upward>147&&upward<=151,'bottom moves visible photos upward at about 150px/s');
viewport.emit('pointerleave');advance(180);start=position();advance(60);const auto=(position()-start)/.96;assert(auto>20&&auto<25,'exit restores unchanged slow autoplay');
pause.emit('click');steer(0);start=position();advance(100);assert.equal(position(),start,'pause blocks cursor motion');pause.emit('click');
middle();steer(0);let cursorUp=false,cursorDown=false;previous=position();for(let i=0;i<6000;i++){advance(1);const now=position();assert(now>=0&&now<=4000);if(now>previous+.001)cursorUp=true;if(now<previous-.001)cursorDown=true;previous=now}assert(cursorUp&&cursorDown,'held cursor reverses at boundaries');
fine.matches=false;fine.emit('change');middle();steer(0);advance(180);start=position();advance(15);assert(position()>start,'touch-only ignores inverted cursor tracking');
console.log('PASS: top/down '+downward.toFixed(1)+'px/s; bottom/up '+upward.toFixed(1)+'px/s; center '+slow.toFixed(1)+'px/s; exit autoplay '+auto.toFixed(1)+'px/s; paused cursor, boundaries, touch-only');
console.log('PASS: automatic Y motion, boundaries/reversals, one RAF, pause/resume, hidden/reduced motion, initialization guard');
// Each generated frame is a non-navigating button and opens only its exact original.
const viewer=doc.body.children[0],image=viewer.children[0],close=viewer.children[1];
const frames=track.children[0].children;
for(const [i,button] of frames.entries()) {
 assert.equal(button.tag,'button');assert(!button.href,'no gallery URL');
 const start=position();button.emit('click');assert(viewer.open);assert.equal(image.src,box.window.shutterTrendsPhotos[i].fullSrc);
 advance(100);assert.equal(position(),start,'modal freezes reel exactly');
 close.emit('click');assert(!viewer.open);assert.equal(position(),start,'close restores exact position');
 advance(60);assert.notEqual(position(),start,'autoplay resumes');
}
pause.emit('click');const stopped=position();frames[0].emit('click');close.emit('click');advance(100);assert.equal(position(),stopped,'user pause remains paused');pause.emit('click');
frames[0].emit('click');let trapped=false;viewer.emit('keydown',{key:'Tab',preventDefault(){trapped=true}});assert(trapped);assert.equal(doc.activeElement,close);viewer.emit('click',{target:viewer});assert(!viewer.open);assert.equal(doc.activeElement,frames[0]);
console.log('PASS: every frame opens exact full-color source without links, modal freeze/restore, paused-state preservation, focus trap/return, outside close');
const data={window:{},document:{currentScript:{src:'https://example.com/shuttertrends/assets/photography/collections.js'}},URL,Math,console};
for(const f of ['assets/site-config.js','assets/photography/photos.js','assets/photography/optimized.js','assets/photography/collections.js','assets/photography/stories-data.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),data);
const all=data.window.shutterTrendsPortfolio.flatMap(c=>c.photos);assert.equal(all.length,96);for(const p of all){assert(p.src.includes('/shuttertrends/assets/images/optimized/'));assert(p.width>0&&p.height>0);assert(fs.existsSync(decodeURIComponent(new URL(p.fullSrc||p.src).pathname.replace('/shuttertrends/',''))),'full-resolution image exists')}
for(const p of data.window.shutterTrendsPhotos)assert.notEqual(p.collectionCategory,'portraits');
for(const id of ['import-df02a3a17118','import-img-3880'])assert(!all.some(p=>p.id===id));assert(all.some(p=>p.id==='import-img-4035'));
for(const s of data.window.shutterTrendStoryDefinitions){assert(s.photoIds.length<=5);for(const id of s.photoIds)assert(all.some(p=>p.id===id),id)}
for(const ids of Object.values(data.window.shutterTrendsHomeFeatures))for(const id of ids)assert(all.some(p=>p.id===id),'original category photo exists');
assert.deepEqual(Object.keys(data.window.shutterTrendsHomeFeatures),['events','personal','weddings','graduations']);
assert.equal(data.window.shutterTrendsPortfolio.filter(c=>c.category==='graduations').flatMap(c=>c.photos).length,35);
assert.equal(data.window.shutterTrendsPortfolio.filter(c=>c.category==='portraits').flatMap(c=>c.photos).length,32);
for(const p of data.window.shutterTrendsPhotos)assert.notEqual(p.collectionCategory,'graduations');
const homepage=fs.readFileSync('index.html','utf8');assert.equal((homepage.match(/<article class="st-home-feature"/g)||[]).length,4);assert(!homepage.includes('assets/themes/'));
assert(fs.readFileSync('graduations/index.html','utf8').includes('data-st-collection="graduations"'));
assert(!fs.readFileSync('index.html','utf8').includes('data-st-stories'));
assert(fs.readFileSync('stories/index.html','utf8').includes('data-st-detail'));
console.log('PASS: 96 photos, optimized Pages paths, portrait exclusion, removed-photo exclusions, microphone retained, seven story definitions');
