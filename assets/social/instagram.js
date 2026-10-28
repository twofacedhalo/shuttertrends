(() => {
  'use strict';
  const section = document.querySelector('[data-st-instagram]');
  if (!section) return;
  const config = window.shutterTrendConfig?.instagram || {};
  const photos = new Map((window.shutterTrendsPortfolio || []).flatMap(c => c.photos).map(p => [p.id,p]));
  function instagramUrl(value, profile = false) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || !['instagram.com','www.instagram.com'].includes(url.hostname) || url.username || url.password) return null;
      if (profile ? !/^\/[a-zA-Z0-9._]+\/?$/.test(url.pathname) : !/^\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }
  const seen = new Set();
  for (const item of (config.items || []).slice(0,6)) {
    const photo = photos.get(item.photoId);
    if (!photo || seen.has(photo.id)) continue;
    seen.add(photo.id);
    const post = instagramUrl(item.postUrl);
    const tile = document.createElement(post ? 'a' : 'figure');
    tile.className = 'st-instagram-tile st-preview-frame';
    if (post) { tile.href = post; tile.target = '_blank'; tile.rel = 'noopener noreferrer'; tile.setAttribute('aria-label', `${photo.title || photo.alt} — view on Instagram (opens in a new tab)`); }
    const image = document.createElement('img');
    image.alt = photo.alt; image.width = photo.width; image.height = photo.height;
    image.loading = 'lazy'; image.decoding = 'async';
    image.src = photo.thumbnail || photo.src;
    image.onerror = () => { tile.hidden = true; };
    tile.append(image); section.querySelector('[data-st-instagram-grid]').append(tile);
  }
  const grid = section.querySelector('[data-st-instagram-grid]');
  grid.style.setProperty('--st-instagram-columns', String(Math.max(1, Math.min(grid.children.length, 6))));
  const profile = instagramUrl(config.profileUrl, true);
  const button = section.querySelector('[data-st-instagram-profile]');
  if (profile) { button.href = profile; button.hidden = false; }
  else section.querySelector('[data-st-instagram-setup]').hidden = false;
})();
