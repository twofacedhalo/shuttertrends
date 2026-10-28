(() => {
  'use strict';
  function initialize(gallery, source, showcase = false) {
  const photos = (Array.isArray(source) ? source : [])
    .filter(photo => photo && typeof photo.src === 'string' && photo.src.trim() && typeof photo.alt === 'string' && photo.alt.trim());
  if (!photos.length) return { select() {} };
  const stage = gallery.querySelector('.st-gallery__stage');
  const empty = gallery.querySelector('.st-gallery__empty');
  const controls = gallery.querySelector('.st-gallery__controls');
  const counter = gallery.querySelector('.st-gallery__counter');
  const status = gallery.querySelector('[role="status"]');
  const metadata = gallery.querySelector('.st-gallery__metadata');
  let current = -1;
  let request = 0;
  let start = null;
  const slides = photos.map((photo, index) => {
    const figure = document.createElement('figure');
    figure.className = 'st-gallery__slide';
    figure.setAttribute('role', 'group');
    figure.setAttribute('aria-roledescription', 'slide');
    figure.setAttribute('aria-label', `${index + 1} of ${photos.length}`);
    figure.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = photo.alt;
    img.decoding = 'async';
    img.draggable = false;
    if (photo.width) img.width = showcase ? (photo.showcaseWidth || photo.width) : photo.width;
    if (photo.height) img.height = showcase ? (photo.showcaseHeight || photo.height) : photo.height;
    figure.append(img);
    stage.append(figure);
    return { figure, img, loaded: null };
  });
  // Only the first image is requested near the viewport; other images load on demand.
  function load(index) {
    const slide = slides[index];
    if (!slide.loaded) slide.loaded = new Promise((resolve, reject) => {
      slide.img.onload = () => {
        const width = slide.img.naturalWidth, height = slide.img.naturalHeight;
        const ratio = width / height;
        const orientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait';
        Object.assign(slide.figure.dataset, { orientation, naturalWidth: String(width), naturalHeight: String(height), aspectRatio: String(ratio) });
        Object.assign(photos[index], { naturalWidth: width, naturalHeight: height, aspectRatio: ratio, orientation });
        resolve();
      };
      slide.img.onerror = () => { slide.loaded = null; reject(new Error('Image unavailable')); };
      if ((showcase && photos[index].showcaseSrcset) || photos[index].srcset) {
        slide.img.sizes = photos[index].sizes || '(max-width: 1408px) calc(100vw - 48px), 1360px';
        slide.img.srcset = (showcase && photos[index].showcaseSrcset) || photos[index].srcset;
      }
      slide.img.src = (showcase && photos[index].showcaseSrc) || photos[index].src;
    });
    return slide.loaded;
  }
  async function show(index, announce = true) {
    const token = ++request;
    gallery.setAttribute('aria-busy', 'true');
    try {
      await load(index);
      if (token !== request) return;
      slides.forEach(({ figure }, i) => {
        figure.classList.toggle('is-active', i === index);
        figure.setAttribute('aria-hidden', String(i !== index));
      });
      current = index;
      empty.hidden = true;
      metadata.replaceChildren();
      ['title', 'caption', 'location'].forEach(key => {
        if (!photos[index][key]) return;
        const line = document.createElement('p');
        line.className = `st-gallery__${key}`;
        line.textContent = photos[index][key];
        metadata.append(line);
      });
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
      controls.hidden = false;
      controls.querySelectorAll('button').forEach(button => { button.hidden = photos.length < 2; });
      const collectionLink = document.createElement('a');
      if (showcase && photos[index].collectionUrl) {
        collectionLink.href = photos[index].collectionUrl;
        collectionLink.textContent = 'View collection: ' + photos[index].collectionTitle;
        collectionLink.className = 'st-gallery__collection';
        metadata.append(collectionLink);
      }
      if (!showcase) {
        const largeLink = document.createElement('a');
        largeLink.href = photos[index].fullSrc || photos[index].src;
        largeLink.textContent = 'Open larger photograph';
        largeLink.className = 'st-gallery__collection';
        metadata.append(largeLink);
      }
      if (announce) status.textContent = `Photograph ${index + 1} of ${photos.length}. ${photos[index].title || photos[index].alt}`;
    } catch {
      if (token !== request) return;
      if (current < 0) counter.textContent = `— / ${String(photos.length).padStart(2, '0')}`;
      if (current < 0) empty.textContent = photos.length > 1 ? 'This photograph is unavailable. Please try the next photograph.' : 'This photograph is currently unavailable.';
      controls.hidden = false;
      controls.querySelectorAll('button').forEach(button => { button.hidden = photos.length < 2; });
      status.textContent = 'Unable to load photograph. Please try again or choose another photograph.';
    } finally {
      if (token === request) gallery.setAttribute('aria-busy', 'false');
    }
  }
  let target = 0;
  function go(index) { target = (index + photos.length) % photos.length; show(target); }
  gallery.querySelector('[data-prev]').addEventListener('click', () => go(target - 1));
  gallery.querySelector('[data-next]').addEventListener('click', () => go(target + 1));
  gallery.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const destinations = { ArrowLeft: target - 1, ArrowRight: target + 1, Home: 0, End: photos.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    go(destinations[event.key]);
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && event.isPrimary) { start = { x:event.clientX, y:event.clientY, id:event.pointerId }; stage.setPointerCapture(event.pointerId); }
  });
  stage.addEventListener('pointercancel', () => { start = null; });
  stage.addEventListener('pointerup', event => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(target + (dx < 0 ? 1 : -1));
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); show(target, false); }
    }, { rootMargin:'200px' });
    observer.observe(gallery);
  } else show(0, false);
  return { select: go };
  }
  // Reuse this same component for ordered event collections and the random showcase.
  window.shutterTrendsCreateCarousel = (photos, label) => {
    const element = document.createElement('div');
    element.className = 'st-gallery';
    element.dataset.stGallery = '';
    element.setAttribute('role', 'region');
    element.setAttribute('aria-roledescription', 'carousel');
    element.setAttribute('aria-label', label);
    element.tabIndex = 0;
    element.innerHTML = '<p class="st-gallery__sr">Use Left/Right arrows, Home/End, the buttons, or swipe to browse photographs.</p><div class="st-gallery__stage"><p class="st-gallery__empty">Photographs will appear here as they become available.</p></div><div class="st-gallery__footer"><div class="st-gallery__metadata" tabindex="0" role="group" aria-label="Photograph details"></div><div class="st-gallery__controls" hidden><button type="button" data-prev aria-label="Previous photograph"><span aria-hidden="true">&#8592;</span></button><span class="st-gallery__counter"></span><button type="button" data-next aria-label="Next photograph"><span aria-hidden="true">&#8594;</span></button></div></div><p class="st-gallery__sr" role="status" aria-live="polite" aria-atomic="true"></p>';
    return { element, ...initialize(element, photos) };
  };
  const homepage = document.querySelector('[data-st-gallery]');
  if (homepage) initialize(homepage, window.shutterTrendsPhotos, true);
})();
