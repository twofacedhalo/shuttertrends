// Shared static footer. Run from any directory with node tools/update_footer.cjs.
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||['assets','tools','reports','work','wp-content','wp-includes','node_modules'].includes(e.name)?[]:e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);}
let count=0;
for(const file of walk(root)){
 let html=fs.readFileSync(file,'utf8');if(!/<footer\b/.test(html))continue;
 const prefix='../'.repeat(path.relative(root,file).split(path.sep).length-1);
 const links=[['portraits','Portraits'],['events','Events'],['services','Services'],['about','About'],['contact','Contact']].map(([url,label])=>`<li><a href="${prefix}${url}/">${label}</a></li>`).join('');
 const footer=`<footer class="st-footer site-footer" aria-label="ShutterTrend footer">
<div class="st-footer__inner">
<section class="st-footer__cta" aria-labelledby="st-footer-cta-heading">
<h2 id="st-footer-cta-heading">Have a Moment Worth Capturing?</h2>
<p>Have a moment, milestone, or creative idea in mind? I'd love to hear about it.</p>
<div class="wp-block-buttons is-layout-flex"><div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button" href="${prefix}contact/">Book a Session</a></div></div>
</section>
<div class="st-footer__identity">
<a class="st-footer__brand" href="${prefix||'./'}" aria-label="ShutterTrend homepage"><img src="${prefix}assets/header/logo-mark.svg" width="44" height="44" alt="" loading="lazy"><span>Shutter<span class="st-footer__accent">Trend</span></span></a>
<p class="st-footer__tagline">Candid photography, thoughtfully captured.</p>
<p class="st-footer__location">Lynchburg, Virginia</p>
</div>
<nav class="st-footer__explore" aria-label="Explore"><ul>${links}</ul></nav>
<p class="st-footer__copyright">&copy; 2026 ShutterTrend. All rights reserved.</p>
</div></footer>`;
 // Consolidate only the shared end-of-page booking callouts; other sections stay intact.
 html=html.replace(/<section\b(?=[^>]*\bclass="[^"]*\bst-home-contact\b)[^>]*>[\s\S]*?<\/section>/,'');
 html=html.replace(/<section\b(?=[^>]*\bid="contact-invitation")[^>]*>[\s\S]*?<\/section>/,'');
 html=html.replace(/<footer\b[\s\S]*?<\/footer>/,footer);
 const css=`<link rel="stylesheet" href="${prefix}assets/footer/footer.css">`;
 if(!html.includes(css))html=html.replace('</head>',css+'\n</head>');
 fs.writeFileSync(file,html);count++;
}
console.log(`Updated ${count} full-page footers; redirect-only pages retain their redirects.`);
