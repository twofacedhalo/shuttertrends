(() => {
  'use strict';
  const layer = document.querySelector('[data-st-photo-background]');
  if (!layer) return;
  const seenIds = new Set(), seenSources = new Set();
  // The normalized portfolio already excludes unpublished collections and photos.
  const pool = (window.shutterTrendsPortfolio || []).flatMap(c => c.photos).filter(photo => {
    if (photo.backgroundEligible !== true || !photo.src || seenSources.has(photo.src) || (photo.id && seenIds.has(photo.id))) return false;
    if (photo.id) seenIds.add(photo.id);
    seenSources.add(photo.src);
    return true;
  });
  if (!pool.length) return; // No image requests; retain the existing charcoal and spotlight.
  // Keep one selection for this document; session history avoids immediate repeats.
  const config = window.shutterTrendConfig?.atmosphericBackground;
  const storageKey = 'shuttertrend-background-photo';
  const key = photo => photo.id || photo.src;
  let previous;
  try { previous = sessionStorage.getItem(storageKey); } catch {}
  const alternatives = config?.avoidImmediateRepeat !== false ? pool.filter(photo => key(photo) !== previous) : pool;
  const candidates = alternatives.length ? alternatives : pool;
  const photo = candidates[Math.floor(Math.random() * candidates.length)];
  try { sessionStorage.setItem(storageKey, key(photo)); } catch {}
  const frame = document.createElement('div');
  frame.className = 'st-background-frame';
  frame.style.setProperty('--photo-extension', `url("${photo.src}")`);
  const image = document.createElement('img');
  image.className = 'st-background-photo';
  image.alt = ''; image.draggable = false;
  image.decoding = 'async'; image.fetchPriority = 'low';
  image.dataset.photoId = key(photo);
  if (photo.width) image.width = photo.width;
  if (photo.height) image.height = photo.height;
  image.onload = async () => {
    try { await image.decode(); } catch {}
    image.classList.add('is-loaded');
  };
  image.onerror = () => image.classList.remove('is-loaded');
  image.sizes = '(max-width: 600px) 92vw, (max-width: 1000px) 80vw, 64vw';
  if (photo.srcset) image.srcset = photo.srcset;
  image.src = photo.src;
  frame.append(image);
  layer.replaceChildren(frame);
})();
