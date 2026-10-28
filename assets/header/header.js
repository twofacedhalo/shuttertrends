(() => {
  'use strict';
  const header = document.querySelector('[data-st-header]');
  if (!header) return;
  const root = new URL('../../', document.currentScript.src);
  const panel = header.querySelector('[data-st-nav]');
  const toggle = header.querySelector('[data-st-menu-toggle]');
  const mobile = matchMedia('(max-width: 1000px)');
  const links = [...panel.querySelectorAll('a')];
  let opened = false;
  header.dataset.enhanced = 'true';
  const portfolio = window.shutterTrendsPortfolio || [];
  const config = window.shutterTrendConfig?.navigation || {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const groups = new Map();
  let activeMega = null, hoverClose = 0;
  function setMega(key, open, restore = false, immediate = false) {
    const group = groups.get(key);
    if (!group) return;
    clearTimeout(group.closeTimer);
    if (open) {
      if (activeMega && activeMega !== key) setMega(activeMega,false,false,true);
      group.prepare(); group.panel.hidden = false; group.panel.inert = false;
      activeMega = key;
      requestAnimationFrame(()=>{if(activeMega===key)group.panel.dataset.open='true';});
    } else {
      if (activeMega === key) activeMega = null;
      group.panel.dataset.open = 'false'; group.panel.inert = true;
      if (immediate || reduced.matches) group.panel.hidden = true;
      else group.closeTimer = setTimeout(()=>{if(activeMega!==key)group.panel.hidden=true;},200);
    }
    group.button.setAttribute('aria-expanded',String(open));
    group.button.setAttribute('aria-label',(open?'Hide ':'Show ')+key[0].toUpperCase()+key.slice(1)+' collections');
    if (restore) group.button.focus();
  }
  function closeMegas(immediate = false) { if (activeMega) setMega(activeMega,false,false,immediate); }
  header.querySelectorAll('[data-st-nav-section]').forEach(element=>{
    const key=element.dataset.stNavSection, button=element.querySelector('.st-submenu-toggle'), box=element.querySelector('.st-mega-panel');
    const entries=(config[key]||[]).map(entry=>{
      const collection=portfolio.find(c=>c.id===entry.collectionId);
      const photo=collection?.photos.find(p=>p.id===entry.photoId)||collection?.photos[0];
      return collection&&photo?{...entry,collection,photo}:null;
    }).filter(Boolean);
    if(!entries.length)return;
    button.hidden=false;
    const group={element,button,panel:box,closeTimer:0,prepare(){
      if(box.dataset.prepared)return;
      box.dataset.prepared='true';box.style.setProperty('--st-mega-cols',String(Math.min(entries.length,4)));
      for(const entry of entries){
        const link=document.createElement('a');link.className='st-mega-card st-preview-frame';link.href=entry.collection.url;
        const image=document.createElement('img');image.alt=entry.photo.alt;image.loading='lazy';image.decoding='async';image.width=entry.photo.width;image.height=entry.photo.height;image.src=entry.photo.thumbnail||entry.photo.src;
        image.onerror=()=>{image.hidden=true;};
        const label=document.createElement('span');label.textContent=entry.title;
        link.append(image,label);box.querySelector('[data-st-mega-grid]').append(link);
      }
    }};
    groups.set(key,group);
    button.addEventListener('click',()=>setMega(key,activeMega!==key));
    element.addEventListener('pointerenter',event=>{if(!mobile.matches&&event.pointerType==='mouse'){clearTimeout(hoverClose);setMega(key,true);}});
    element.addEventListener('pointerleave',()=>{if(!mobile.matches){clearTimeout(hoverClose);hoverClose=setTimeout(()=>{if(!element.contains(document.activeElement))setMega(key,false);},180);}});
    element.querySelector('.st-nav__link').addEventListener('focus',()=>{if(!mobile.matches)setMega(key,true);});
    element.addEventListener('keydown',event=>{if(event.key==='ArrowDown'&&(event.target===button||event.target.classList.contains('st-nav__link'))){event.preventDefault();setMega(key,true);box.querySelector('a')?.focus();}});
  });
  header.addEventListener('focusin',event=>{if(activeMega&&!groups.get(activeMega).element.contains(event.target))closeMegas();});

  function setOpen(open, restoreFocus = false) {
    if (!open) closeMegas(true);
    opened = mobile.matches && open;
    panel.hidden = mobile.matches && !opened;
    toggle.hidden = !mobile.matches;
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.setAttribute('aria-label', opened ? 'Close menu' : 'Open menu');
    toggle.querySelector('[data-menu-open]').hidden = opened;
    toggle.querySelector('[data-menu-close]').hidden = !opened;
    if (restoreFocus && mobile.matches) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    setOpen(!opened);
    if (opened) links[0]?.focus();
  });
  toggle.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && mobile.matches) {
      event.preventDefault(); setOpen(true); links[0]?.focus();
    }
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeMega) { event.preventDefault(); setMega(activeMega,false,true); }
    else if (event.key === 'Escape' && opened) { event.preventDefault(); setOpen(false, true); }
  });
  panel.addEventListener('click', event => {
    if (event.target.closest('a') && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) setOpen(false);
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) { closeMegas(); if(opened)setOpen(false); } });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && header.contains(event.relatedTarget)) return;
    // A microtask can run between blur and focus during a pointer click. Wait for
    // native focus transfer before deciding that the visitor has left the menu.
    setTimeout(() => { if (opened && !header.contains(document.activeElement)) setOpen(false); }, 0);
  });
  mobile.addEventListener('change', () => {
    const hadPanelFocus = panel.contains(document.activeElement);
    const hadToggleFocus = document.activeElement === toggle;
    setOpen(false);
    if (mobile.matches && hadPanelFocus) toggle.focus();
    else if (!mobile.matches && hadToggleFocus) links[0]?.focus();
  });
  window.addEventListener('pagehide', () => setOpen(false));
  const path = url => new URL(url, root).pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
  const current = path(location.href);
  const collection = (window.shutterTrendsPortfolio || []).find(c => c.id === new URLSearchParams(location.search).get('id'));
  const parentCategory = ['concerts','events','personal-events'].includes(collection?.category) ? 'events' : ['portraits','weddings'].includes(collection?.categoryGroup || collection?.category) ? 'portraits' : collection?.category;
  header.querySelectorAll('.st-nav__link').forEach(link => {
    link.removeAttribute('aria-current');
    if (path(link.href) === current) link.setAttribute('aria-current', 'page');
    else if (collection && ['portraits','events'].includes(parentCategory) && path(link.href) === path(parentCategory + '/')) link.setAttribute('aria-current', 'location');
  });
  if (current === path(root.href)) header.querySelector('.st-brand').setAttribute('aria-current', 'page');
  setOpen(false);
})();
