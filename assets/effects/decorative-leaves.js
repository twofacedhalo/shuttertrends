(() => {
  'use strict';
  const config = window.shutterTrendConfig?.seasonalEffects?.decorativeLeaves || {};
  if (config.enabled === false || !document.body.classList.contains('home')) return;
  const mobile = matchMedia('(max-width: 600px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div'); layer.className = 'st-botanical-leaves';
  layer.setAttribute('aria-hidden','true'); layer.inert = true;
  layer.style.setProperty('--st-decor-scale', config.size ?? 1);
  const shapes = [
    ['maple','M49 108L48 87L24 91L28 78L7 61L24 59L17 36L35 44L42 13L52 35L67 19L66 45L89 38L81 59L96 63L73 80L78 91L55 87L54 108','M51 99L49 39M49 75L25 62M49 69L34 48M51 75L76 60M52 62L63 45'],
    ['oak','M49 109L49 96C25 100 17 88 28 81C8 76 12 61 28 62C12 45 25 35 36 46C23 23 39 19 48 34C47 10 63 10 64 30C80 16 88 32 72 46C94 40 99 58 77 65C96 69 90 88 71 84C76 98 63 102 54 96L54 109','M51 99L54 29M51 83L30 72M52 68L33 51M53 81L74 73M53 60L70 47'],
    ['birch','M49 110L51 96L36 90L38 85L25 77L29 70L19 60L26 54L24 43L34 40L34 28L44 25L52 9L59 25L67 29L67 40L78 45L75 55L83 62L75 71L75 79L64 86L65 92L55 97L54 110','M52 100L52 23M52 82L33 70M52 68L33 52M52 52L40 38M52 80L69 69M52 65L71 52M52 49L64 38'],
    ['ginkgo','M48 110L51 83C34 96 10 88 6 70C2 53 12 35 26 24C35 18 43 25 50 37C58 22 68 18 78 27C97 43 100 61 91 77C83 92 64 95 55 84L53 110','M52 83L25 30M52 83L12 59M52 83L37 28M52 83L65 30M52 83L81 38M52 83L91 63']
  ];
  const placements = [[-3,12,190,-28],[20,3,145,24],[1,49,210,19],[31,30,135,-32],[10,77,170,38],[35,83,130,-17],[23,57,155,12],[5,31,130,-40]];
  const count = Math.min(placements.length, Math.max(0,config.desktopCount ?? 7));
  const ns = 'http://www.w3.org/2000/svg';
  const leaves = placements.slice(0,count).map((p,i) => {
    const leaf = document.createElement('div'); leaf.className = 'st-botanical-leaf';
    for (const [key,value] of Object.entries({left:p[0]+'vw',top:p[1]+'vh',size:p[2]+'px',angle:p[3]+'deg'})) leaf.style.setProperty('--botanical-'+key,value);
    const [name,outline,veins] = shapes[i % shapes.length]; leaf.dataset.leaf = name;
    const svg = document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 100 120'); svg.setAttribute('focusable','false');
    const edge = document.createElementNS(ns,'path'); edge.setAttribute('d',outline); edge.setAttribute('class','st-botanical-outline');
    const vein = document.createElementNS(ns,'path'); vein.setAttribute('d',veins); vein.setAttribute('class','st-botanical-veins');
    svg.append(edge,vein); leaf.append(svg); layer.append(leaf); return leaf;
  });
  document.body.append(layer);
  let centers = [];
  function staticLight() {
    leaves.forEach((leaf,i) => leaf.style.setProperty('--leaf-illumination',(mobile.matches || !fine.matches || reduced.matches) && i % 3 === 0 ? .22 : 0));
  }
  function measure() {
    leaves.forEach((leaf,i) => { leaf.hidden = mobile.matches && i >= (config.mobileCount ?? 3); });
    centers = leaves.map(leaf => { const r = leaf.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; });
    staticLight();
  }
  // Share the spotlight's eased coordinates and its existing demand-driven frame loop.
  document.addEventListener('st-spotlight-position',event => {
    if (mobile.matches || !fine.matches || reduced.matches || !event.detail.active || document.hidden) { staticLight(); return; }
    const radius = config.radius ?? 220;
    leaves.forEach((leaf,i) => {
      if (leaf.hidden) return;
      const d = Math.hypot(event.detail.x-centers[i].x,event.detail.y-centers[i].y);
      const t = Math.max(0,1-d/radius);
      leaf.style.setProperty('--leaf-illumination',(t*t*(3-2*t)).toFixed(3));
    });
  });
  window.addEventListener('resize',measure,{passive:true});
  document.addEventListener('visibilitychange',staticLight);
  mobile.addEventListener('change',measure); fine.addEventListener('change',staticLight); reduced.addEventListener('change',staticLight);
  measure();
})();
