(() => {
  'use strict';
  if (!document.body.classList.contains('home')) return;
  function settings() {
    const base = window.shutterTrendConfig?.seasonalEffects?.autumnLeaves || {};
    const theme = window.shutterTrendActiveTheme?.leaves || {};
    return { ...base, ...theme, enabled: base.enabled !== false && theme.enabled !== false };
  }
  let config = settings();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const layer = document.createElement('div');
  layer.className = 'st-autumn-leaves';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  document.body.append(layer);
  const range = (min, max) => min + Math.random() * (max - min);
  const fallbackColors = ['#b89a58', '#b18443', '#a2653c', '#a77350'];
  const shapes = [
    'M30 3C13 8 5 22 12 37C15 44 22 48 29 48L27 58L31 58L33 47C52 40 56 17 30 3Z',
    'M30 3L35 16L45 10L42 24L56 23L46 34L51 40L35 45L32 57L28 57L29 45L14 44L18 36L5 28L20 26L16 12L27 18Z'
  ];
  let timer = 0, departed = false;
  const active = () => config.enabled && !document.hidden && !reduced.matches && !departed;
  function spawn(initial = false) {
    const leaf = document.createElement('span');
    leaf.className = 'st-autumn-leaf';
    const leftBiased = Math.random() < .8;
    const values = {
      x: range(leftBiased ? 1 : 22, leftBiased ? 14 : 36) + 'vw',
      drift: range(-1, leftBiased ? 6 : 5) + 'vw',
      sway: range(5, 18) + 'px',
      size: range(mobile.matches ? 12 : 18, 28) + 'px',
      opacity: range(...(config.opacity || [.30, .55])),
      duration: range(28, 40) + 's',
      delay: (initial ? -range(5, 8) : 0) + 's',
      turn: range(-100, 100) + 'deg',
      blur: Math.random() < .2 ? '.5px' : '0px'
    };
    Object.entries(values).forEach(([key, value]) => leaf.style.setProperty('--leaf-' + key, value));
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    const colors = config.colors?.length ? config.colors : fallbackColors;
    svg.style.color = colors[Math.floor(Math.random() * colors.length)];
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', shapes[config.shape === 'maple' ? 1 : Math.floor(Math.random() * shapes.length)]);
    path.setAttribute('fill', 'currentColor');
    const vein = document.createElementNS(ns, 'path');
    vein.setAttribute('d', 'M30 49L30 14M30 32L20 24M30 38L41 27');
    vein.setAttribute('fill', 'none'); vein.setAttribute('stroke', '#4d3924');
    vein.setAttribute('stroke-width', '1');
    svg.append(path, vein); leaf.append(svg); layer.append(leaf);
    leaf.addEventListener('animationend', event => { if (event.target === leaf) leaf.remove(); });
  }
  const limit = () => Math.max(0, mobile.matches ? (config.mobileMaxLeaves ?? 3) : (config.maxLeaves ?? 8));
  function populate(initial = false) {
    const count = Math.min(limit() - layer.childElementCount, mobile.matches ? 1 : initial ? 2 : Math.floor(range(1, 4)));
    for (let i = 0; i < count; i++) spawn(initial);
  }
  function schedule() {
    clearTimeout(timer); timer = 0;
    if (!active()) return;
    timer = setTimeout(() => {
      if (!active()) return;
      populate();
      schedule();
    }, range(...(config.spawnIntervalMs || [5000, 10000])));
  }
  function reset() {
    layer.replaceChildren();
    if (active()) populate(true);
    schedule();
  }
  document.addEventListener('st-theme-change', () => { config = settings(); reset(); });
  document.addEventListener('visibilitychange', reset);
  reduced.addEventListener('change', reset);
  mobile.addEventListener('change', reset);
  window.addEventListener('pagehide', () => { departed = true; reset(); });
  window.addEventListener('pageshow', () => { departed = false; reset(); });
  reset();
})();
