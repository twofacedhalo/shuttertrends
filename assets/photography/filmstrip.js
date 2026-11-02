(() => {
  'use strict';
  const root = document.querySelector('[data-st-filmstrip]');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const viewport = root.querySelector('.st-film-viewport');
  const track = root.querySelector('.st-film-track');
  const pause = root.querySelector('.st-film-pause');
  const compact = matchMedia('(max-width: 1000px)');
  const photos = (window.shutterTrendsPhotos || []).filter(p => p.src && p.alt);
  if (!photos.length) { root.hidden = true; return; }
  const group = document.createElement('div'); group.className = 'st-film-group';
  photos.forEach((photo, i) => {
    const link = document.createElement('button'); link.type = 'button'; link.className = 'st-film-frame';
    link.setAttribute('aria-haspopup','dialog');
    link.addEventListener('click', () => openPhoto(photo,link));
    link.dataset.collectionId = photo.collectionId || ''; link.dataset.photoId = photo.id || '';
    const mark = document.createElement('span'); mark.className = 'st-film-mark';
    mark.textContent = String(i + 1).padStart(3, '0') + '  SHUTTERTREND'; mark.setAttribute('aria-hidden', 'true');
    const bottom = mark.cloneNode(); bottom.classList.add('st-film-mark--bottom'); bottom.textContent = 'ST — 400 · 35MM';
    const img = document.createElement('img'); img.alt = photo.alt; img.decoding = 'async'; img.loading = 'lazy'; img.draggable = false;
    const ratio = photo.width && photo.height ? photo.width / photo.height : 1.5;
    img.style.setProperty('--st-photo-ratio', ratio);
    if (photo.width) img.width = photo.width;
    if (photo.height) img.height = photo.height;
    img.src = photo.src;
    if (photo.srcset) { img.srcset = photo.srcset; img.sizes = '(max-width: 1000px) ' + Math.ceil(330 * ratio) + 'px, (max-width: 1565px) 46vw, 720px'; }
    link.setAttribute('aria-label', [photo.title, photo.collectionTitle, photo.alt].filter(Boolean).join(' — '));
    const picture = document.createElement('span'); picture.className = 'st-film-image'; picture.append(img);
    link.append(mark, picture, bottom); group.append(link);
  });
  track.replaceChildren(group);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const settings = window.shutterTrendConfig?.filmReel || {};
  const baseSpeed = Math.max(1,Number(settings.autoplaySpeed) || 22);
  const cursorMax = Math.max(baseSpeed,Number(settings.cursorMaxSpeed) || 150);
  const crawl = Math.max(1,Math.min(baseSpeed,Number(settings.cursorCrawlSpeed) || 3));
  const velocityEase = Math.max(.1,Number(settings.velocityEaseSeconds) || .6);
  const easeDistance = Math.max(20,Number(settings.edgeEaseDistance) || 100);
  let position = 0, travel = 0, direction = 1, velocity = baseSpeed;
  let cursorVelocity = null, cursorReverse = 1;
  let frame = 0, last = 0, visible = false, paused = false, focused = false, departed = false, modal = false, restoringFocus = false, controlState = '';
  const running = () => !compact.matches && !reduced.matches && !document.hidden && !departed && !modal && !focused && !paused && visible && travel > .5 && root.isConnected;
  function paint() { track.style.transform = compact.matches ? 'none' : 'translate3d(0,' + (-position).toFixed(3) + 'px,0)'; }
  function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; }
  function tick(time) {
    frame = 0;
    if (!running()) { last = 0; return; }
    const dt = last ? Math.min(time-last,64)/1000 : 0; last = time;
    const edge = Math.min(position,travel-position);
    const easing = .16 + .84*Math.min(1,Math.max(0,edge)/easeDistance);
    const target = (cursorVelocity === null ? direction * baseSpeed : cursorVelocity * cursorReverse) * easing;
    velocity += (target-velocity)*(1-Math.exp(-dt/velocityEase));
    position += velocity*dt;
    // Latch a reflected cursor direction at each boundary until the cursor
    // changes direction or exits, avoiding repeated outward pushes at the edge.
    if (position >= travel) { position = travel; direction = -1; cursorReverse = cursorVelocity > 0 ? -1 : 1; }
    if (position <= 0) { position = 0; direction = 1; cursorReverse = cursorVelocity < 0 ? -1 : 1; }
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
  }
  function measure() {
    root.dataset.axis = compact.matches ? 'compact' : 'vertical';
    if (compact.matches) { position = Math.max(0,position); travel = 0; paint(); }
    else {
      viewport.scrollLeft = 0; viewport.scrollTop = 0;
      travel = Math.max(0,group.getBoundingClientRect().height - viewport.clientHeight);
      position = Math.max(0,Math.min(position,travel)); paint();
    }
    const help = root.querySelector('#st-film-help');
    if (help) help.textContent = compact.matches ? 'Swipe or use Left/Right arrows to browse. Tap a frame to open its original photograph fullscreen.' : 'The reel moves automatically up and down. Move the pointer toward the top or bottom to control direction and speed. Use Pause to stop. Tab through photographs; use Up/Down and Home/End to browse while focused. Enter or Space opens the original photograph fullscreen.';
    sync();
  }
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  function clearCursor() { cursorVelocity = null; cursorReverse = 1; }
  function steer(event) {
    if (event.pointerType !== 'mouse' || !mouse.matches || compact.matches || reduced.matches) return;
    const bounds = viewport.getBoundingClientRect();
    // Positive position moves the visible photographs upward (negative Y).
    // Top therefore requests a negative velocity; bottom requests positive.
    const offset = 2 * Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height)) - 1;
    const distance = Math.abs(offset);
    const sign = distance < .02 ? direction : Math.sign(offset);
    const magnitude = distance <= .3 ? crawl * (.2 + .8 * distance/.3)
      : crawl + (cursorMax-crawl) * Math.pow((distance-.3)/.7,1.7);
    const next = sign * magnitude;
    if (cursorVelocity !== null && Math.sign(next) !== Math.sign(cursorVelocity)) cursorReverse = 1;
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
    if (viewer.open || saved) return;
    trigger = button;
    saved = {position,direction,velocity,cursorVelocity,cursorReverse,paused,scrollX:window.scrollX,scrollY:window.scrollY,
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
    ({position,direction,velocity,cursorVelocity,cursorReverse,paused} = state);
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
        const top = link.offsetTop, bottom = top + link.offsetHeight;
        if (top < position || link.offsetHeight > viewport.clientHeight) position = Math.min(top,travel);
        else if (bottom > position + viewport.clientHeight) position = Math.min(travel,bottom-viewport.clientHeight);
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
      position = e.key === 'Home' ? 0 : e.key === 'End' ? travel : Math.max(0,Math.min(travel,position + (e.key === forward ? 240 : -240)));
      direction = position >= travel ? -1 : position <= 0 ? 1 : direction;
      viewport.scrollTop = 0; paint();
    }
  });
  new IntersectionObserver(entries=>{ visible = entries[0].isIntersecting; sync(); }).observe(viewport);
  new ResizeObserver(measure).observe(viewport);
  track.querySelectorAll('img').forEach(img=>img.addEventListener('load',measure));
  compact.addEventListener('change',()=>{ stop(); clearCursor(); viewport.scrollLeft = 0; viewport.scrollTop = 0; measure(); });
  reduced.addEventListener('change',sync); document.addEventListener('visibilitychange',sync);
  document.addEventListener('st-lightbox-open',()=>{ modal = true; sync(); });
  document.addEventListener('st-lightbox-close',()=>{ modal = false; sync(); });
  window.addEventListener('pagehide',()=>{ departed = true; sync(); });
  window.addEventListener('pageshow',()=>{ departed = false; measure(); });
  measure();
})();
