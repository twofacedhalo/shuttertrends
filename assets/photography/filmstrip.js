(() => {
  'use strict';
  const root = document.querySelector('[data-st-filmstrip]');
  if (!root) return;
  const viewport = root.querySelector('.st-film-viewport');
  const track = root.querySelector('.st-film-track');
  const pause = root.querySelector('.st-film-pause');
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
    if (photo.srcset) { img.srcset = photo.srcset; img.sizes = Math.ceil(330 * ratio) + 'px'; }
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
      let next = viewport.scrollLeft + step;
      next = ((next % cycle) + cycle) % cycle;
      viewport.scrollLeft = next;
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
    const old = cycle;
    group.style.paddingRight = '0px'; duplicate.style.paddingRight = '0px';
    const pitch = parseFloat(getComputedStyle(root).getPropertyValue('--st-film-pitch')) || 32;
    const width = group.getBoundingClientRect().width;
    const pad = Math.ceil(width / pitch) * pitch - width;
    group.style.paddingRight = duplicate.style.paddingRight = pad + 'px';
    cycle = width + pad;
    if (old) viewport.scrollLeft = viewport.scrollLeft / old * cycle;
  }
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  viewport.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const rect = viewport.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width;
    const requested = Math.abs(x - .5) < .12 ? 0 : (x - .5) * 180;
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
    if (e.target !== viewport || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') viewport.scrollLeft = 0;
    else if (e.key === 'End') viewport.scrollLeft = Math.max(0, cycle - viewport.clientWidth);
    else viewport.scrollLeft += e.key === 'ArrowRight' ? 240 : -240;
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
