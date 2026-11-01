(() => {
  'use strict';
  const main = document.querySelector('main');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!main || reduced.matches || !('IntersectionObserver' in window)) return;
  const seen = new WeakSet(), waiting = new Set(), keys = new Map(), revealed = new Set();
  function show(element) {
    element.classList.add('is-revealed'); observer.unobserve(element); waiting.delete(element);
    const key = keys.get(element); if (key) revealed.add(key);
  }
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) show(entry.target); }); }, {threshold:.05,rootMargin:'0px 0px 60px 0px'});
  document.documentElement.classList.add('st-reveals-enabled');
  function register(element,photo = false,delay = 0,key = '') {
    if (!element || seen.has(element)) return; seen.add(element);
    if (key && revealed.has(key) || reduced.matches) return;
    element.classList.add('st-reveal'); if (photo) element.classList.add('st-reveal--photo');
    element.style.setProperty('--st-reveal-delay', Math.min(650,delay) + 'ms');
    if (key) keys.set(element,key);
    waiting.add(element); observer.observe(element);
  }
  function story(card) {
    const id = card.dataset.storyId || '', single = Number(card.dataset.storySize) === 1;
    register(card.querySelector('.st-story-lead'),true,0,id+':lead');
    const supporting = [...card.querySelectorAll('.st-story-support')];
    supporting.forEach((element,i) => register(element,true,(i+1)*110,id+':support:'+i));
    const titleDelay = single ? 0 : (supporting.length+1)*110;
    register(card.querySelector('h3'),false,titleDelay,id+':title');
    register(card.querySelector('.st-story-category'),false,titleDelay,id+':category');
    register(card.querySelector('.st-story-count'),false,titleDelay,id+':count');
    register(card.querySelector('.st-story-description'),false,single?0:titleDelay+110,id+':description');
    register(card.querySelector('.st-story-view'),false,single?0:titleDelay+220,id+':view');
  }
  function scan() {
    main.querySelectorAll('.st-story-card').forEach(story);
    main.querySelectorAll('h2,h3,p,.wp-block-buttons,.st-portfolio > figure > a,.st-home-feature__photo,[data-st-filmstrip],.st-story-expanded a').forEach((element,i) => {
      if (element.closest('#home-hero,.st-film-viewport,.st-story-card,[data-st-gallery],.st-gallery__sr,.st-story-toolbar') && !element.closest('.st-story-expanded')) return;
      if (element.matches('.st-gallery__sr,[role="status"],.st-film-mark')) return;
      const photo = element.matches('a') || element.hasAttribute('data-st-filmstrip');
      register(element,photo,photo?0:(i%3)*110);
    });
  }
  scan();
  let pending = false;
  new MutationObserver(records => {
    if (!records.some(record=>record.addedNodes.length) || pending) return;
    pending = true; queueMicrotask(()=>{ pending=false; scan(); });
  }).observe(main,{childList:true,subtree:true});
  main.addEventListener('focusin',event => {
    const element = event.target.closest('.st-reveal');
    if (element) { element.classList.add('st-reveal--focus'); show(element); }
  });
  reduced.addEventListener('change',()=>{ if (reduced.matches) { waiting.forEach(show); document.documentElement.classList.remove('st-reveals-enabled'); } });
})();
