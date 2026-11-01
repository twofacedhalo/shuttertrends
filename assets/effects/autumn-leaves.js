(() => {
  'use strict';
  const config = window.shutterTrendConfig?.seasonalEffects?.autumnLeaves;
  if (!config?.enabled || !document.body.classList.contains('home')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const layer = document.createElement('div');
  layer.className = 'st-autumn-leaves';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  document.body.append(layer);
  const range = (min, max) => min + Math.random() * (max - min);
  const colors = ['#b89a58', '#b18443', '#a2653c', '#a77350'];
  const shapes = [
    'M30 3C13 8 5 22 12 37C15 44 22 48 29 48L27 58L31 58L33 47C52 40 56 17 30 3Z',
    'M30 3L35 16L45 10L42 24L56 23L46 34L51 40L35 45L32 57L28 57L29 45L14 44L18 36L5 28L20 26L16 12L27 18Z'
  ];
  let timer = 0, departed = false;
  const active = () => !document.hidden && !reduced.matches && !departed;
  function spawn() {
    const leaf = document.createElement('span');
    leaf.className = 'st-autumn-leaf';
    const leftBiased = Math.random() < .8;
    const values = {
      x: range(leftBiased ? 1 : 25, leftBiased ? 24 : 43) + 'vw',
      drift: range(-1, leftBiased ? 8 : 5) + 'vw',
      sway: range(5, 18) + 'px',
      size: range(mobile.matches ? 12 : 16, mobile.matches ? 23 : 34) + 'px',
      opacity: range(...(config.opacity || [.12, .30])),
      duration: range(21, 35) + 's',
      turn: range(-100, 100) + 'deg',
      blur: Math.random() < .3 ? '1px' : '0px'
    };
    Object.entries(values).forEach(([key, value]) => leaf.style.setProperty('--leaf-' + key, value));
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    svg.style.color = colors[Math.floor(Math.random() * colors.length)];
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', shapes[Math.floor(Math.random() * shapes.length)]);
    path.setAttribute('fill', 'currentColor');
    const vein = document.createElementNS(ns, 'path');
    vein.setAttribute('d', 'M30 49L30 14M30 32L20 24M30 38L41 27');
    vein.setAttribute('fill', 'none'); vein.setAttribute('stroke', '#4d3924');
    vein.setAttribute('stroke-width', '1');
    svg.append(path, vein); leaf.append(svg); layer.append(leaf);
    leaf.addEventListener('animationend', event => { if (event.target === leaf) leaf.remove(); });
  }
  function schedule() {
    clearTimeout(timer); timer = 0;
    if (!active()) return;
    timer = setTimeout(() => {
      if (!active()) return;
      const limit = mobile.matches ? (config.mobileMaxLeaves ?? 3) : (config.maxLeaves ?? 6);
      const count = Math.min(limit - layer.childElementCount, mobile.matches ? 1 : Math.floor(range(1, 4)));
      for (let i = 0; i < count; i++) spawn();
      schedule();
    }, range(...(config.spawnIntervalMs || [8000, 15000])));
  }
  function reset() { layer.replaceChildren(); schedule(); }
  document.addEventListener('visibilitychange', reset);
  reduced.addEventListener('change', reset);
  mobile.addEventListener('change', reset);
  window.addEventListener('pagehide', () => { departed = true; reset(); });
  window.addEventListener('pageshow', () => { departed = false; reset(); });
  schedule();
})();
