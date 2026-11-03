(() => {
  'use strict';
  const root = document.querySelector('[data-st-filmstrip]');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const viewport = root.querySelector('.st-film-viewport');
  const track = root.querySelector('.st-film-track');
  const pause = root.querySelector('.st-film-pause');
  const compact = matchMedia('(max-width: 1000px)');
  const mobile = matchMedia('(max-width: 767px)');
  const boundary = root.closest('.st-home-reel-boundary');
  const homeSlot = boundary && document.createComment('Homepage reel position');
  if (boundary) boundary.before(homeSlot);
  // Homepage-only edit: do not change shared gallery eligibility or manifests.
  const sequence = [
    'import-img-3355', 'import-img-1318', 'import-img-6390', 'import-img-1058',
    'import-img-1769', 'import-21a19b7ddebd', 'import-img-4035', 'import-img-3013',
    'import-img-2087', 'import-img-6412', 'import-img-4408', 'import-c684baba4645',
    'import-img-2943', 'import-090ff61ac366', 'import-2dcc214105d1', 'import-img-1517',
    'import-140ab71a21c8', 'import-ebaef69c02bd', 'import-bac1329359c6',
    'import-img-2990', 'import-28cdef691ea0', 'import-e04f8d41b067'
  ];
  const available = new Map((window.shutterTrendsPortfolio || []).flatMap(c => c.photos).map(p => [p.id,p]));
  const sources = new Set();
  const photos = sequence.map(id => available.get(id)).filter(p => {
    if (!p?.src || !p.alt || sources.has(p.src)) return false;
    sources.add(p.src); return true;
  });
  if (!photos.length) { root.hidden = true; return; }
  const group = document.createElement('div'); group.className = 'st-film-group';
  function addFrame(container, photo, i, repeated) {
    const link = document.createElement('button'); link.type = 'button'; link.className = 'st-film-frame';
    link.setAttribute('aria-haspopup','dialog');
    if (repeated) link.tabIndex = -1;
    link.addEventListener('click', () => openPhoto(photo,link));
    link.dataset.collectionId = photo.collectionId || ''; link.dataset.photoId = photo.id || '';
    const mark = document.createElement('span'); mark.className = 'st-film-mark';
    mark.textContent = String(i + 1).padStart(3, '0') + '  SHUTTERTREND'; mark.setAttribute('aria-hidden', 'true');
    const bottom = mark.cloneNode(); bottom.classList.add('st-film-mark--bottom'); bottom.textContent = 'ST — 400 · 35MM';
    const img = document.createElement('img'); img.alt = photo.alt; img.decoding = 'async'; img.loading = i < 2 ? 'eager' : 'lazy'; img.draggable = false;
    const ratio = photo.width && photo.height ? photo.width / photo.height : 1.5;
    img.style.setProperty('--st-photo-ratio', ratio);
    if (photo.width) img.width = photo.width;
    if (photo.height) img.height = photo.height;
    img.src = photo.src;
    if (photo.srcset) { img.srcset = photo.srcset; img.sizes = '(max-width: 767px) 48vw, (max-width: 1000px) ' + Math.ceil(330 * ratio) + 'px, (max-width: 1565px) 46vw, 720px'; }
    link.setAttribute('aria-label', [photo.title, photo.collectionTitle, photo.alt].filter(Boolean).join(' — '));
    const picture = document.createElement('span'); picture.className = 'st-film-image'; picture.append(img);
    link.append(mark, picture, bottom); container.append(link);
  }
  // Fixed copies retain their own click handlers, all bound to the original photo.
  const groups = [0,1,2].map(copy => {
    const item = copy === 1 ? group : document.createElement('div');
    item.className = 'st-film-group';
    if (copy !== 1) item.dataset.reelRepeat = 'true';
    photos.forEach((photo,i) => addFrame(item,photo,i,copy !== 1));
    return item;
  });
  track.replaceChildren(...groups);
  const nearby = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.loading = 'eager'; nearby.unobserve(entry.target);
      }
    });
  }, {root:viewport, rootMargin:'100%'});
  track.querySelectorAll('img').forEach(img => nearby.observe(img));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const settings = window.shutterTrendConfig?.filmReel || {};
  const baseSpeed = Math.max(1,Number(settings.autoplaySpeed) || 22);
  const cursorMax = Math.max(baseSpeed,Number(settings.cursorMaxSpeed) || 150);
  const crawl = Math.max(1,Math.min(baseSpeed,Number(settings.cursorCrawlSpeed) || 3));
  const velocityEase = Math.max(.1,Number(settings.velocityEaseSeconds) || .6);
  let position = 0, travel = 0, velocity = baseSpeed;
  let cursorVelocity = null;
  let frame = 0, last = 0, visible = false, paused = false, focused = false, departed = false, modal = false, restoringFocus = false, controlState = '';
  const running = () => (!compact.matches || mobile.matches) && !reduced.matches && !document.hidden && !departed && !modal && !focused && !paused && visible && travel > .5 && root.isConnected;
  const modulo = (value,length) => ((value % length) + length) % length;
  function paint() { track.style.transform = compact.matches && !mobile.matches ? 'none' : 'translate3d(0,' + (-(travel + position)).toFixed(3) + 'px,0)'; }
  function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; }
  function tick(time) {
    frame = 0;
    if (!running()) { last = 0; return; }
    const dt = last ? Math.min(time-last,64)/1000 : 0; last = time;
    const target = mobile.matches ? 10 : cursorVelocity === null ? baseSpeed : cursorVelocity;
    velocity += (target-velocity)*(1-Math.exp(-dt/velocityEase));
    // Render in the middle copy; wrapping one full period has identical pixels.
    position = modulo(position + velocity*dt, travel);
    paint(); frame = requestAnimationFrame(tick);
  }
  function sync() {
    const unavailable = reduced.matches || compact.matches || travel <= .5;
    const state = String(paused) + '/' + String(unavailable);
    if (state !== controlState) {
      controlState = state;
      const label = paused || unavailable ? 'Play filmstrip' : 'Pause filmstrip';
      pause.setAttribute('aria-label',label); pause.setAttribute('aria-pressed',String(paused || unavailable)); pause.disabled = unavailable;
      pause.title = reduced.matches ? 'Automatic motion disabled by reduced-motion preference' : compact.matches ? 'Swipe or use arrow keys to browse in compact view' : travel <= .5 ? 'All photographs fit in the reel' : label;
      pause.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (paused || unavailable ? '<path d="M8 5L19 12L8 19Z"/>' : '<path d="M6 5H10V19H6ZM14 5H18V19H14Z"/>') + '</svg>';
    }
    if (!running()) stop(); else if (!frame) frame = requestAnimationFrame(tick);
    syncBurn();
  }
  let burnTimer = 0, burnEnd = 0, burning = null;
  function clearBurn() {
    clearTimeout(burnTimer); clearTimeout(burnEnd); burnTimer = burnEnd = 0;
    burning?.classList.remove('is-burning'); burning = null;
  }
  function syncBurn() {
    if (!mobile.matches || !running()) { clearBurn(); return; }
    if (burnTimer || burning) return;
    burnTimer = setTimeout(() => {
      burnTimer = 0;
      if (!mobile.matches || !running()) return;
      const bounds = viewport.getBoundingClientRect();
      const candidates = [...track.querySelectorAll('.st-film-frame')].filter(item => {
        const box = item.getBoundingClientRect(), img = item.querySelector('img');
        return img.complete && img.naturalWidth && box.top < bounds.bottom-20 && box.bottom > bounds.top+20;
      });
      if (!candidates.length) { syncBurn(); return; }
      burning = candidates[Math.floor(Math.random()*candidates.length)];
      burning.classList.add('is-burning');
      burnEnd = setTimeout(() => {
        burning?.classList.remove('is-burning'); burning = null; burnEnd = 0; syncBurn();
      }, 1300);
    }, 8000+Math.random()*7000);
  }
  let measureFrame = 0;
  function scheduleMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(() => { measureFrame = 0; measure(); });
  }
  function measure() {
    root.dataset.axis = mobile.matches ? 'mobile-background' : compact.matches ? 'compact' : 'vertical';
    if (boundary) {
      if (mobile.matches && boundary.parentElement !== document.body) document.body.append(boundary);
      else if (!mobile.matches && boundary.parentElement === document.body) homeSlot.after(boundary);
    }
    root.inert = mobile.matches;
    if (mobile.matches) root.setAttribute('aria-hidden','true'); else root.removeAttribute('aria-hidden');
    viewport.tabIndex = mobile.matches ? -1 : 0;
    if (compact.matches && !mobile.matches) { travel = 0; paint(); }
    else {
      viewport.scrollLeft = 0; viewport.scrollTop = 0;
      // Uniform tiny gaps round the period to a whole sprocket pitch.
      // Explicit image dimensions reserve the same space before/after decoding.
      groups.forEach(item => { item.style.height = ''; item.style.removeProperty('--st-mobile-period'); item.style.removeProperty('--st-loop-gap'); });
      const natural = group.getBoundingClientRect().height;
      const pitch = parseFloat(getComputedStyle(root).getPropertyValue('--st-film-pitch')) || 32;
      const period = Math.ceil(natural/pitch)*pitch;
      const gap = (period-natural)/photos.length;
      groups.forEach(item => { item.style.height = period+'px'; item.style.setProperty('--st-mobile-period',period+'px'); item.style.setProperty('--st-loop-gap',gap+'px'); });
      travel = period;
      position = travel ? modulo(position,travel) : 0; paint();
    }
    const help = root.querySelector('#st-film-help');
    if (help) help.textContent = compact.matches ? 'Swipe or use Left/Right arrows to browse. Tap a frame to open its original photograph fullscreen.' : 'The reel loops continuously. Move the pointer toward the top to move photographs down, or the bottom to move them up. Use Pause to stop. Tab through photographs; use Up/Down and Home/End to browse while focused. Enter or Space opens only that photograph fullscreen.';
    sync();
  }
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  function clearCursor() { cursorVelocity = null; }
  function steer(event) {
    if (event.pointerType !== 'mouse' || !mouse.matches || compact.matches || reduced.matches) return;
    const bounds = viewport.getBoundingClientRect();
    // Positive position moves the visible photographs upward (negative Y).
    // Top therefore requests a negative velocity; bottom requests positive.
    const offset = 2 * Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height)) - 1;
    const distance = Math.abs(offset);
    const sign = Math.sign(offset);
    const magnitude = distance <= .3 ? crawl * (.2 + .8 * distance/.3)
      : crawl + (cursorMax-crawl) * Math.pow((distance-.3)/.7,1.7);
    const next = sign * magnitude;
    cursorVelocity = next;
  }
  viewport.addEventListener('pointerenter',steer);
  viewport.addEventListener('pointermove',steer);
  viewport.addEventListener('pointerleave',clearCursor);
  viewport.addEventListener('pointercancel',clearCursor);
  mouse.addEventListener('change',clearCursor);
  viewport.addEventListener('pointerdown',event => {
    if (event.pointerType === 'mouse' && event.button === 0 && event.target.closest('.st-film-frame')) event.preventDefault();
  });
  // A dedicated single-photo modal keeps story navigation and the URL untouched.
  const viewer = document.createElement('dialog'); viewer.className = 'st-reel-viewer';
  viewer.setAttribute('aria-label','Fullscreen photograph');
  const close = document.createElement('button'); close.type = 'button'; close.className = 'st-reel-viewer__close';
  close.setAttribute('aria-label','Close photograph'); close.textContent = '\u00d7';
  const image = document.createElement('img'); image.decoding = 'async';
  const status = document.createElement('p'); status.className = 'st-reel-viewer__status'; status.setAttribute('role','status');
  viewer.append(image,close,status); document.body.append(viewer);
  let trigger = null, saved = null;
  function openPhoto(photo,button) {
    if (mobile.matches || viewer.open || saved) return;
    trigger = button;
    saved = {position,velocity,cursorVelocity,paused,scrollX:window.scrollX,scrollY:window.scrollY,
      left:viewport.scrollLeft,top:viewport.scrollTop,overflow:document.documentElement.style.overflow,
      bodyOverflow:document.body.style.overflow};
    modal = true; sync();
    image.removeAttribute('src'); image.alt = photo.alt;
    image.onload = () => { status.textContent = ''; };
    image.onerror = () => { status.textContent = 'This photograph could not load. Please close the viewer and try again.'; };
    status.textContent = 'Loading photograph...'; image.src = photo.fullSrc || photo.src;
    document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden';
    viewer.showModal(); close.focus({preventScroll:true});
  }
  close.addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',event => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown',event => {
    if (event.key === 'Tab') { event.preventDefault(); close.focus({preventScroll:true}); }
  });
  viewer.addEventListener('close',()=>{
    if (!saved) return;
    const state = saved; saved = null;
    document.documentElement.style.overflow = state.overflow; document.body.style.overflow = state.bodyOverflow;
    restoringFocus = true;
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
    restoringFocus = false;
    ({position,velocity,cursorVelocity,paused} = state);
    viewport.scrollLeft = state.left; viewport.scrollTop = state.top;
    window.scrollTo({left:state.scrollX,top:state.scrollY,behavior:'instant'});
    focused = false; modal = false; paint(); sync();
    image.onload = image.onerror = null; image.removeAttribute('src');
  });
  viewport.addEventListener('focusin',e => {
    if (modal || restoringFocus) return;
    focused = true; sync();
    if (!compact.matches) {
      const link = e.target.closest('.st-film-frame');
      if (link) {
        const top = link.offsetTop + link.parentElement.offsetTop - travel, bottom = top + link.offsetHeight;
        if (top < position || link.offsetHeight > viewport.clientHeight) position = modulo(top,travel);
        else if (bottom > position + viewport.clientHeight) position = modulo(bottom-viewport.clientHeight,travel);
        paint();
      }
      viewport.scrollTop = 0; queueMicrotask(()=>{ viewport.scrollTop = 0; });
    }
  });
  viewport.addEventListener('focusout',() => queueMicrotask(()=>{ if (!modal && !restoringFocus) { focused = viewport.contains(document.activeElement); sync(); } }));
  viewport.addEventListener('keydown',e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const back = compact.matches ? 'ArrowLeft' : 'ArrowUp', forward = compact.matches ? 'ArrowRight' : 'ArrowDown';
    if (![back,forward,'Home','End'].includes(e.key)) return;
    e.preventDefault();
    if (compact.matches) {
      if (e.key === 'Home') viewport.scrollLeft = 0;
      else if (e.key === 'End') viewport.scrollLeft = viewport.scrollWidth;
      else viewport.scrollLeft += e.key === forward ? 240 : -240;
    } else {
      position = e.key === 'Home' ? 0 : e.key === 'End' ? group.lastElementChild.offsetTop : modulo(position + (e.key === forward ? 240 : -240),travel);
      viewport.scrollTop = 0; paint();
    }
  });
  new IntersectionObserver(entries=>{ visible = entries[0].isIntersecting; sync(); }).observe(viewport);
  new ResizeObserver(scheduleMeasure).observe(viewport);
  track.querySelectorAll('img').forEach(img=>img.addEventListener('load',scheduleMeasure));
  mobile.addEventListener('change',()=>{ stop(); clearCursor(); focused = false; if (mobile.matches && viewer.open) viewer.close(); measure(); });
  compact.addEventListener('change',()=>{ stop(); clearCursor(); viewport.scrollLeft = 0; viewport.scrollTop = 0; measure(); });
  reduced.addEventListener('change',sync); document.addEventListener('visibilitychange',sync);
  document.addEventListener('st-lightbox-open',()=>{ modal = true; sync(); });
  document.addEventListener('st-lightbox-close',()=>{ modal = false; sync(); });
  window.addEventListener('pagehide',()=>{ departed = true; sync(); });
  window.addEventListener('pageshow',()=>{ departed = false; measure(); });
  measure();
})();

