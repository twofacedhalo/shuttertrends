// Regenerate the shared static header without requiring any production build step.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const logo = fs.readFileSync(path.join(root, 'assets/header/logo-mark.svg'), 'utf8').trim();
const items = [['portraits','Portraits'],['events','Events'],['about','About'],['services','Services'],['contact','Contact']];
function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (entry.name.startsWith('.') || ['assets','wp-content','wp-includes','tools','reports','node_modules'].includes(entry.name)) continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else if (entry.name === 'index.html') files.push(target);
  }
  return files;
}
for (const file of walk(root)) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const depth = relative.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  let html = fs.readFileSync(file, 'utf8');
  const links = items.map(([slug,label]) => {
    const anchor = `<a class="st-nav__link" href="${prefix}${slug}/"${relative===slug+'/index.html'?' aria-current="page"':''}>${label}</a>`;
    if (!['portraits','events'].includes(slug)) return `<li>${anchor}</li>`;
    return `<li class="st-nav__item" data-st-nav-section="${slug}">${anchor}<button class="st-submenu-toggle" type="button" aria-expanded="false" aria-controls="st-mega-${slug}" aria-label="Show ${label} collections" hidden><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor"><path d="m4 6 4 4 4-4"/></svg></button><div class="st-mega-panel" id="st-mega-${slug}" hidden inert><div class="st-mega-grid" data-st-mega-grid></div><a class="st-mega-all" href="${prefix}${slug}/">View all ${label.toLowerCase()} photography &rarr;</a></div></li>`;
  }).join('\n');
  const header = `<header class="st-site-header" data-st-header>
<div class="st-header__inner">
<a class="st-brand" href="${prefix || './'}" aria-label="ShutterTrend homepage"${relative==='index.html'?' aria-current="page"':''}>${logo}<span class="st-brand__wordmark">Shutter<span class="st-brand__accent">Trend</span></span></a>
<button class="st-menu-toggle" type="button" data-st-menu-toggle aria-controls="st-primary-nav" aria-expanded="false" aria-label="Open menu" hidden>
<span data-menu-open><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span>
<span data-menu-close hidden><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
</button>
<nav class="st-nav" id="st-primary-nav" data-st-nav aria-label="Primary navigation"><ul class="st-nav__list">
${links}
<li><a class="st-nav__cta" href="${prefix}contact/">Get in touch</a></li>
</ul></nav></div></header>`;
  if (!/<header\b[\s\S]*?<\/header>/.test(html)) throw Error('Missing header: '+relative);
  html = html.replace(/<header\b[\s\S]*?<\/header>/, header);
  // Brand strings only: lowercase repository paths and existing JS identifiers stay intact.
  html = html.replaceAll('ShutterTrends','ShutterTrend').replaceAll('SHUTTERTRENDS','SHUTTERTREND');
  // The old standalone navigation driver has no place in the new semantic header.
  html = html.replace(/<script\b[^>]*src=["'][^"']*\/themes\/[^"']*\/navigation\.js[^"']*["'][^>]*><\/script>\s*/g,'');
  const extra = ['assets/site-config.js','assets/photography/photos.js','assets/photography/optimized.js','assets/photography/collections.js'];
  for (const asset of extra) {
    const tag = '<script defer src="' + prefix + asset + '"></script>';
    html = html.replace(tag + '\n', '').replace(tag, '');
  }
  const dataScripts = extra.map(asset => '<script defer src="' + prefix + asset + '"></script>').join('\n') + '\n';
  const insertion = html.indexOf('<link rel="stylesheet" href="' + prefix + 'assets/');
  if (insertion >= 0) html = html.slice(0,insertion) + dataScripts + html.slice(insertion);
  else html = html.replace('</head>',dataScripts+'</head>');
  if (!html.includes('assets/header/header.css')) html = html.replace('</head>', `<link rel="stylesheet" href="${prefix}assets/header/header.css">\n<script defer src="${prefix}assets/header/header.js"></script>\n</head>`);
  fs.writeFileSync(file, html);
  console.log(relative);
}
const galleryFile = path.join(root,'assets/photography/galleries.js');
fs.writeFileSync(galleryFile, fs.readFileSync(galleryFile,'utf8').replaceAll('ShutterTrends','ShutterTrend'));
