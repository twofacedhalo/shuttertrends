(() => {
  'use strict';
  const layer = document.querySelector('[data-st-spotlight]');
  if (!layer) return;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, targetX = 0, targetY = 0;
  let frame = 0, lastTime = 0, inside = false;
  let smoothing = 240, restX = .5, restY = .35;
  const canAnimate = () => finePointer.matches && !reducedMotion.matches && !document.hidden;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function settings() {
    const css = getComputedStyle(layer);
    const number = (name, fallback) => {
      const value = parseFloat(css.getPropertyValue(name));
      return Number.isFinite(value) ? value : fallback;
    };
    smoothing = clamp(number('--st-spotlight-smoothing', 240), 0, 2000);
    restX = clamp(number('--st-spotlight-rest-x', .5), 0, 1);
    restY = clamp(number('--st-spotlight-rest-y', .35), 0, 1);
  }
  function paint() {
    layer.style.setProperty('--st-spotlight-x', `${x.toFixed(2)}px`);
    layer.style.setProperty('--st-spotlight-y', `${y.toFixed(2)}px`);
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }
  function tick(time) {
    frame = 0;
    if (!canAnimate()) { lastTime = 0; return; }
    const dt = lastTime ? Math.min(time - lastTime, 64) : 16.67;
    lastTime = time;
    const ease = smoothing === 0 ? 1 : 1 - Math.exp(-dt / smoothing);
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    const settled = Math.abs(targetX - x) < .15 && Math.abs(targetY - y) < .15;
    if (settled) { x = targetX; y = targetY; lastTime = 0; }
    paint();
    if (!settled) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!frame && canAnimate()) frame = requestAnimationFrame(tick);
  }
  function rest(immediate = false) {
    inside = false;
    targetX = innerWidth * restX;
    targetY = innerHeight * restY;
    if (immediate || !canAnimate()) {
      stop(); x = targetX; y = targetY; paint();
    } else schedule();
  }
  function reset() { settings(); rest(true); }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !canAnimate()) return;
    inside = true;
    targetX = event.clientX;
    targetY = event.clientY;
    schedule();
  }, { passive: true });
  document.addEventListener('pointerout', event => {
    if (event.pointerType === 'mouse' && !event.relatedTarget) rest();
  }, { passive: true });
  window.addEventListener('blur', () => rest());
  window.addEventListener('resize', () => {
    settings();
    if (!inside || !canAnimate()) rest(true);
    else {
      targetX = clamp(targetX, 0, innerWidth);
      targetY = clamp(targetY, 0, innerHeight);
      schedule();
    }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else reset();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', reset);
  finePointer.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
  reset();
})();
