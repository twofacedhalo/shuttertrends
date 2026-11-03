(() => {
 'use strict';
 const strip = document.querySelector('[data-st-event-strip]');
 if (!strip) return;
 const events = (window.shutterTrendsPortfolio || []).filter(c =>
   (c.id === 'events' || ['events','concerts','personal-events'].includes(c.category)) && c.photos.length);
 strip.style.setProperty('--event-count', events.length);
 const panels = [];
 let selected = null;
 const hint = document.getElementById('st-event-strip-hint');
 const touch = matchMedia('(hover: none)');
 function updateHint() { if (hint) hint.textContent = touch.matches ? 'Tap a photograph to expand it.' : 'Hover to explore. Click a photograph to keep it expanded.'; }
 updateHint();
 touch.addEventListener('change', updateHint);
 function select(panel, interacting = true) {
   strip.classList.toggle('is-interacting', interacting);
   panels.forEach(item => item.classList.toggle('is-active', item === panel));
 }
 events.forEach((collection, index) => {
   const photo = collection.photos.find(p => p.id === collection.coverPhotoId) || collection.photos.find(p => p.showcaseSrc) || collection.photos[0];
   const title = collection.id === 'community-atrium' ? 'Red Cross Blood Drive' : collection.title;
   const panel = document.createElement('button');
   panel.type = 'button';
   panel.className = 'st-event-panel';
   panel.setAttribute('aria-label', title);
   panel.setAttribute('aria-pressed', 'false');
   panel.setAttribute('aria-describedby', 'st-event-strip-hint');
   const image = document.createElement('img');
   image.alt = photo.alt;
   image.decoding = 'async';
   image.loading = index === 0 ? 'eager' : 'lazy';
   if (photo.width) image.width = photo.width;
   if (photo.height) image.height = photo.height;
   image.src = photo.showcaseSrc || photo.src;
   if (photo.showcaseSrcset || photo.srcset) {
     image.srcset = photo.showcaseSrcset || photo.srcset;
     image.sizes = '(max-width:1250px) 100vw, 70vw';
   }
   panel.append(image);
   panels.push(panel);
   strip.append(panel);
   panel.addEventListener('pointerenter', event => {
     if (event.pointerType === 'mouse' && !selected) select(panel);
   });
   panel.addEventListener('focus', () => { if (!selected) select(panel); });
   // Native buttons provide Enter/Space activation on keyboards and one-tap activation on touch.
   panel.addEventListener('click', () => {
     selected = selected === panel ? null : panel;
     panels.forEach(item => {
       const active = item === selected;
       item.setAttribute('aria-pressed', String(active));
       item.classList.toggle('is-selected', active);
     });
     select(selected || panel);
   });
 });
 select(panels[0], false);
 strip.addEventListener('pointerleave', event => {
   if (event.pointerType !== 'mouse') return;
   const focused = panels.find(panel => panel === document.activeElement);
   select(selected || focused || panels[0], Boolean(selected || focused));
 });
 strip.addEventListener('focusout', event => {
   if (!strip.contains(event.relatedTarget)) select(selected || panels[0], Boolean(selected));
 });
})();
