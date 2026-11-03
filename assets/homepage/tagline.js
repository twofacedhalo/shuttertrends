(() => {
  'use strict';
  const root = document.querySelector('[data-st-hero-tagline]');
  if (!root || root.dataset.initialized) return;
  // Edit this array to change the available headline words.
  const words = ['Unscripted.', 'Unfiltered.', 'Unposed.', 'Unplanned.', 'Unrehearsed.', 'Uninterrupted.'];
  const ink = root.querySelector('.st-hero-tagline__ink');
  if (!ink || !words.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'shuttertrend.previousHeroWord';
  let previous = null;
  try { previous = sessionStorage.getItem(key); } catch { /* Optional storage. */ }
  const candidates = words.filter(word => word !== previous);
  const choices = candidates.length ? candidates : words;
  const word = choices[Math.floor(Math.random() * choices.length)];
  try { sessionStorage.setItem(key, word); } catch { /* Restricted tabs still load. */ }
  root.dataset.initialized = 'true'; root.dataset.word = word;
  root.setAttribute('aria-label', `Life, ${word}`);
  ink.textContent = word;
  let animation = null, completed = reduced.matches || document.hidden;
  const hidden = 'polygon(0% 0%,0% 0%,0% 100%,0% 100%)';
  ink.style.clipPath = completed ? 'none' : hidden;
  function finish() {
    completed = true; animation?.cancel(); animation = null;
    ink.style.clipPath = 'none';
  }
  async function write() {
    if (completed) return;
    // Wait for the real face before revealing it. A slow/failed font cannot leave a blank word.
    let timeout;
    try {
      const loaded = await Promise.race([
        document.fonts.load('italic 700 76px "ShutterTrend Script"'),
        new Promise(resolve => { timeout = setTimeout(() => resolve([]), 1800); })
      ]);
      if (!loaded.length) ink.style.fontFamily = "'Segoe Script','Snell Roundhand',cursive";
    } catch { ink.style.fontFamily = "'Segoe Script','Snell Roundhand',cursive"; }
    finally { clearTimeout(timeout); }
    if (completed || reduced.matches || document.hidden || !ink.isConnected) { finish(); return; }
    if (typeof ink.animate !== 'function') { finish(); return; }
    // A gently slanted leading edge reveals the unmodified calligraphy from left to right.
    // Bold filled glyphs are preserved; this is a mask reveal, not a fake outline stroke.
    animation = ink.animate([
      {clipPath:hidden, offset:0},
      {clipPath:'polygon(0% 0%,18% 0%,10% 100%,0% 100%)', offset:.18},
      {clipPath:'polygon(0% 0%,58% 0%,50% 100%,0% 100%)', offset:.54},
      {clipPath:'polygon(0% 0%,100% 0%,92% 100%,0% 100%)', offset:.94},
      {clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)', offset:1}
    ], {duration:2500, easing:'linear', fill:'forwards'});
    animation.onfinish = finish;
  }
  // Complete the same word on lifecycle changes; never replay or reselect it.
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  window.addEventListener('pagehide', finish);
  write();
})();
