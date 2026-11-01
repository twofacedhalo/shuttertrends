(() => {
  'use strict';
  const reel = document.querySelector('[data-st-filmstrip]');
  const header = document.querySelector('[data-st-header]');
  const cards = document.querySelector('.st-home-feature-grid');
  if (!reel || !header || !cards || reel.dataset.polished) return;
  reel.dataset.polished = 'true';
  const viewport = reel.querySelector('.st-film-viewport');
  const frames = [...reel.querySelectorAll('.st-film-frame')];
  const portfolio = window.shutterTrendsPortfolio || [];
  const categories = {
    events:['events','concerts','personal-events','lynchburg'],
    personal:['portraits'], weddings:['weddings'], graduations:['graduations']
  };
  const matches = new Map([...cards.querySelectorAll('.st-home-feature')].map(card => {
    const key = card.querySelector('[data-st-home-feature]')?.dataset.stHomeFeature;
    const ids = new Set(portfolio.filter(c => categories[key]?.includes(c.category)).map(c => c.id));
    return [card, new Set(frames.filter(frame => ids.has(frame.dataset.collectionId)))];
  }));
  let hovered = null, focused = null, activeCard = null, connection = null, headerHeight = 0;
  function measureHeader() {
    if (!connection) return;
    const height = Math.ceil(header.getBoundingClientRect().height);
    if (height && height !== headerHeight) {
      headerHeight = height;
      document.body.style.setProperty('--st-reel-header-height',height + 'px');
    }
  }
  const resize = new ResizeObserver(measureHeader);
  function highlight() {
    const card = focused || hovered;
    if (card === activeCard) return;
    activeCard = card;
    const active = matches.get(card);
    frames.forEach(frame => frame.classList.toggle('is-collection-match',active?.has(frame) || false));
  }
  function interacted() { reel.classList.add('is-interacted'); }
  function connect() {
    if (connection) return;
    connection = new AbortController();
    const options = {signal:connection.signal};
    cards.addEventListener('pointerover',event => {
      if (event.pointerType !== 'mouse') return;
      hovered = event.target.closest('.st-home-feature'); highlight();
    },options);
    cards.addEventListener('pointerout',event => {
      hovered = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.st-home-feature') : null;
      highlight();
    },options);
    cards.addEventListener('focusin',event => { focused = event.target.closest('.st-home-feature'); highlight(); },options);
    cards.addEventListener('focusout',() => queueMicrotask(() => {
      if (!connection) return;
      focused = cards.contains(document.activeElement) ? document.activeElement.closest('.st-home-feature') : null;
      highlight();
    }),options);
    viewport.addEventListener('pointerenter',event => { if (event.pointerType === 'mouse') interacted(); },options);
    viewport.addEventListener('pointerdown',interacted,options);
    reel.addEventListener('focusin',interacted,options);
    resize.observe(header); measureHeader();
  }
  function disconnect() {
    connection?.abort(); connection = null; resize.disconnect();
    hovered = focused = null; highlight();
  }
  window.addEventListener('pagehide',disconnect);
  window.addEventListener('pageshow',connect);
  document.fonts?.ready.then(measureHeader);
  connect();
})();
