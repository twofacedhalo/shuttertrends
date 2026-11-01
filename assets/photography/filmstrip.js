(() => {
  'use strict';
  const root = document.querySelector('[data-st-filmstrip]');
  if (!root) return;
  const viewport = root.querySelector('.st-film-viewport');
  const track = root.querySelector('.st-film-track');
  const pause = root.querySelector('.st-film-pause');
  const compact = matchMedia('(max-width: 1000px)');
  let vertical = !compact.matches;
  const position = () => vertical ? viewport.scrollTop : viewport.scrollLeft;
  const setPosition = value => { if (vertical) viewport.scrollTop = value; else viewport.scrollLeft = value; };
  const photos = (window.shutterTrendsPhotos || []).filter(p => p.src && p.alt);
  if (!photos.length) { root.hidden = true; return; }
  const group = document.createElement('div'); group.className = 'st-film-group';
  photos.forEach((photo, i) => {
    const link = document.createElement('a'); link.className = 'st-film-frame';
    link.href = photo.collectionUrl || photo.fullSrc || photo.src;
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
  const duplicate = group.cloneNode(true); duplicate.setAttribute('aria-hidden', 'true');
  duplicate.querySelectorAll('a').forEach(a => a.tabIndex = -1);
  duplicate.querySelectorAll('img').forEach(img => img.alt = '');
  track.append(group, duplicate);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, last = 0, cycle = 0, visible = false, focused = false, paused = false, touching = false, departed = false, speed = 16, targetSpeed = 16, remainder = 0, lastTouchLink = null, controlState = '';
  const running = () => !reduced.matches && !document.hidden && !departed && visible && !focused && !paused && !touching;
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function tick(time) {
    frame = 0;
    if (!running()) { last = 0; return; }
    const dt = last ? Math.min(time - last, 64) / 1000 : 0; last = time;
    speed += (targetSpeed - speed) * (1 - Math.exp(-dt / .4));
    if (targetSpeed === 0 && Math.abs(speed) < .02) { speed = 0; last = 0; return; }
    if (cycle) {
      remainder += speed * dt;
      const step = Math.trunc(remainder); remainder -= step;
      let next = position() + step;
      next = ((next % cycle) + cycle) % cycle;
      setPosition(next);
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const state = String(paused) + '/' + String(reduced.matches);
    if (state !== controlState) {
      controlState = state;
      const label = paused || reduced.matches ? 'Play filmstrip' : 'Pause filmstrip';
      pause.setAttribute('aria-label', label); pause.title = reduced.matches ? 'Automatic movement disabled by reduced-motion preference' : label;
      pause.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        (paused || reduced.matches ? '<path d="M8 5L19 12L8 19Z"/>' : '<path d="M6 5H10V19H6ZM14 5H18V19H14Z"/>') + '</svg>';
      pause.disabled = reduced.matches;
      pause.setAttribute('aria-pressed', String(paused || reduced.matches));
    }
    if (!running()) stop(); else if (!frame) frame = requestAnimationFrame(tick);
  }
  function measure() {
    const progress = cycle ? position() / cycle : 0;
    const wasVertical = vertical;
    vertical = !compact.matches;
    root.dataset.axis = vertical ? 'vertical' : 'horizontal';
    group.style.paddingRight = duplicate.style.paddingRight = '0px';
    group.style.paddingBottom = duplicate.style.paddingBottom = '0px';
    const pitch = parseFloat(getComputedStyle(root).getPropertyValue('--st-film-pitch')) || 32;
    const rect = group.getBoundingClientRect();
    const length = vertical ? rect.height : rect.width;
    const pad = Math.ceil(length / pitch) * pitch - length;
    const property = vertical ? 'paddingBottom' : 'paddingRight';
    group.style[property] = duplicate.style[property] = pad + 'px';
    cycle = length + pad;
    if (wasVertical !== vertical) { viewport.scrollTop = 0; viewport.scrollLeft = 0; }
    setPosition(progress * cycle);
    const help = root.querySelector('#st-film-help');
    if (help) help.textContent = vertical ? 'Use Up/Down arrows, Home/End, or scroll inside the reel. Tab opens collection links. Automatic movement pauses during keyboard navigation.' : 'Swipe or use Left/Right arrows and Home/End to explore photographs. Tab opens collection links. Automatic movement pauses during keyboard navigation.';
  }
  compact.addEventListener('change', () => { stop(); speed = targetSpeed = 16; measure(); sync(); });
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  viewport.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const rect = viewport.getBoundingClientRect();
    const coordinate = vertical ? (e.clientY - rect.top) / rect.height : (e.clientX - rect.left) / rect.width;
    const offset = vertical ? .5 - coordinate : coordinate - .5;
    const requested = Math.abs(offset) < .12 ? 0 : offset * 180;
    const inspecting = Boolean(e.target.closest('.st-film-frame'));
    targetSpeed = inspecting ? (requested === 0 ? Math.sign(speed || 1) * 4 : Math.sign(requested) * Math.max(4, Math.abs(requested) * .24)) : requested;
    sync();
  }, { passive:true });
  viewport.addEventListener('pointerleave', () => { targetSpeed = 16; sync(); });
  viewport.addEventListener('pointerdown', e => { lastTouchLink = e.pointerType === 'touch' ? e.target.closest('.st-film-frame') : null; if (e.pointerType !== 'mouse') { touching = true; sync(); } });
  const touchStatus = document.createElement('p'); touchStatus.className = 'st-gallery__sr'; touchStatus.setAttribute('role','status'); root.append(touchStatus);
  viewport.addEventListener('click', e => {
    const link = e.target.closest('.st-film-frame');
    if (link && link === lastTouchLink && e.detail !== 0 && !e.metaKey && !e.ctrlKey && !link.classList.contains('is-original')) {
      e.preventDefault();
      track.querySelectorAll('.is-original').forEach(item => item.classList.remove('is-original'));
      link.classList.add('is-original');
      touchStatus.textContent = 'Original photograph revealed. Tap again to open its collection.';
    }
    lastTouchLink = null;
  });
  window.addEventListener('pointerup', () => { touching = false; sync(); });
  viewport.addEventListener('pointercancel', () => { touching = false; sync(); });
  viewport.addEventListener('focusin', () => { focused = true; sync(); });
  viewport.addEventListener('focusout', () => queueMicrotask(() => { focused = viewport.contains(document.activeElement); sync(); }));
  viewport.addEventListener('keydown', e => {
    const backward = vertical ? 'ArrowUp' : 'ArrowLeft';
    const forward = vertical ? 'ArrowDown' : 'ArrowRight';
    if (e.target !== viewport || ![backward,forward,'Home','End'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') setPosition(0);
    else if (e.key === 'End') setPosition(Math.max(0,cycle - (vertical ? viewport.clientHeight : viewport.clientWidth)));
    else setPosition(position() + (e.key === forward ? 240 : -240));
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(viewport);
  new ResizeObserver(measure).observe(viewport);
  track.querySelectorAll('img').forEach(img => img.addEventListener('load', measure));
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('pagehide', () => { departed = true; sync(); });
  window.addEventListener('pageshow', () => { departed = false; sync(); });
  measure(); sync();
})();
