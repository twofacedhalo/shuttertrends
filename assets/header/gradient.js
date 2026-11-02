(() => {
  'use strict';
  const header = document.querySelector('[data-st-header]');
  if (!header || header.dataset.scrollGradient) return;
  let connection = null, frame = 0, measureNeeded = true, bodyTop = 0;
  function paint() {
    frame = 0;
    if (!connection || document.hidden) return;
    if (measureNeeded) {
      const bounds = document.body.getBoundingClientRect();
      bodyTop = bounds.top + window.scrollY;
      header.style.setProperty('--st-header-gradient-height',Math.max(1,bounds.height) + 'px');
      measureNeeded = false;
    }
    // Sample exactly the same document-height gradient band beneath the sticky header.
    header.style.setProperty('--st-header-gradient-y',-Math.max(0,window.scrollY-bodyTop) + 'px');
    header.dataset.scrollGradient = 'true';
  }
  function schedule() { if (connection && !document.hidden && !frame) frame = requestAnimationFrame(paint); }
  function measure() { measureNeeded = true; schedule(); }
  const resize = new ResizeObserver(measure);
  function connect() {
    if (connection) return;
    connection = new AbortController();
    const options = {signal:connection.signal};
    window.addEventListener('scroll',schedule,{...options,passive:true});
    window.addEventListener('resize',measure,options);
    document.addEventListener('visibilitychange',() => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else measure();
    },options);
    measureNeeded = true; paint(); resize.observe(document.body);
  }
  function disconnect() {
    connection?.abort(); connection = null;
    resize.disconnect(); cancelAnimationFrame(frame); frame = 0;
  }
  window.addEventListener('pagehide',disconnect);
  window.addEventListener('pageshow',connect);
  document.fonts?.ready.then(measure);
  connect();
})();
