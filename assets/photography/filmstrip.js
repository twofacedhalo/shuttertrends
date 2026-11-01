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
    const link = document.createElement('a'); link.className = 'st-film-frame';
    link.href = photo.collectionUrl || photo.fullSrc || photo.src;
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
    if (photo.srcset) { img.srcset = photo.srcset; img.sizes = '(max-width: 1000px) ' + Math.ceil(330 * ratio) + 'px, (max-width: 1450px) 40vw, 500px'; }
    link.setAttribute('aria-label', [photo.title, photo.collectionTitle, photo.alt].filter(Boolean).join(' — '));
    const picture = document.createElement('span'); picture.className = 'st-film-image'; picture.append(img);
    link.append(mark, picture, bottom); group.append(link);
  });
  track.replaceChildren(group);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const settings = window.shutterTrendConfig?.filmReel || {};
  const baseSpeed = Math.max(1,Number(settings.autoplaySpeed) || 18);
  const easeDistance = Math.max(20,Number(settings.edgeEaseDistance) || 100);
  let position = 0, travel = 0, direction = 1, velocity = baseSpeed;
  let frame = 0, last = 0, visible = false, paused = false, focused = false, hovered = false, departed = false, modal = false, lastTouchLink = null, controlState = '';
  const running = () => !compact.matches && !reduced.matches && !document.hidden && !departed && !modal && !focused && !paused && visible && travel > .5 && root.isConnected;
  function paint() { track.style.transform = compact.matches ? 'none' : 'translate3d(0,' + (-position).toFixed(3) + 'px,0)'; }
  function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; }
  function tick(time) {
    frame = 0;
    if (!running()) { last = 0; return; }
    const dt = last ? Math.min(time-last,64)/1000 : 0; last = time;
    const edge = Math.min(position,travel-position);
    const easing = .16 + .84*Math.min(1,Math.max(0,edge)/easeDistance);
    const target = direction * baseSpeed * easing * (hovered ? .65 : 1);
    velocity += (target-velocity)*(1-Math.exp(-dt/.6));
    position += velocity*dt;
    if (position >= travel) { position = travel; direction = -1; }
    if (position <= 0) { position = 0; direction = 1; }
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
    if (help) help.textContent = compact.matches ? 'Swipe or use Left/Right arrows to browse. Tap a frame to reveal its original color, then tap again to open its story.' : 'The reel moves automatically up and down. Use Pause to stop. Tab through photographs; use Up/Down and Home/End to browse while focused. Enter opens a photo story.';
    sync();
  }
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  viewport.addEventListener('pointerenter',e => { if (e.pointerType === 'mouse') hovered = true; });
  viewport.addEventListener('pointerleave',() => { hovered = false; });
  viewport.addEventListener('pointerdown',e => { lastTouchLink = e.pointerType === 'touch' ? e.target.closest('.st-film-frame') : null; });
  const touchStatus = document.createElement('p'); touchStatus.className = 'st-gallery__sr'; touchStatus.setAttribute('role','status'); root.append(touchStatus);
  viewport.addEventListener('click',e => {
    const link = e.target.closest('.st-film-frame');
    if (!link) return;
    const ordinary = !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
    if (ordinary && link === lastTouchLink && e.detail !== 0 && !link.classList.contains('is-original')) {
      e.preventDefault(); track.querySelectorAll('.is-original').forEach(el=>el.classList.remove('is-original')); link.classList.add('is-original');
      touchStatus.textContent = 'Original photograph revealed. Tap again to open its photo story.';
    }
    if (ordinary && !e.defaultPrevented && window.shutterTrendsOpenPhotoStory?.(link.dataset.collectionId,link.dataset.photoId,link)) e.preventDefault();
    lastTouchLink = null;
  });
  viewport.addEventListener('focusin',e => {
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
  viewport.addEventListener('focusout',() => queueMicrotask(()=>{ focused = viewport.contains(document.activeElement); sync(); }));
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
  compact.addEventListener('change',()=>{ stop(); viewport.scrollLeft = 0; viewport.scrollTop = 0; measure(); });
  reduced.addEventListener('change',sync); document.addEventListener('visibilitychange',sync);
  document.addEventListener('st-lightbox-open',()=>{ modal = true; sync(); });
  document.addEventListener('st-lightbox-close',()=>{ modal = false; sync(); });
  window.addEventListener('pagehide',()=>{ departed = true; sync(); });
  window.addEventListener('pageshow',()=>{ departed = false; measure(); });
  measure();
})();
