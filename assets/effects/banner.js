(() => {
  'use strict';
  const hero = document.querySelector('#home-hero');
  const layer = document.querySelector('[data-st-banner-dust]');
  if (!hero || !layer) return;
  const mobile = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, departed = false, resizeFrame = 0;
  function running() {
    layer.dataset.running = String(visible && !departed && !document.hidden && !reduced.matches);
  }
  function position() {
    resizeFrame = 0;
    const banner = hero.getBoundingClientRect();
    const body = document.body.getBoundingClientRect();
    layer.style.setProperty('--dust-top', `${(banner.top - body.top).toFixed(2)}px`);
    layer.style.setProperty('--dust-height', `${banner.height.toFixed(2)}px`);
  }
  function sizeChanged() {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(position);
  }
  function populate() {
    const fragment = document.createDocumentFragment();
    const count = mobile.matches ? 12 : 28;
    for (let i = 0; i < count; i++) {
      const mote = document.createElement('span');
      mote.className = 'st-banner-dust__mote';
      const values = {
        x:`${(Math.random()*100).toFixed(2)}%`,
        y:`${(Math.random()*110).toFixed(2)}%`,
        size:`${(1.2+Math.random()*2.6).toFixed(2)}px`,
        opacity:(.12+Math.random()*.2).toFixed(3),
        duration:`${(32+Math.random()*30).toFixed(2)}s`,
        delay:`${(-Math.random()*62).toFixed(2)}s`,
        drift:`${(-24+Math.random()*48).toFixed(2)}px`
      };
      Object.entries(values).forEach(([key,value]) => mote.style.setProperty(`--dust-${key}`,value));
      fragment.append(mote);
    }
    layer.replaceChildren(fragment);
    running(); sizeChanged();
  }
  const viewport = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; running(); });
  viewport.observe(hero);
  const resize = new ResizeObserver(sizeChanged);
  resize.observe(hero);
  const header = document.querySelector('.wp-site-blocks > header');
  if (header) resize.observe(header);
  document.fonts?.ready.then(sizeChanged);
  mobile.addEventListener('change',populate);
  reduced.addEventListener('change',running);
  document.addEventListener('visibilitychange',running);
  window.addEventListener('pagehide',() => { departed = true; running(); });
  window.addEventListener('pageshow',() => { departed = false; running(); sizeChanged(); });
  populate();
})();
