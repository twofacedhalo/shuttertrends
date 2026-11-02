(() => {
  'use strict';
  const header = document.querySelector('[data-st-header]');
  const brand = header?.querySelector('.st-brand');
  if (!brand || brand.dataset.cameraReady) return;
  brand.dataset.cameraReady = 'true';
  const home = new URL(brand.href);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const flash = document.createElement('div'); flash.className = 'st-camera-flash'; flash.inert = true; flash.setAttribute('aria-hidden','true');
  document.body.append(flash);
  let connection = null, lastShot = -Infinity, visualTimer = 0, navigationTimer = 0;
  function resetVisual() {
    clearTimeout(visualTimer); visualTimer = 0;
    flash.classList.remove('is-flashing'); brand.classList.remove('is-camera-click');
  }
  function shoot() {
    const now = performance.now();
    // Coalesce rapid activation to prevent repeated flashes.
    if (now-lastShot < 1400) return;
    lastShot = now;
    if (!reduced.matches) {
      flash.classList.add('is-flashing'); brand.classList.add('is-camera-click');
      visualTimer = setTimeout(resetVisual,1100);
    }
  }

  const page = path => path.replace(/index\.html$/,'').replace(/\/+$/,'');
  function activate(event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); shoot();
    const menu = header.querySelector('[data-st-menu-toggle]');
    if (menu?.getAttribute('aria-expanded') === 'true') menu.click();
    const current = new URL(window.location.href);
    const alreadyHome = current.origin === home.origin && page(current.pathname) === page(home.pathname);
    if (!alreadyHome && !navigationTimer) navigationTimer = setTimeout(() => {
      navigationTimer = 0; window.location.assign(home.href);
    },1000);
  }
  function connect() {
    if (connection) return;
    connection = new AbortController(); const options = {signal:connection.signal};
    brand.addEventListener('click',activate,options);
    brand.addEventListener('keydown',event => {
      if (event.key === 'Enter' && event.repeat && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) event.preventDefault();
    },options);
    reduced.addEventListener('change',() => { if (reduced.matches) resetVisual(); },options);
  }
  function disconnect() {
    connection?.abort(); connection = null; resetVisual();
    clearTimeout(navigationTimer); navigationTimer = 0;
  }
  window.addEventListener('pagehide',disconnect);
  window.addEventListener('pageshow',connect);
  connect();
})();
