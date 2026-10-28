(() => {
  'use strict';
  const collections = window.shutterTrendsPortfolio || [];
  function text(tag, value, className) {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    return element;
  }
  function grid(photos, preview = false, onSelect = null) {
    const useThumbnail = preview || Boolean(onSelect);
    const gallery = document.createElement('div');
    gallery.className = 'st-portfolio';
    photos.forEach((photo, index) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.alt = photo.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      if (photo.width) image.width = photo.width;
      if (photo.height) image.height = photo.height;
      const caption = document.createElement('figcaption');
      ['title', 'caption', 'location'].forEach(key => {
        if (photo[key]) caption.append(text('p', photo[key], `st-portfolio__${key}`));
      });
      image.addEventListener('error', () => {
        if (image.dataset.fallback) {
          image.replaceWith(text('p', `Photograph currently unavailable: ${photo.alt}`, 'st-portfolio__unavailable'));
        } else {
          image.dataset.fallback = 'true';
          image.removeAttribute('srcset');
          image.src = photo.src;
        }
      });
      const link = document.createElement('a');
      link.href = preview ? photo.collectionUrl : (photo.fullSrc || photo.src);
      if (preview) link.setAttribute('aria-label', `View ${photo.collectionTitle}: ${photo.alt}`);
      if (onSelect) link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onSelect(index);
      });
      link.append(image);
      figure.append(link, caption);
      gallery.append(figure);
      // Native lazy loading requests only nearby previews, not all originals.
      if (!useThumbnail || !photo.thumbnail) image.dataset.fallback = 'true';
      if (!useThumbnail && photo.srcset) {
        image.sizes = '(max-width: 700px) calc(100vw - 48px), (max-width: 1408px) calc((100vw - 80px) / 2), 664px';
        image.srcset = photo.srcset;
      }
      image.src = useThumbnail && photo.thumbnail ? photo.thumbnail : photo.src;
    });
    return gallery;
  }
  function section(collection, preview = false) {
    const element = document.createElement('section');
    element.className = 'st-collection';
    const heading = text('h3', collection.title);
    heading.id = `collection-${collection.id}`;
    element.setAttribute('aria-labelledby', heading.id);
    element.append(heading);
    if (collection.description) element.append(text('p', collection.description, 'st-collection__description'));
    if (collection.date || collection.location) element.append(text('p', [collection.date, collection.location].filter(Boolean).join(' · '), 'st-collection__details'));
    if (collection.photos.length) element.append(grid(preview ? collection.photos.slice(0, 3) : collection.photos, preview));
    else element.append(text('p', 'Photographs will appear here as the collection becomes available.', 'st-collection__empty'));
    if (preview) {
      const link = text('a', 'View full collection →', 'st-collection__link');
      link.href = collection.url;
      link.setAttribute('aria-label', `View full collection: ${collection.title}`);
      element.append(link);
    }
    return element;
  }
  document.querySelectorAll('[data-st-collection]').forEach(container => {
    const category = container.dataset.stCollection;
    container.className = 'st-collections';
    const matches = collections.filter(c => c.id === category || c.category === category || (category === 'events' && c.category === 'concerts'));
    matches.forEach(c => container.append(section(c, true)));
  });
  const previews = document.querySelector('[data-st-collections]');
  if (previews) collections.forEach(c => previews.append(section(c, true)));
  const detail = document.querySelector('[data-st-detail]');
  if (detail) {
    const id = new URLSearchParams(location.search).get('id');
    const collection = collections.find(c => c.id === id);
    const heading = document.querySelector('[data-st-detail-heading]');
    if (collection) {
      heading.textContent = collection.title;
      document.title = `${collection.title} – ShutterTrends`;
      detail.replaceChildren();
      if (collection.description) detail.append(text('p', collection.description, 'st-collection__description'));
      if (collection.date || collection.location) detail.append(text('p', [collection.date, collection.location].filter(Boolean).join(' · '), 'st-collection__details'));
      if (collection.photos.length) {
        const viewer = window.shutterTrendsCreateCarousel(collection.photos, collection.title + ' photographs');
        detail.append(viewer.element);
        detail.append(text('h2', 'Explore the collection', 'wp-block-heading'));
        detail.append(grid(collection.photos, false, index => {
          viewer.select(index);
          viewer.element.focus({ preventScroll: true });
          viewer.element.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }));
      } else detail.append(text('p', 'Photographs will appear here as the collection becomes available.'));
    } else {
      heading.textContent = id ? 'Collection unavailable' : 'Photography collections';
      detail.replaceChildren(text('p', id ? 'This collection is unavailable. Explore the published collections below.' : 'Explore the published collections below.'));
      collections.forEach(c => detail.append(section(c, true)));
    }
  }
})();
