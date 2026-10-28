(() => {
  'use strict';
  const header = document.querySelector('[data-st-header]');
  if (!header) return;
  const root = new URL('../../', document.currentScript.src);
  const panel = header.querySelector('[data-st-nav]');
  const toggle = header.querySelector('[data-st-menu-toggle]');
  const mobile = matchMedia('(max-width: 1000px)');
  const links = [...panel.querySelectorAll('a')];
  let opened = false;
  header.dataset.enhanced = 'true';
  function setOpen(open, restoreFocus = false) {
    opened = mobile.matches && open;
    panel.hidden = mobile.matches && !opened;
    toggle.hidden = !mobile.matches;
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.setAttribute('aria-label', opened ? 'Close menu' : 'Open menu');
    toggle.querySelector('[data-menu-open]').hidden = opened;
    toggle.querySelector('[data-menu-close]').hidden = !opened;
    if (restoreFocus && mobile.matches) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    setOpen(!opened);
    if (opened) links[0]?.focus();
  });
  toggle.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && mobile.matches) {
      event.preventDefault(); setOpen(true); links[0]?.focus();
    }
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && opened) { event.preventDefault(); setOpen(false, true); }
  });
  panel.addEventListener('click', event => {
    if (event.target.closest('a') && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) setOpen(false);
  });
  document.addEventListener('click', event => { if (opened && !header.contains(event.target)) setOpen(false); });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && header.contains(event.relatedTarget)) return;
    // A microtask can run between blur and focus during a pointer click. Wait for
    // native focus transfer before deciding that the visitor has left the menu.
    setTimeout(() => { if (opened && !header.contains(document.activeElement)) setOpen(false); }, 0);
  });
  mobile.addEventListener('change', () => {
    const hadPanelFocus = panel.contains(document.activeElement);
    const hadToggleFocus = document.activeElement === toggle;
    setOpen(false);
    if (mobile.matches && hadPanelFocus) toggle.focus();
    else if (!mobile.matches && hadToggleFocus) links[0]?.focus();
  });
  window.addEventListener('pagehide', () => setOpen(false));
  const path = url => new URL(url, root).pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
  const current = path(location.href);
  const collection = (window.shutterTrendsPortfolio || []).find(c => c.id === new URLSearchParams(location.search).get('id'));
  const parentCategory = collection?.category === 'concerts' ? 'events' : collection?.category;
  header.querySelectorAll('.st-nav__link').forEach(link => {
    link.removeAttribute('aria-current');
    if (path(link.href) === current) link.setAttribute('aria-current', 'page');
    else if (collection && ['portraits','events'].includes(parentCategory) && path(link.href) === path(parentCategory + '/')) link.setAttribute('aria-current', 'location');
  });
  if (current === path(root.href)) header.querySelector('.st-brand').setAttribute('aria-current', 'page');
  setOpen(false);
})();
