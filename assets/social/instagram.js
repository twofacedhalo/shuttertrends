(() => {
  'use strict';
  const section = document.querySelector('[data-st-instagram]');
  if (!section) return;
  const config = window.shutterTrendConfig?.instagram || {};
  function instagramUrl(value, profile = false) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || !['instagram.com','www.instagram.com'].includes(url.hostname) || url.username || url.password) return null;
      if (profile ? !/^\/[a-zA-Z0-9._]+\/?$/.test(url.pathname) : !/^\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }
  const profile = instagramUrl(config.profileUrl, true);
  const button = section.querySelector('[data-st-instagram-profile]');
  if (profile) { button.href = profile; button.hidden = false; }
  else section.querySelector('[data-st-instagram-setup]').hidden = false;
})();
