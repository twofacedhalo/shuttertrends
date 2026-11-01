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
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selected = pool.slice(0, Math.min(pool.length, 1 + Math.floor(Math.random() * 3)));
  const mobile = matchMedia('(max-width: 600px)');
  const tablet = matchMedia('(max-width: 1000px)');
  const nodes = new Map();
  function render() {
    const count = Math.min(selected.length, mobile.matches ? 1 : tablet.matches ? 2 : 3);
    for (let i = 0; i < selected.length; i++) {
      if (i >= count) {
        nodes.get(i)?.remove();
        continue;
      }
      if (!nodes.has(i)) {
        const photo = selected[i];
        const frame = document.createElement('div');
        frame.className = 'st-background-frame';
        frame.style.setProperty('--photo-extension', `url("${photo.src}")`);
        const image = document.createElement('img');
        image.className = 'st-background-photo';
        image.alt = ''; image.draggable = false;
        image.decoding = 'async'; image.fetchPriority = 'low';
        image.dataset.photoId = photo.id || photo.src;
        if (photo.width) image.width = photo.width;
        if (photo.height) image.height = photo.height;
        image.onload = async () => {
          try { await image.decode(); } catch {}
          image.classList.add('is-loaded');
        };
        image.onerror = () => { image.classList.remove('is-loaded'); };
        // Only selected, currently displayed images get a source. Never request originals.
        image.sizes = '(max-width: 600px) 92vw, (max-width: 1000px) 52vw, 48vw';
        if (photo.srcset) image.srcset = photo.srcset;
        image.src = photo.src;
        frame.append(image);
        nodes.set(i, frame);
      }
      if (!nodes.get(i).isConnected) layer.append(nodes.get(i));
    }
  }
  mobile.addEventListener('change', render);
  tablet.addEventListener('change', render);
  render();
})();
