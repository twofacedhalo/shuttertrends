const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Target {
 constructor(){this.listeners=new Map()}
 addEventListener(type,fn,options={}){let list=this.listeners.get(type);if(!list)this.listeners.set(type,list=new Set());list.add(fn);options.signal?.addEventListener('abort',()=>list.delete(fn),{once:true});}
 emit(type){for(const fn of [...(this.listeners.get(type)||[])])fn()}
}
const win=new Target();win.scrollY=0;const doc=new Target();doc.hidden=false;let bodyHeight=5000,reads=0,writes=0;
const values=new Map(),header={dataset:{},style:{setProperty:(k,v)=>{values.set(k,v);writes++}}};
doc.querySelector=()=>header;doc.body={getBoundingClientRect(){reads++;return {top:-win.scrollY,height:bodyHeight}}};
let pending=new Map(),next=0,observer;
const box={window:win,document:doc,Math,AbortController,requestAnimationFrame:fn=>{pending.set(++next,fn);return next},cancelAnimationFrame:id=>pending.delete(id),ResizeObserver:class{constructor(fn){observer=this;this.fn=fn}observe(){this.connected=true}disconnect(){this.connected=false}}};
vm.runInNewContext(fs.readFileSync('assets/header/gradient.js','utf8'),box);
const flush=()=>{assert(pending.size<=1,'one coalesced RAF');const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn());};
assert.equal(values.get('--st-header-gradient-height'),'5000px');assert.equal(values.get('--st-header-gradient-y'),'0px');
win.scrollY=1600;for(let i=0;i<100;i++)win.emit('scroll');assert.equal(pending.size,1);const initialReads=reads;flush();assert.equal(values.get('--st-header-gradient-y'),'-1600px');assert.equal(reads,initialReads,'no body layout reads during scroll');
win.scrollY=400;win.emit('scroll');flush();assert.equal(values.get('--st-header-gradient-y'),'-400px','upward scrolling reverses directly');
const idleWrites=writes;flush();assert.equal(writes,idleWrites);assert.equal(pending.size,0,'no continuous animation');
bodyHeight=6200;observer.fn();flush();assert.equal(values.get('--st-header-gradient-height'),'6200px');
win.scrollY=2000;win.emit('scroll');win.emit('pagehide');assert.equal(pending.size,0);assert(!observer.connected);win.emit('scroll');assert.equal(pending.size,0,'listeners removed while inactive');
win.emit('pageshow');win.emit('pageshow');assert(observer.connected);assert.equal(values.get('--st-header-gradient-y'),'-2000px');assert.equal(win.listeners.get('scroll').size,1,'one listener after restore');
doc.hidden=true;doc.emit('visibilitychange');win.scrollY=3000;win.emit('scroll');assert.equal(pending.size,0);doc.hidden=false;doc.emit('visibilitychange');flush();assert.equal(values.get('--st-header-gradient-y'),'-3000px');
console.log('PASS: actual document band, reverse scrolling, one queued frame, no scroll layout reads, idle stability, resize, hidden state, cleanup and restore');
