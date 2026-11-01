(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const collections = (window.shutterTrendsPortfolio || []).filter(c => c.photos.length);
  const photos = new Map(collections.flatMap(c => c.photos).map(p => [p.id, p]));
  const labels = { portraits:'Portraits', weddings:'Weddings', concerts:'Live music', events:'Events', 'personal-events':'Personal moments', lynchburg:'Local stories' };
  const collectionStories = new Map(collections.map(c => [c.id, { id:'collection:' + c.id, title:c.title, category:labels[c.category] || c.category, description:c.description || '', collectionId:c.id, photos:c.photos, url:c.url }]));
  const curated = (window.shutterTrendStoryDefinitions || []).map(s => ({ ...s, photos:[...new Set(s.photoIds)].map(id => photos.get(id)).filter(Boolean), url:new URL('collections/?story=' + encodeURIComponent(s.id), root).href })).filter(s => s.photos.length);
  const signatures = new Set(curated.map(s => s.photos.map(p => p.id).sort().join('|')));
  const stories = [...curated, ...collectionStories.values()].filter((s,i) => i < curated.length || !signatures.has(s.photos.map(p => p.id).sort().join('|')));
  const byId = new Map([...collectionStories.values(), ...curated].map(s => [s.id,s]));
  const text = (tag,value,cls) => { const e = document.createElement(tag); e.textContent = value; if (cls) e.className = cls; return e; };

  const dialog = document.createElement('dialog'); dialog.className = 'st-story-viewer';
  dialog.setAttribute('aria-labelledby','st-story-viewer-title');
  dialog.innerHTML = '<div class="st-story-viewer__bar"><h2 id="st-story-viewer-title"></h2><p class="st-story-counter" aria-live="polite"></p><button type="button" data-story-close aria-label="Close photo viewer">×</button></div><div class="st-story-viewer__body"><button type="button" data-story-prev aria-label="Previous photograph">←</button><div class="st-story-viewer__stage"></div><button type="button" data-story-next aria-label="Next photograph">→</button></div><p class="st-story-viewer__caption"></p><p class="st-story-viewer__status" role="status"></p>';
  document.body.append(dialog);
  const stage = dialog.querySelector('.st-story-viewer__stage');
  const title = dialog.querySelector('h2');
  const counter = dialog.querySelector('.st-story-counter');
  const status = dialog.querySelector('[role="status"]');
  const previous = dialog.querySelector('[data-story-prev]');
  const next = dialog.querySelector('[data-story-next]');
  let current, index = 0, request = 0, returnFocus, bodyOverflow, swipe;

  async function show(destination) {
    if (!current) return;
    index = (destination + current.photos.length) % current.photos.length;
    const photo = current.photos[index], token = ++request;
    title.textContent = current.title;
    counter.textContent = `${index + 1} / ${current.photos.length}`;
    previous.hidden = next.hidden = current.photos.length < 2;
    status.textContent = 'Loading photograph…'; stage.setAttribute('aria-busy','true');
    const image = document.createElement('img'); image.alt = photo.alt; image.decoding = 'async';
    if (photo.width) image.width = photo.width;
    if (photo.height) image.height = photo.height;
    image.onload = async () => {
      try { await image.decode(); } catch {}
      if (token !== request || !dialog.open) return;
      stage.replaceChildren(image); stage.setAttribute('aria-busy','false');
      dialog.querySelector('.st-story-viewer__caption').textContent = [photo.title,photo.caption,photo.location].filter(Boolean).join(' · ');
      status.textContent = '';
    };
    image.onerror = () => { if (token === request) { status.textContent = 'This photograph could not load. Try another frame.'; stage.setAttribute('aria-busy','false'); } };
    image.src = photo.fullSrc || photo.src;
  }
  function open(id, start = 0, trigger = document.activeElement) {
    const story = byId.get(id);
    if (!story?.photos.length) return false;
    current = story; returnFocus = trigger;
    if (!dialog.open) {
      bodyOverflow = document.body.style.overflow;
      document.dispatchEvent(new CustomEvent('st-lightbox-open'));
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    }
    show(Math.max(0,Math.min(start,story.photos.length-1)));
    dialog.querySelector('[data-story-close]').focus();
    return true;
  }
  dialog.querySelector('[data-story-close]').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => show(index - 1)); next.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('close', () => {
    request++; document.body.style.overflow = bodyOverflow || '';
    document.dispatchEvent(new CustomEvent('st-lightbox-close'));
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = { ArrowLeft:index-1, ArrowRight:index+1, Home:0, End:(current?.photos.length || 1)-1 };
    if (event.key in destinations) { event.preventDefault(); show(destinations[event.key]); }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    swipe = {x:event.clientX,y:event.clientY}; stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!swipe) return;
    const dx = event.clientX-swipe.x, dy = event.clientY-swipe.y; swipe = null;
    if (Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) show(index + (dx<0?1:-1));
  });
  stage.addEventListener('pointercancel', () => { swipe = null; });

  function imageLink(story,photo,i,cls) {
    const link = document.createElement('a'); link.href = story.url; link.className = cls;
    link.setAttribute('aria-label', `Open ${story.title}, photograph ${i+1} of ${story.photos.length}: ${photo.alt}`);
    const image = document.createElement('img'); image.alt = photo.alt; image.loading = 'lazy'; image.decoding = 'async';
    if (photo.width) image.width = photo.width;
    if (photo.height) image.height = photo.height;
    image.src = photo.thumbnail || photo.src;
    link.append(image); bind(link,story.id,i); return link;
  }
  function bind(link,id,i = 0) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (open(id,i,link)) event.preventDefault();
    });
  }
  function card(story) {
    const article = document.createElement('article'); article.className = 'st-story-card'; article.dataset.storyId = story.id; article.dataset.storySize = story.photos.length;
    const collage = document.createElement('div'); collage.className = 'st-story-collage';
    story.photos.slice(0,4).forEach((photo,i) => collage.append(imageLink(story,photo,i,i===0?'st-story-lead':'st-story-support')));
    const copy = document.createElement('div'); copy.className = 'st-story-copy';
    const category = text('p',story.category,'st-story-category');
    const heading = document.createElement('h3');
    const link = text('a',story.title); link.href = story.url; bind(link,story.id); heading.append(link);
    const kind = story.photos.length===1?'Single frame':story.photos.length<=5?'Mini Photo Story':'Photo Story';
    const count = text('p',`${kind} · ${story.photos.length} ${story.photos.length===1?'photograph':'photographs'}`,'st-story-count');
    copy.append(category,heading,count);
    if (story.description) copy.append(text('p',story.description,'st-story-description'));
    const view = text('a','View story ↗','st-story-view'); view.href = story.url; bind(view,story.id); copy.append(view);
    article.append(collage,copy);
    article.addEventListener('click',event => { if (!event.target.closest('a,button,summary,details')) open(story.id,0,view); });
    if (story.photos.length>=6) {
      const details = document.createElement('details'); details.className = 'st-story-expand';
      details.append(text('summary',`Browse all ${story.photos.length} frames`));
      let populated = false;
      details.addEventListener('toggle', () => {
        if (!details.open || populated) return; populated = true;
        const grid = document.createElement('div'); grid.className = 'st-story-expanded';
        story.photos.forEach((photo,i) => grid.append(imageLink(story,photo,i,''))); details.append(grid);
      });
      article.append(details);
    }
    return article;
  }
  function hub(container) {
    const toolbar = document.createElement('div'); toolbar.className = 'st-story-toolbar';
    const label = text('label','Browse stories by category');
    const select = document.createElement('select'); select.setAttribute('aria-label','Story category');
    const all = text('option','All categories'); all.value = ''; select.append(all);
    [...new Set(stories.map(s=>s.category))].sort().forEach(c => { const o=text('option',c); o.value=c; select.append(o); });
    label.append(select); const results=text('p','','st-story-results'); results.setAttribute('role','status'); toolbar.append(label,results);
    const grid = document.createElement('div'); grid.className = 'st-story-grid';
    const more = text('button','Show more stories','st-story-more'); more.type = 'button';
    let limit=12, filtered=stories;
    function render() { grid.replaceChildren(...filtered.slice(0,limit).map(card)); results.textContent = `${filtered.length} stories`; more.hidden = limit>=filtered.length; }
    select.addEventListener('change', () => { filtered=stories.filter(s=>!select.value||s.category===select.value); limit=12; render(); });
    more.addEventListener('click', () => { limit+=12; render(); });
    container.append(toolbar,grid,more); render();
  }
  window.shutterTrendsOpenStory = open;
  window.shutterTrendsStoryCard = collection => { const story=collectionStories.get(collection.id); return story?card(story):null; };
  window.shutterTrendsRenderStories = hub;
  window.shutterTrendsOpenPhotoStory = (collectionId,photoId,trigger) => {
    const story = curated.find(s=>s.collectionId===collectionId&&s.photos.some(p=>p.id===photoId)) || collectionStories.get(collectionId);
    if (!story) return false;
    return open(story.id,Math.max(0,story.photos.findIndex(p=>p.id===photoId)),trigger);
  };
  document.querySelectorAll('[data-st-stories]').forEach(container => {
    const config = window.shutterTrendConfig?.stories || {};
    const selected = (config.featured || curated.map(s=>s.id)).map(id=>byId.get(id)).filter(Boolean);
    container.classList.add('st-story-grid'); container.append(...selected.slice(0,config.homepageLimit || 4).map(card));
  });
  const deepLink = new URLSearchParams(location.search).get('story');
  if (deepLink && byId.has(deepLink)) queueMicrotask(() => open(deepLink));
})();
