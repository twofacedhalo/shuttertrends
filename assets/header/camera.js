(() => {
  'use strict';
  const header = document.querySelector('[data-st-header]');
  const brand = header?.querySelector('.st-brand');
  if (!brand || brand.dataset.cameraReady) return;
  brand.dataset.cameraReady = 'true';
  const root = new URL('../../',document.currentScript.src);
  const home = new URL(brand.href);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'shuttertrend-shutter-muted';
  const wrapper = document.createElement('div'); wrapper.className = 'st-brand-tools';
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'st-camera-sound';
  toggle.setAttribute('aria-label','Shutter sound');
  const status = document.createElement('span'); status.className = 'st-camera-status'; status.setAttribute('role','status');
  brand.before(wrapper); wrapper.append(brand,toggle,status);
  const flash = document.createElement('div'); flash.className = 'st-camera-flash'; flash.inert = true; flash.setAttribute('aria-hidden','true');
  const audio = document.createElement('audio'); audio.preload = 'auto'; audio.volume = .3; audio.setAttribute('aria-hidden','true');
  document.body.append(flash,audio);
  let muted = false, connection = null, lastShot = -Infinity, visualTimer = 0, navigationTimer = 0;
  function updateToggle() {
    toggle.setAttribute('aria-pressed',String(!muted));
    toggle.title = muted ? 'Unmute shutter sound' : 'Mute shutter sound';
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9h4l5-4v14l-5-4H4Z"/>' + (muted ? '<path d="m17 9 5 6m0-6-5 6"/>' : '<path d="M17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>') + '</svg>';
  }
  function resetVisual() {
    clearTimeout(visualTimer); visualTimer = 0;
    flash.classList.remove('is-flashing'); brand.classList.remove('is-camera-click');
  }
  function shoot() {
    const now = performance.now();
    // Coalesce rapid activation to prevent strobing and overlapping audio.
    if (now-lastShot < 900) return;
    lastShot = now;
    if (!reduced.matches) {
      flash.classList.add('is-flashing'); brand.classList.add('is-camera-click');
      visualTimer = setTimeout(resetVisual,400);
    }
    if (!muted && audio.paused) {
      try { audio.currentTime = 0; audio.play()?.catch(() => {}); } catch {}
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
    },360);
  }
  function connect() {
    if (connection) return;
    connection = new AbortController(); const options = {signal:connection.signal};
    try { muted = localStorage.getItem(storageKey) === 'true'; } catch {}
    updateToggle(); audio.src = new URL('assets/audio/camera-shutter.wav',root).href;
    brand.addEventListener('click',activate,options);
    brand.addEventListener('keydown',event => {
      if (event.key === 'Enter' && event.repeat && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) event.preventDefault();
    },options);
    toggle.addEventListener('click',() => {
      muted = !muted;
      try { localStorage.setItem(storageKey,String(muted)); } catch {}
      if (muted) { audio.pause(); try { audio.currentTime = 0; } catch {} }
      updateToggle(); status.textContent = muted ? 'Shutter sound muted.' : 'Shutter sound enabled.';
    },options);
    reduced.addEventListener('change',() => { if (reduced.matches) resetVisual(); },options);
  }
  function disconnect() {
    connection?.abort(); connection = null; resetVisual();
    clearTimeout(navigationTimer); navigationTimer = 0;
    audio.pause(); audio.removeAttribute('src'); audio.load();
  }
  window.addEventListener('pagehide',disconnect);
  window.addEventListener('pageshow',connect);
  connect();
})();
