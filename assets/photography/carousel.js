(() => {
  'use strict';
  function initialize(gallery, source, showcase = false) {
    const photos = (Array.isArray(source) ? source : []).filter(p => p && p.src && p.alt);
    if (!photos.length) return { select() {} };
    const stage = gallery.querySelector('.st-gallery__stage');
    const empty = gallery.querySelector('.st-gallery__empty');
    const controls = gallery.querySelector('.st-gallery__controls');
    const counter = gallery.querySelector('.st-gallery__counter');
    const status = gallery.querySelector('[role="status"]');
    const metadata = gallery.querySelector('.st-gallery__metadata');
    const previous = gallery.querySelector('[data-prev]');
    const next = gallery.querySelector('[data-next]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 600px)');
    let current = -1, target = 0, request = 0, start = null;
    let timer = 0, hovered = false, focused = false, touching = false, visible = false;
    let userPaused = false, modalPaused = false, loading = false, departed = false;
    const wrap = index => (index + photos.length) % photos.length;
    const slides = photos.map((photo, index) => {
      const figure = document.createElement('figure');
      figure.className = 'st-gallery__slide';
      figure.setAttribute('role', 'group');
      figure.setAttribute('aria-roledescription', 'slide');
      figure.setAttribute('aria-label', `${index + 1} of ${photos.length}`);
      figure.setAttribute('aria-hidden', 'true');
      const img = document.createElement('img');
      img.alt = photo.alt; img.decoding = 'async'; img.draggable = false;
      if (photo.width) img.width = showcase ? (photo.showcaseWidth || photo.width) : photo.width;
      if (photo.height) img.height = showcase ? (photo.showcaseHeight || photo.height) : photo.height;
      figure.append(img); stage.append(figure);
      return { figure, img, loaded: null };
    });
    const previews = [];
    let rotation;
    if (showcase) {
      gallery.classList.add('st-gallery--cinematic');
      previous.classList.add('st-gallery__arrow', 'st-gallery__arrow--prev');
      next.classList.add('st-gallery__arrow', 'st-gallery__arrow--next');
      stage.append(previous, next);
      ['previous', 'next'].forEach((direction, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = `st-gallery__preview st-gallery__preview--${direction}`;
        button.hidden = true;
        button.addEventListener('click', () => go(Number(button.dataset.index)));
        stage.prepend(button); previews[index] = button;
      });
      rotation = document.createElement('button'); rotation.type = 'button';
      rotation.className = 'st-gallery__rotation'; rotation.dataset.rotation = '';
      rotation.hidden = photos.length < 2;
      rotation.addEventListener('click', () => { userPaused = !userPaused; schedule(); });
      controls.append(rotation);
    }
    function modalOpen() {
      return modalPaused || [...document.querySelectorAll('dialog[open], [aria-modal="true"]')]
        .some(el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');
    }
    function canRotate() {
      return showcase && photos.length > 1 && current >= 0 && visible && !departed && !loading &&
        !document.hidden && !reduced.matches && !userPaused && !hovered && !focused && !touching && !modalOpen();
    }
    function stop() { clearTimeout(timer); timer = 0; }
    function schedule() {
      stop();
      if (rotation) {
        rotation.disabled = reduced.matches;
        rotation.textContent = reduced.matches ? 'Motion off' : userPaused ? 'Play' : 'Pause';
        rotation.setAttribute('aria-label', reduced.matches ? 'Automatic rotation disabled by reduced-motion preference' : userPaused ? 'Play automatic rotation' : 'Pause automatic rotation');
        rotation.setAttribute('aria-pressed', String(userPaused || reduced.matches));
        rotation.title = 'Rotation pauses while hovered, focused, interacting, offscreen, or viewing a dialog.';
      }
      status.setAttribute('aria-live', canRotate() ? 'off' : 'polite');
      if (canRotate()) timer = setTimeout(() => { timer = 0; go(target + 1, false); }, 7000);
    }
    function layout() {
      if (!showcase || current < 0) return;
      const width = stage.clientWidth, height = stage.clientHeight;
      const photo = photos[current];
      const ratio = photo.aspectRatio || (photo.width / photo.height) || 1.5;
      const side = narrow.matches || photos.length < 2 ? 0 : (width - Math.min(height * ratio, width * .76)) / 2;
      stage.style.setProperty('--st-side-width', `${side}px`);
      stage.style.setProperty('--st-photo-frame-inset', `${side ? side + 12 : 0}px`);
      // Each fading slide retains its own geometry to prevent zooming/jumping mid-fade.
      slides[current].figure.style.setProperty('--st-center-inset', `${side ? side + 12 : 0}px`);
    }
    function load(index) {
      const slide = slides[index];
      if (!slide.loaded) slide.loaded = new Promise((resolve, reject) => {
        slide.img.onload = async () => {
          try { await slide.img.decode(); } catch {}
          const width = slide.img.naturalWidth, height = slide.img.naturalHeight;
          const orientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait';
          Object.assign(slide.figure.dataset, { orientation, naturalWidth: String(width), naturalHeight: String(height), aspectRatio: String(width / height) });
          Object.assign(photos[index], { naturalWidth: width, naturalHeight: height, aspectRatio: width / height, orientation });
          resolve();
        };
        slide.img.onerror = () => { slide.loaded = null; reject(new Error('Image unavailable')); };
        const srcset = (showcase && photos[index].showcaseSrcset) || photos[index].srcset;
        if (srcset) {
          slide.img.sizes = photos[index].sizes || '(max-width: 1408px) calc(100vw - 48px), 1360px';
          slide.img.srcset = srcset;
        }
        slide.img.src = (showcase && photos[index].showcaseSrc) || photos[index].src;
      });
      return slide.loaded;
    }
    const previewCache = new Map();
    function previewImage(index) {
      if (!previewCache.has(index)) previewCache.set(index, new Promise(resolve => {
        const img = new Image(); img.alt = ''; img.draggable = false; img.decoding = 'async';
        img.onload = async () => { try { await img.decode(); } catch {} resolve(img); };
        img.onerror = () => resolve(null);
        img.src = photos[index].thumbnail || photos[index].src;
      }));
      return previewCache.get(index);
    }
    async function updatePreviews(index, token) {
      if (!showcase) return;
      const indices = photos.length < 2 || narrow.matches ? [null, null] : [photos.length > 2 ? wrap(index - 1) : null, wrap(index + 1)];
      const images = await Promise.all(indices.map(i => i === null ? null : previewImage(i)));
      if (token !== request) return;
      previews.forEach((button, side) => {
        const i = indices[side], img = images[side];
        button.hidden = !img;
        if (!img) return;
        button.dataset.index = String(i);
        button.setAttribute('aria-label', `View ${side ? 'next' : 'previous'} photograph: ${photos[i].title || photos[i].alt}`);
        // Decode before replacement; the old thumbnail remains painted while loading.
        button.replaceChildren(img.cloneNode());
      });
    }
    async function show(index, announce = true) {
      const token = ++request; loading = true; schedule();
      gallery.setAttribute('aria-busy', 'true');
      try {
        await load(index);
        if (token !== request) return;
        // Prepare thumbnails before committing the new central photo and neighbor labels.
        await updatePreviews(index, token);
        if (token !== request) return;
        current = index; layout();
        slides.forEach(({ figure }, i) => {
          figure.classList.toggle('is-active', i === index);
          figure.setAttribute('aria-hidden', String(i !== index));
        });
        empty.hidden = true; metadata.replaceChildren();
        ['title', 'caption', 'location'].forEach(key => {
          if (!photos[index][key]) return;
          const line = document.createElement('p'); line.className = `st-gallery__${key}`;
          line.textContent = photos[index][key]; metadata.append(line);
        });
        const link = document.createElement('a'); link.className = 'st-gallery__collection';
        if (showcase && photos[index].collectionUrl) {
          link.href = photos[index].collectionUrl; link.textContent = 'View collection: ' + photos[index].collectionTitle; metadata.append(link);
        } else if (!showcase) {
          link.href = photos[index].fullSrc || photos[index].src; link.textContent = 'Open larger photograph'; metadata.append(link);
        }
        counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
        controls.hidden = false; previous.hidden = next.hidden = photos.length < 2;
        if (announce) status.textContent = `Photograph ${index + 1} of ${photos.length}. ${photos[index].title || photos[index].alt}`;
      } catch {
        if (token !== request) return;
        if (current < 0) { counter.textContent = `— / ${String(photos.length).padStart(2, '0')}`; empty.textContent = 'This photograph is unavailable. Please try another photograph.'; }
        controls.hidden = false; previous.hidden = next.hidden = photos.length < 2;
        status.textContent = 'Unable to load photograph. Please try again or choose another photograph.';
      } finally {
        if (token === request) { loading = false; gallery.setAttribute('aria-busy', 'false'); schedule(); }
      }
    }
    function go(index, announce = true) { target = wrap(index); show(target, announce); }
    previous.addEventListener('click', () => go(target - 1)); next.addEventListener('click', () => go(target + 1));
    gallery.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const destinations = { ArrowLeft: target - 1, ArrowRight: target + 1, Home: 0, End: photos.length - 1 };
      if (!(event.key in destinations)) return;
      event.preventDefault(); go(destinations[event.key]);
    });
    gallery.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
    gallery.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    gallery.addEventListener('focusin', () => { focused = true; schedule(); });
    gallery.addEventListener('focusout', () => { queueMicrotask(() => { focused = gallery.contains(document.activeElement); schedule(); }); });
    stage.addEventListener('pointerdown', event => {
      touching = true; schedule();
      if (event.pointerType === 'touch' && event.isPrimary) {
        start = { x:event.clientX, y:event.clientY, id:event.pointerId };
        // Let buttons retain native click/focus behavior; capture drags on the photo only.
        if (!event.target.closest('button')) stage.setPointerCapture(event.pointerId);
      }
    });
    window.addEventListener('pointerup', () => { touching = false; schedule(); });
    stage.addEventListener('pointercancel', () => { start = null; touching = false; schedule(); });
    stage.addEventListener('pointerup', event => {
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(target + (dx < 0 ? 1 : -1));
    });
    if (showcase) {
      // Ignore own UI mutations so they cannot repeatedly reset the timer.
      const onModalChange = new MutationObserver(records => {
        if (records.some(r => !gallery.contains(r.target))) schedule();
      });
      onModalChange.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:['open','aria-modal','hidden'] });
      document.addEventListener('st-lightbox-open', () => { modalPaused = true; schedule(); });
      document.addEventListener('st-lightbox-close', () => { modalPaused = false; schedule(); });
      document.addEventListener('visibilitychange', schedule);
      window.addEventListener('pagehide', () => { departed = true; stop(); });
      window.addEventListener('pageshow', () => { departed = false; schedule(); });
      reduced.addEventListener('change', schedule);
      const resize = new ResizeObserver(layout); resize.observe(stage);
      narrow.addEventListener('change', () => { layout(); if (current >= 0) updatePreviews(current, request); });
    }
    if ('IntersectionObserver' in window) {
      const loader = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { loader.disconnect(); show(target, false); }
      }, { rootMargin:'200px' }); loader.observe(gallery);
      if (showcase) {
        const viewport = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .15 }); viewport.observe(stage);
      }
    } else { visible = true; show(0, false); }
    schedule();
    return { select: go };
  }
  window.shutterTrendsCreateCarousel = (photos, label) => {
    const element = document.createElement('div'); element.className = 'st-gallery'; element.dataset.stGallery = '';
    element.setAttribute('role', 'region'); element.setAttribute('aria-roledescription', 'carousel'); element.setAttribute('aria-label', label); element.tabIndex = 0;
    element.innerHTML = '<p class="st-gallery__sr">Use Left/Right arrows, Home/End, the buttons, or swipe to browse photographs.</p><div class="st-gallery__stage"><p class="st-gallery__empty">Photographs will appear here as they become available.</p></div><div class="st-gallery__footer"><div class="st-gallery__metadata" tabindex="0" role="group" aria-label="Photograph details"></div><div class="st-gallery__controls" hidden><button type="button" data-prev aria-label="Previous photograph"><span aria-hidden="true">&#8592;</span></button><span class="st-gallery__counter"></span><button type="button" data-next aria-label="Next photograph"><span aria-hidden="true">&#8594;</span></button></div></div><p class="st-gallery__sr" role="status" aria-live="polite" aria-atomic="true"></p>';
    return { element, ...initialize(element, photos) };
  };
  const homepage = document.querySelector('[data-st-gallery]');
  if (homepage) initialize(homepage, window.shutterTrendsPhotos, true);
})();
