(() => {
  'use strict';
  const config = window.shutterTrendsHomeFeatures || {};
  const photos = new Map((window.shutterTrendsPortfolio || []).flatMap(c => c.photos).map(photo => [photo.id, photo]));
  document.querySelectorAll('[data-st-home-feature]').forEach(container => {
    const ids = config[container.dataset.stHomeFeature];
    if (!Array.isArray(ids)) return;
    [...new Set(ids)].slice(0, 2).forEach(id => {
      const photo = photos.get(id);
      // Invalid IDs and unpublished photos leave the category's useful text/link intact.
      if (!photo) return;
      const link = document.createElement('a');
      link.className = 'st-home-feature__photo';
      link.href = photo.collectionUrl;
      link.setAttribute('aria-label', `View collection: ${photo.collectionTitle}`);
      const image = document.createElement('img');
      image.alt = photo.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      if (photo.width) image.width = photo.width;
      if (photo.height) image.height = photo.height;
      image.addEventListener('error', () => { link.hidden = true; }, { once: true });
      if (photo.srcset) {
        image.sizes = '(max-width: 760px) calc(100vw - 48px), (max-width: 1408px) calc((100vw - 96px) / 2), 656px';
        image.srcset = photo.srcset;
      }
      image.src = photo.src;
      link.append(image);
      container.append(link);
    });
  });
})();
