(() => {
  'use strict';
  const roots = [...document.querySelectorAll('[data-st-portrait-deck]')];
  if (!roots.length || roots.every(root => root.dataset.initialized)) return;
  const collections = window.shutterTrendsPortfolio || [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  roots.forEach(setup);
  function setup(root) {
    if (root.dataset.initialized) return;
    const collection = collections.find(c => c.id === root.dataset.collectionId);
    if (!collection?.photos.length) return;
    const excluded = new Set((root.dataset.excludedPhotoIds || '').split(',').filter(Boolean));
    const available = collection.photos.filter(photo => !excluded.has(photo.id));
    const selection = (window.shutterTrendStoryDefinitions || []).find(s => s.id === root.dataset.storySelection);
    // Respect the existing curated five-frame lawn sequence, without editing its collection.
    const selected = selection?.photoIds.map(id => available.find(p => p.id === id)).filter(Boolean);
    const photos = selected && selected.length === selection.photoIds.length && selected.length ? selected : available;
    const stack = root.querySelector('.st-portrait-deck__stack');
    const status = root.querySelector('[data-deck-status]');
    root.dataset.initialized = 'true'; root.dataset.photoCount = String(photos.length);
    let order = photos.map((_,i) => i), drag = null, timer = 0, pending = null, blockedUntil = 0;
    const cards = photos.map(photo => {
      const card = document.createElement('button'); card.type = 'button'; card.className = 'st-portrait-deck__card';
      card.dataset.photoId = photo.id; card.setAttribute('aria-haspopup','dialog');
      const image = document.createElement('img'); image.alt = photo.alt; image.decoding = 'async'; image.draggable = false;
      image.width = photo.width; image.height = photo.height; image.loading = 'lazy'; image.src = photo.src;
      if (photo.srcset) { image.srcset = photo.srcset; image.sizes = '(max-width:760px) 85vw, (max-width:1150px) 50vw, 680px'; }
      card.append(image); stack.append(card);
      card.addEventListener('click',event => {
        if (pending || event.detail !== 0 && performance.now() < blockedUntil) { event.preventDefault(); return; }
        const index = cards.indexOf(card);
        if (order[0] === index) open(photo,card);
        else { order = [index,...order.filter(i => i !== index)]; render(true); card.focus({preventScroll:true}); }
      });
      card.addEventListener('pointerdown',event => {
        if (event.button !== 0 || !event.isPrimary || pending || order[0] !== cards.indexOf(card)) return;
        drag = {card,id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,dy:0,horizontal:false};
      });
      card.addEventListener('pointermove',event => {
        if (!drag || event.pointerId !== drag.id) return;
        drag.dx = event.clientX-drag.x; drag.dy = event.clientY-drag.y;
        if (!drag.horizontal) {
          if (Math.abs(drag.dy)>8 && Math.abs(drag.dy)>Math.abs(drag.dx)*1.15) { drag = null; return; }
          if (Math.abs(drag.dx)<8) return;
          drag.horizontal = true; card.setPointerCapture(event.pointerId); card.classList.add('is-dragging');
        }
        if (event.cancelable) event.preventDefault();
        const limit = stack.clientWidth*.8;
        card.style.setProperty('--drag-x',Math.max(-limit,Math.min(limit,drag.dx))+'px');
        card.style.setProperty('--drag-y',Math.max(-14,Math.min(14,drag.dy*.14))+'px');
        card.style.setProperty('--drag-turn',(reduced.matches ? 0 : Math.max(-4,Math.min(4,drag.dx/40)))+'deg');
      });
      card.addEventListener('pointerup',event => {
        if (!drag || event.pointerId !== drag.id) return;
        const state = drag; drag = null;
        if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
        if (!state.horizontal) return; // Let the native short-click open the photograph.
        blockedUntil = performance.now()+500;
        card.classList.remove('is-dragging');
        const threshold = Math.max(48,Math.min(90,stack.clientWidth*.18));
        if (Math.abs(state.dx)>=threshold) {
          pending = [order[1],...order.slice(2),order[0]];
          if (reduced.matches) settle();
          else {
            card.classList.add('is-sending');
            card.style.setProperty('--drag-x',(Math.sign(state.dx)*stack.clientWidth*.7)+'px');
            timer = setTimeout(settle,140);
          }
        } else clearCard(card);
      });
      card.addEventListener('pointercancel',cancelDrag);
      card.addEventListener('lostpointercapture',cancelDrag);
      return card;
    });
    function clearCard(card) {
      card.classList.remove('is-dragging','is-sending');
      ['--drag-x','--drag-y','--drag-turn'].forEach(key=>card.style.removeProperty(key));
    }
    function cancelDrag() {
      if (!drag) return;
      const state = drag; drag = null;
      blockedUntil = performance.now()+500; clearCard(state.card);
      if (state.card.hasPointerCapture(state.id)) state.card.releasePointerCapture(state.id);
    }
    function render(announce = false) {
      const focused = cards.includes(document.activeElement);
      order.forEach((index,depth)=>{
        const card = cards[index]; card.dataset.depth = String(depth);
        card.hidden = depth>3; card.tabIndex = depth===0 ? 0 : -1;
        if (depth===0) card.setAttribute('aria-haspopup','dialog'); else card.removeAttribute('aria-haspopup');
        card.setAttribute('aria-label',(depth===0 ? 'Open fullscreen photograph: ' : 'Bring photograph to front: ')+photos[index].alt);
      });
      if (focused) cards[order[0]].focus({preventScroll:true});
      if (announce) status.textContent = 'Photograph '+(order[0]+1)+' of '+photos.length+': '+photos[order[0]].alt;
    }
    function settle() {
      clearTimeout(timer); timer = 0;
      if (pending) { order = pending; pending = null; }
      cards.forEach(clearCard); render(true);
    }
    stack.addEventListener('keydown',event=>{
      if (event.ctrlKey || event.metaKey || event.altKey || pending || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault(); cancelDrag();
      order = event.key==='ArrowRight' ? [order[1],...order.slice(2),order[0]] : [order[order.length-1],...order.slice(0,-1)];
      render(true);
    });
    reduced.addEventListener('change',()=>{ if (reduced.matches) { cancelDrag(); settle(); } });
    window.addEventListener('pagehide',()=>{ cancelDrag(); settle(); });
    render();
  }

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
})();
