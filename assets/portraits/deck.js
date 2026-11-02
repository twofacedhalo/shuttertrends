(() => {
  'use strict';
  const root = document.querySelector('[data-st-portrait-deck]');
  if (!root || root.dataset.initialized) return;
  const ids = ['import-de66bc7e1013','import-img-1275','import-img-1318'];
  const all = (window.shutterTrendsPortfolio || []).flatMap(c => c.photos);
  const photos = ids.map(id => all.find(p => p.id === id));
  if (photos.some(p => !p?.src)) return;
  root.dataset.initialized = 'true';
  const stack = root.querySelector('.st-portrait-deck__stack');
  const controls = root.querySelector('.st-portrait-deck__controls');
  const counter = root.querySelector('output');
  const previous = root.querySelector('[data-deck-previous]');
  const next = root.querySelector('[data-deck-next]');
  const shuffle = root.querySelector('[data-deck-shuffle]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let order = [0,1,2], pendingOrder = null, timer = 0;
  const cards = photos.map(photo => {
    const card = document.createElement('button'); card.type = 'button'; card.className = 'st-portrait-deck__card';
    card.dataset.photoId = photo.id; card.setAttribute('aria-haspopup','dialog');
    card.setAttribute('aria-label','Open fullscreen photograph: ' + photo.alt);
    const image = document.createElement('img'); image.alt = photo.alt; image.decoding = 'async';
    image.width = photo.width; image.height = photo.height; image.src = photo.src;
    if (photo.srcset) { image.srcset = photo.srcset; image.sizes = '(max-width:700px) 80vw, 640px'; }
    card.append(image); stack.append(card);
    card.addEventListener('click',() => { if (card.dataset.depth === '0' && !pendingOrder) open(photo,card); });
    return card;
  });
  function render() {
    order.forEach((index,depth) => {
      const card = cards[index]; card.dataset.depth = String(depth);
      card.tabIndex = depth === 0 ? 0 : -1; card.inert = depth !== 0;
      card.setAttribute('aria-hidden',String(depth !== 0));
    });
    counter.textContent = String(order[0]+1).padStart(2,'0') + ' / 03';
  }
  function step(amount) {
    if (pendingOrder) return;
    order = amount > 0 ? [order[1],order[2],order[0]] : [order[2],order[0],order[1]];
    const hadCardFocus = cards.includes(document.activeElement);
    render(); if (hadCardFocus) cards[order[0]].focus({preventScroll:true});
  }
  function settle() {
    clearTimeout(timer); timer = 0;
    if (pendingOrder) { order = pendingOrder; pendingOrder = null; render(); }
    root.classList.remove('is-shuffling');
    [previous,next,shuffle].forEach(button=>button.setAttribute('aria-disabled','false'));
  }
  previous.addEventListener('click',()=>step(-1)); next.addEventListener('click',()=>step(1));
  shuffle.addEventListener('click',()=>{
    if (pendingOrder) return;
    const result = [...order];
    for (let i=2;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
    if (result.every((value,index)=>value===order[index])) result.push(result.shift());
    pendingOrder = result;
    if (reduced.matches) settle();
    else {
      [previous,next,shuffle].forEach(button=>button.setAttribute('aria-disabled','true'));
      root.classList.add('is-shuffling'); timer = setTimeout(settle,240);
    }
  });
  root.addEventListener('keydown',event=>{
    if (event.ctrlKey || event.metaKey || event.altKey || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1);
  });
  reduced.addEventListener('change',()=>{ if (reduced.matches) settle(); });
  window.addEventListener('pagehide',settle);

  // This page-local single-image viewer never calls gallery or story navigation.
  const viewer = document.createElement('dialog'); viewer.className = 'st-portrait-deck-viewer';
  viewer.setAttribute('aria-label','Portrait photograph');
  const image = document.createElement('img'); image.decoding = 'async';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'st-portrait-deck-viewer__close';
  close.setAttribute('aria-label','Close portrait photograph'); close.textContent = '\u00d7';
  const status = document.createElement('p'); status.className = 'st-portrait-deck-viewer__status'; status.setAttribute('role','status');
  viewer.append(image,close,status); document.body.append(viewer);
  let saved = null;
  function open(photo,trigger) {
    if (viewer.open || saved) return;
    saved = {trigger,x:window.scrollX,y:window.scrollY,body:document.body.style.overflow,html:document.documentElement.style.overflow};
    image.alt = photo.alt; status.textContent = 'Loading photograph...';
    image.onload = () => { status.textContent = ''; };
    image.onerror = () => { status.textContent = 'This photograph could not load. Please close the viewer and try again.'; };
    image.src = photo.fullSrc || photo.src;
    document.body.style.overflow = document.documentElement.style.overflow = 'hidden';
    viewer.showModal(); close.focus({preventScroll:true});
  }
  close.addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',event=>{ if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown',event=>{ if (event.key === 'Tab') { event.preventDefault(); close.focus({preventScroll:true}); } });
  viewer.addEventListener('close',()=>{
    if (!saved) return;
    const state = saved; saved = null;
    document.body.style.overflow = state.body; document.documentElement.style.overflow = state.html;
    state.trigger.focus({preventScroll:true}); window.scrollTo({left:state.x,top:state.y,behavior:'instant'});
    image.onload = image.onerror = null; image.removeAttribute('src');
  });
  render(); controls.hidden = false;
})();
