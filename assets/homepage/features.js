(() => {
  'use strict';
  const collections=window.shutterTrendsPortfolio||[];
  const config=window.shutterTrendsHomeFeatures||{};
  const photos=new Map(collections.flatMap(c=>c.photos).map(p=>[p.id,p]));
  const categories={events:['events','concerts','personal-events','lynchburg'],personal:['portraits'],weddings:['weddings'],graduations:['graduations']};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width: 1000px)');
  const states=[];let active=null,alive=true;
  function preservePosition(anchor,update){
    if(!anchor)return update();
    const scroll=window.scrollY,before=anchor.getBoundingClientRect().top+scroll;
    update();
    const after=anchor.getBoundingClientRect().top+window.scrollY;
    if(Math.abs(after-before)>.5)window.scrollTo({top:Math.max(0,scroll+after-before),behavior:'instant'});
  }
  function image(photo,extra=false){
    const frame=document.createElement(extra?'div':'button');frame.className='st-home-feature__photo'+(extra?'':' st-home-feature__toggle');if(!extra)frame.type='button';frame.dataset.photoId=photo.id;
    const img=document.createElement('img');img.alt=photo.alt;img.loading='lazy';img.decoding='async';img.draggable=false;
    if(photo.width)img.width=photo.width;if(photo.height)img.height=photo.height;
    if(photo.srcset){img.srcset=photo.srcset;img.sizes=extra?'(max-width:1000px) calc(88vw - 40px), 240px':'(max-width:1000px) calc(100vw - 44px), 784px';}
    img.src=extra?(photo.thumbnail||photo.src):photo.src;
    img.addEventListener('error',()=>{
      if(!img.dataset.fallback){img.dataset.fallback='true';img.removeAttribute('srcset');img.src=photo.src;}
      else{const note=document.createElement('span');note.className='st-home-feature__unavailable';note.textContent='Photograph unavailable';frame.replaceChildren(note);}
    });
    frame.append(img);return frame;
  }
  function setOpen(state,open,animate=true){
    if(state.open===open)return;
    const height=state.viewport.getBoundingClientRect().height;
    state.animation?.cancel();state.animation=null;
    if(open&&!state.prepared){state.selection.slice(1).forEach(p=>state.viewport.append(image(p,true)));state.prepared=true;}
    if(!open&&state.viewport.contains(document.activeElement))state.button.focus({preventScroll:true});
    state.open=open;state.card.dataset.expanded=String(open);
    state.button.setAttribute('aria-expanded',String(open));
    state.button.setAttribute('aria-label',(open?'Collapse':'Expand')+' '+state.title+' photographs');
    state.viewport.setAttribute('aria-label',state.title+' photographs'+(open?' — swipe or scroll horizontally on smaller screens':''));
    state.viewport.tabIndex=open&&compact.matches?0:-1;
    if(!open){state.viewport.scrollLeft=0;if(active===state)active=null;}else active=state;
    const target=state.viewport.getBoundingClientRect().height;
    if(animate&&!reduced.matches&&typeof state.viewport.animate==='function'&&Math.abs(target-height)>.5){
      const animation=state.viewport.animate([{height:height+'px'},{height:target+'px'}],{duration:360,easing:'cubic-bezier(.2,.65,.25,1)'});
      state.animation=animation;animation.onfinish=()=>{if(state.animation===animation)state.animation=null;};
    }
  }
  function toggle(state){
    if(!alive)return;
    preservePosition(state.card,()=>{
      if(active&&active!==state)setOpen(active,false,false);
      setOpen(state,!state.open);
    });
    if(state.open){
      // Keep the featured photograph below the sticky header after expansion.
      const top=state.viewport.getBoundingClientRect().top;
      const headerBottom=document.querySelector('[data-st-header]')?.getBoundingClientRect().bottom||0;
      if(top<headerBottom+12)window.scrollTo({top:Math.max(0,window.scrollY+top-headerBottom-12),behavior:reduced.matches?'instant':'smooth'});
    }
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){const state=states.find(s=>s.card===entry.target);if(!state?.open||entry.isIntersecting||state.horizontal)continue;
      const above=state.card.getBoundingClientRect().bottom<0;
      const anchor=above?(state.card.nextElementSibling||state.card.parentElement.nextElementSibling):null;
      preservePosition(anchor,()=>setOpen(state,false,false));
    }
  },{threshold:0,rootMargin:'120px 0px 120px 0px'});
  document.querySelectorAll('[data-st-home-feature]').forEach(viewport=>{
    const key=viewport.dataset.stHomeFeature,card=viewport.closest('.st-home-feature');
    if(!card)return;
    const configured=(config[key]||[]).map(id=>photos.get(id)).filter(Boolean);
    const candidates=[...configured,...collections.filter(c=>categories[key]?.includes(c.category)).flatMap(c=>c.photos)];
    const ids=new Set(),sources=new Set(),selection=[];
    for(const photo of candidates){if(ids.has(photo.id)||sources.has(photo.src))continue;ids.add(photo.id);sources.add(photo.src);selection.push(photo);if(selection.length===4)break;}
    if(!selection.length)return;
    // A shared frame close to the collection's typical proportions minimizes letterboxing.
    // Contain still preserves the complete photograph for every mixed-orientation image.
    const ratios=selection.map(p=>p.width/p.height).filter(r=>Number.isFinite(r)&&r>0).sort((a,b)=>a-b);
    const middle=Math.floor(ratios.length/2);
    const aspect=ratios.length?(ratios[middle]+ratios[Math.max(0,Math.ceil(ratios.length/2)-1)])/2:1.5;
    viewport.style.setProperty('--st-feature-aspect',String(Math.max(1,Math.min(1.5,aspect))));
    viewport.replaceChildren(image(selection[0]));viewport.style.setProperty('--st-feature-count',String(selection.length));viewport.id='st-feature-gallery-'+key;viewport.setAttribute('role','group');viewport.tabIndex=-1;
    const title=card.querySelector('h2').textContent,button=viewport.firstElementChild;
    button.disabled=selection.length<2;button.setAttribute('aria-controls',viewport.id);button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-label',`Expand ${title} photographs`);
    card.dataset.expandable=String(selection.length>1);card.dataset.expanded='false';
    const state={card,button,viewport,title,selection,open:false,prepared:false,animation:null,horizontal:false,pointer:null,suppressUntil:0};states.push(state);
    viewport.setAttribute('aria-label',title+' photographs');observer.observe(card);
    card.addEventListener('pointerdown',event=>{if(event.button!==0)return;state.pointer={id:event.pointerId,x:event.clientX,y:event.clientY};state.horizontal=false;});
    card.addEventListener('pointermove',event=>{if(!state.pointer||event.pointerId!==state.pointer.id)return;const dx=Math.abs(event.clientX-state.pointer.x),dy=Math.abs(event.clientY-state.pointer.y);if(dx>8||dy>8){state.suppressUntil=performance.now()+400;state.horizontal=dx>dy;}});
    const release=()=>{if(state.pointer&&state.horizontal)state.suppressUntil=performance.now()+400;state.pointer=null;state.horizontal=false;};
    card.addEventListener('pointerup',release);card.addEventListener('pointercancel',release);card.addEventListener('lostpointercapture',release);
    button.addEventListener('click',event=>{
      if(event.defaultPrevented||selection.length<2||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
      if(event.detail>0&&performance.now()<state.suppressUntil)return;
      const interactive=event.target.closest('a,button,input,select,textarea');if(interactive&&interactive!==button)return;
      toggle(state);
    });
    viewport.addEventListener('keydown',event=>{
      if(!state.open||!compact.matches||event.target!==viewport)return;
      if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();viewport.scrollBy({left:(event.key==='ArrowRight'?1:-1)*viewport.clientWidth*.88,behavior:reduced.matches?'instant':'smooth'});}
      else if(event.key==='Escape'){event.preventDefault();setOpen(state,false);button.focus({preventScroll:true});}
    });
    viewport.addEventListener('scroll',()=>{if(state.open)state.suppressUntil=performance.now()+200;},{passive:true});
  });
  function releasePointers(){for(const state of states){if(state.pointer&&state.horizontal)state.suppressUntil=performance.now()+400;state.pointer=null;state.horizontal=false;}}
  window.addEventListener('pointerup',releasePointers,{passive:true});
  window.addEventListener('pointercancel',releasePointers,{passive:true});
  compact.addEventListener('change',()=>{for(const s of states){s.animation?.cancel();s.viewport.tabIndex=s.open&&compact.matches?0:-1;}});
  reduced.addEventListener('change',()=>{if(reduced.matches)states.forEach(s=>s.animation?.cancel());});
  window.addEventListener('pagehide',()=>{alive=false;observer.disconnect();states.forEach(s=>s.animation?.cancel());});
  window.addEventListener('pageshow',()=>{alive=true;states.forEach(s=>observer.observe(s.card));});
})();
