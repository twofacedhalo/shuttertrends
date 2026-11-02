(() => {
 'use strict';
 const strip = document.querySelector('[data-st-event-strip]');
 if (!strip) return;
 const events = (window.shutterTrendsPortfolio || []).filter(c =>
   (c.id === 'events' || ['events','concerts','personal-events'].includes(c.category)) && c.photos.length);
 strip.style.setProperty('--event-count', events.length);
 const panels = [];
 let touchSelection = null;
 let pointerType = '';
 function text(tag, value, className) {
   const el = document.createElement(tag);
   el.textContent = value;
   if (className) el.className = className;
   return el;
 }
 function select(panel, interacting = true) {
   strip.classList.toggle('is-interacting', interacting);
   panels.forEach(item => item.classList.toggle('is-active', item === panel));
 }
 events.forEach((collection, index) => {
   const photo = collection.photos.find(p => p.id === collection.coverPhotoId) || collection.photos.find(p => p.showcaseSrc) || collection.photos[0];
   const panel = document.createElement('a');
   panel.className = 'st-event-panel';
   panel.href = collection.url;
   panel.setAttribute('aria-label', 'Explore event: ' + collection.title);
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
   const copy = text('div', '', 'st-event-panel__copy');
   copy.append(text('h3', collection.title));
   const more = text('div', '', 'st-event-panel__more');
   const inner = document.createElement('div');
   if (collection.date || collection.location) inner.append(text('p', [collection.date,collection.location].filter(Boolean).join(' · '), 'st-event-panel__details'));
   if (collection.description) inner.append(text('p', collection.description, 'st-event-panel__description'));
   inner.append(text('span', 'Explore Event ↗', 'st-event-panel__explore'));
   more.append(inner);
   copy.append(more);
   panel.append(image,copy);
   panels.push(panel);
   strip.append(panel);
   panel.addEventListener('pointerenter', event => {
     if (event.pointerType === 'mouse') select(panel);
   });
   panel.addEventListener('pointerdown', event => { pointerType = event.pointerType; });
   panel.addEventListener('focus', () => select(panel));
   panel.addEventListener('click', event => {
     if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
     const touch = pointerType === 'touch' || pointerType === 'pen' ||
       (event.detail > 0 && !matchMedia('(hover:hover)').matches);
     if (touch && touchSelection !== panel) {
       event.preventDefault();
       touchSelection = panel;
       select(panel);
     }
     pointerType = '';
   });
   panel.addEventListener('keydown', event => {
     if (event.key === ' ') {
       event.preventDefault();
       pointerType = '';
       panel.click();
     }
   });
 });
 select(panels[0], false);
 strip.addEventListener('pointerleave', event => {
   if (event.pointerType !== 'mouse') return;
   const focused = panels.find(panel => panel === document.activeElement);
   select(focused || panels[0], Boolean(focused));
 });
 strip.addEventListener('focusout', event => {
   if (!strip.contains(event.relatedTarget)) { touchSelection = null; select(panels[0], false); }
 });
})();
