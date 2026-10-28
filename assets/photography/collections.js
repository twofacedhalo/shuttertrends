(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  const filename = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
  const ids = new Set();
  const source = Array.isArray(window.shutterTrendsCollections) ? window.shutterTrendsCollections : [];
  const collections = source.filter(c => {
    if (!c || !slug(c.id) || ids.has(c.id) || !c.title || !slug(c.folder) || c.published === false) return false;
    ids.add(c.id);
    return true;
  }).map(c => ({
    ...c,
    url: new URL(`collections/?id=${encodeURIComponent(c.id)}`, root).href,
    photos: (Array.isArray(c.photos) ? c.photos : []).filter(p => p && filename(p.file) && typeof p.alt === 'string' && p.alt.trim() && p.published !== false).map(p => ({
      ...p,
      category: p.category || c.category,
      categoryGroup: p.categoryGroup || c.categoryGroup || c.category,
      src: new URL(`assets/images/${c.folder}/${p.file}`, root).href,
      thumbnail: filename(p.thumbnail) ? new URL(`assets/images/${c.folder}/${p.thumbnail}`, root).href : null,
      collectionId: c.id,
      collectionTitle: c.title,
      collectionUrl: new URL(`collections/?id=${encodeURIComponent(c.id)}`, root).href,
      location: p.location || c.location
    }))
  }));
  // Generated derivatives override browser URLs; editable file names remain source keys.
  const optimized = window.shutterTrendsOptimized || {};
  const url = item => new URL('assets/images/optimized/' + item.file, root).href;
  const srcset = items => [...new Map(items.filter(Boolean).map(item => [item.width, item])).values()]
    .sort((a, b) => a.width - b.width).map(item => url(item) + ' ' + item.width + 'w').join(', ');
  collections.forEach(collection => collection.photos.forEach(photo => {
    const variants = optimized[collection.folder + '/' + photo.file];
    if (!variants) return;
    photo.src = url(variants.gallery);
    photo.width = variants.gallery.width;
    photo.height = variants.gallery.height;
    photo.thumbnail = url(variants.thumbnail);
    photo.srcset = srcset([variants.thumbnail, variants.gallery]);
    photo.fullSrc = url(variants.viewer);
    const large = variants.showcase || variants.gallery;
    photo.showcaseSrc = url(large);
    photo.showcaseWidth = large.width;
    photo.showcaseHeight = large.height;
    photo.showcaseSrcset = srcset([variants.thumbnail, variants.gallery, large]);
  }));
  window.shutterTrendsPortfolio = collections;
  window.shutterTrendsCollection = category => collections.filter(c => c.id === category || c.category === category || (category === 'events' && c.category === 'concerts')).flatMap(c => c.photos);
  const seenIds = new Set(), seenSources = new Set();
  const portraitCategory = value => typeof value === 'string' && /^portraits?(?:$|[-/:])/i.test(value.trim());
  const pool = collections.flatMap(c => c.photos).filter(p => {
    if (portraitCategory(p.category) || portraitCategory(p.categoryGroup)) return false;
    if ((p.carouselEligible ?? (p.showcase !== false)) === false || (p.id && seenIds.has(p.id)) || seenSources.has(p.src)) return false;
    if (p.id) seenIds.add(p.id);
    seenSources.add(p.src);
    return true;
  });
  // Fisher–Yates runs once here, never in navigation or rendering handlers.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  window.shutterTrendsPhotos = pool.slice(0, 8);
})();
