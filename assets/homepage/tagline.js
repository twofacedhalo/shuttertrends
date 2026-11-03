(() => {
  'use strict';
  const root = document.querySelector('[data-st-hero-tagline]');
  if (!root || root.dataset.initialized) return;
  // Edit this one list to change the available phrases. Supported pen shapes are below.
  const words = ['Unscripted.', 'Unfiltered.', 'Unposed.', 'Unplanned.', 'Unrehearsed.', 'Uninterrupted.'];
  // Original centerline lettering, not outlines of a font. Each curve is a pen stroke.
  // Coordinates share a baseline; ascenders, joins and descenders remain inside the viewBox.
  const pen = {
    U: [40, ['M3 21 C13 2 29 5 22 24 L12 52 C4 74 20 73 29 49 L39 13 C33 33 24 70 37 64 L43 58']],
    n: [25, ['M0 64 C6 59 10 46 12 40 L7 62 C18 39 30 34 24 52 C19 68 23 68 30 59']],
    s: [22, ['M0 64 C9 56 18 47 21 39 C11 35 5 46 12 52 C27 64 12 72 5 64 C13 69 23 64 27 59']],
    c: [21, ['M0 63 C7 57 8 40 21 40 C29 41 21 48 18 46 C8 37 5 72 23 63 L27 59']],
    r: [21, ['M0 64 C8 56 10 46 13 39 C8 54 16 47 24 42 C15 56 17 70 27 60']],
    i: [13, ['M0 63 L11 41 C2 62 7 69 18 59', 'M14 29 L15 27']],
    p: [25, ['M0 64 C8 54 10 43 12 38 L1 86 M8 58 C23 26 38 40 25 56 C19 63 13 58 14 54 C13 67 24 66 30 59']],
    t: [18, ['M0 64 C9 54 18 29 22 23 C8 51 5 76 24 59', 'M5 42 L27 39']],
    e: [22, ['M0 63 C20 53 25 40 17 40 C5 40 1 73 22 63 L28 58']],
    d: [27, ['M0 63 C6 42 24 34 22 48 C17 68 3 71 7 55 C12 42 21 39 24 44 M22 48 C30 28 39 5 33 13 C22 29 15 79 32 59']],
    f: [22, ['M0 63 C18 44 32 8 23 13 C12 18 11 58 8 79 C4 96 -4 90 2 76 L24 40', 'M5 46 L29 42']],
    l: [20, ['M0 64 C15 46 29 6 21 13 C9 23 5 77 25 59']],
    o: [24, ['M0 63 C5 59 7 40 20 40 C34 40 22 69 11 65 C0 60 11 36 21 44 C23 52 28 54 31 48']],
    a: [26, ['M0 63 C6 42 24 34 22 48 C17 68 3 71 7 55 C12 42 21 39 24 44 M26 40 C17 62 20 71 32 59']],
    h: [26, ['M0 64 C15 43 30 5 22 13 C10 26 7 58 6 64 C16 42 29 34 25 50 C19 67 24 70 32 59']],
    u: [26, ['M0 63 L12 40 C1 61 3 72 15 61 L27 40 C18 61 20 70 32 59']],
    '.': [12, ['M8 64 L9 63']]
  };
  const slot = root.querySelector('[data-st-handwritten-word]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'shuttertrend.previousHeroWord';
  let previous = null;
  try { previous = sessionStorage.getItem(key); } catch { /* Storage is optional. */ }
  const choices = words.filter(word => word !== previous);
  const word = (choices.length ? choices : words)[Math.floor(Math.random() * (choices.length || words.length))];
  if (!word || [...word].some(letter => !pen[letter])) return; // Keep the readable fallback.
  try { sessionStorage.setItem(key, word); } catch { /* Private/storage-restricted tabs still load. */ }
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const width = Math.max(...words.map(value => [...value].reduce((sum, letter) => sum + (pen[letter]?.[0] || 26), 0))) + 18;
  svg.setAttribute('viewBox', `-4 0 ${width} 100`);
  svg.setAttribute('preserveAspectRatio', 'xMinYMid meet');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  let offset = 0;
  const strokes = [];
  for (const letter of word) {
    const [advance, shapes] = pen[letter];
    for (const shape of shapes.flatMap(value => value.match(/M[^M]*/g) || [])) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', shape); path.setAttribute('transform', `translate(${offset} 0)`);
      path.setAttribute('pathLength', '1');
      path.style.strokeDasharray = '1'; path.style.strokeDashoffset = reduced.matches ? '0' : '1';
      svg.append(path); strokes.push(path);
    }
    offset += advance;
  }
  root.dataset.initialized = 'true'; root.dataset.word = word;
  root.setAttribute('aria-label', `Life, ${word}`);
  slot.replaceChildren(svg);
  const animations = [];
  function finish() {
    animations.forEach(animation => animation.cancel());
    strokes.forEach(path => { path.style.strokeDashoffset = '0'; });
  }
  if (!reduced.matches && typeof svg.animate === 'function') {
    const lengths = strokes.map(path => path.getTotalLength());
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let delay = 0;
    strokes.forEach((path, index) => {
      const duration = 2500 * lengths[index] / total;
      const animation = path.animate([{strokeDashoffset:1}, {strokeDashoffset:0}], {duration, delay, easing:'linear', fill:'forwards'});
      animation.onfinish = () => { path.style.strokeDashoffset = '0'; animation.cancel(); };
      animations.push(animation); delay += duration;
    });
  } else finish();
  // Never replay, rotate words or restart after a tab/page-cache restore.
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  window.addEventListener('pagehide', finish);
})();
