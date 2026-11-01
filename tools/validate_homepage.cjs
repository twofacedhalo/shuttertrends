const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Element {
 constructor(tag='div'){this.tag=tag;this.dataset={};this.children=[];this.listeners={};this.style={setProperty(){}};this.classList={add(){},remove(){},contains(){return false}};this.isConnected=true;this.clientHeight=200;this.scrollTop=0;this.scrollLeft=0;}
 append(...nodes){this.children.push(...nodes)} replaceChildren(...nodes){this.children=nodes} cloneNode(){return new Element(this.tag)} setAttribute(k,v){this[k]=v} addEventListener(k,f){(this.listeners[k]??=[]).push(f)} emit(k,e={}){for(const f of this.listeners[k]||[])f(e)} getBoundingClientRect(){return {height:600}} querySelectorAll(s){return s==='img'?this.children.flatMap(c=>c.tag==='img'?[c]:c.querySelectorAll(s)):[]} querySelector(s){return map[s]||null} contains(){return false}
}
const root=new Element(), viewport=new Element(),track=new Element(),pause=new Element(),map={'.st-film-viewport':viewport,'.st-film-track':track,'.st-film-pause':pause};
viewport.getBoundingClientRect=()=>({top:0,height:200});
const doc=new Element();doc.querySelector=()=>root;doc.createElement=t=>new Element(t);doc.hidden=false;
const media={};let queue=new Map(),id=0,clock=1000;
const box={document:doc,window:new Element(),matchMedia:q=>media[q]??=(Object.assign(new Element(),{matches:false})),requestAnimationFrame:f=>{queue.set(++id,f);return id},cancelAnimationFrame:i=>queue.delete(i),queueMicrotask:f=>f(),IntersectionObserver:class{constructor(f){this.f=f}observe(){this.f([{isIntersecting:true}])}},ResizeObserver:class{constructor(f){this.f=f}observe(){this.f()}},Math,Number,String};
box.window.shutterTrendsPhotos=[{src:'test.webp',alt:'Photo',width:600,height:400}];
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
const middle=()=>{viewport.emit('keydown',{key:'Home',preventDefault(){}});viewport.emit('keydown',{key:'ArrowDown',preventDefault(){}})};
const steer=y=>viewport.emit('pointermove',{pointerType:'mouse',clientY:y});
middle();steer(0);advance(90);let start=position();advance(15);const fast=position()-start;assert(fast>10,'top accelerates upward');
middle();steer(100);advance(150);start=position();advance(15);const slow=position()-start;assert(slow>0&&slow<fast/3,'center crawls');
middle();steer(200);advance(90);start=position();advance(15);assert(position()<start-10,'bottom moves downward');
viewport.emit('pointerleave');advance(120);start=position();advance(15);assert(position()>start,'exit resumes automatic direction');
pause.emit('click');steer(0);start=position();advance(100);assert.equal(position(),start,'pause blocks cursor motion');pause.emit('click');
middle();steer(0);let cursorUp=false,cursorDown=false;previous=position();for(let i=0;i<6000;i++){advance(1);const now=position();assert(now>=0&&now<=400);if(now>previous+.001)cursorUp=true;if(now<previous-.001)cursorDown=true;previous=now}assert(cursorUp&&cursorDown,'held cursor reverses at boundaries');
fine.matches=false;fine.emit('change');middle();steer(200);advance(120);start=position();advance(15);assert(position()>start,'touch-only ignores cursor tracking');
console.log('PASS: cursor speed zones, center crawl, direction, exit autoplay, paused cursor, boundary reflection, touch-only tracking disabled');
console.log('PASS: automatic Y motion, boundaries/reversals, one RAF, pause/resume, hidden/reduced motion, initialization guard');
const data={window:{},document:{currentScript:{src:'https://example.com/shuttertrends/assets/photography/collections.js'}},URL,Math,console};
for(const f of ['assets/site-config.js','assets/photography/photos.js','assets/photography/optimized.js','assets/photography/collections.js','assets/photography/stories-data.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),data);
const all=data.window.shutterTrendsPortfolio.flatMap(c=>c.photos);assert.equal(all.length,96);for(const p of all){assert(p.src.includes('/shuttertrends/assets/images/optimized/'));assert(p.width>0&&p.height>0)}
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
