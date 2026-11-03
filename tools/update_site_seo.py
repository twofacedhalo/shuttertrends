"""Regenerate static metadata and discovery files from the public photo manifest.
Run from the repository root with Python/Pillow and Node.js. Originals are read only.
Production URL comes from the verified public configuration.
"""
from pathlib import Path
import subprocess,json,re,html,xml.etree.ElementTree as ET
from urllib.parse import urlparse
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parent.parent
code="""const fs=require('fs'),vm=require('vm');const b={window:{},document:{currentScript:{src:''}},URL,Math};vm.runInNewContext(fs.readFileSync('assets/site-config.js','utf8'),b);const base=b.window.shutterTrendConfig.productionUrl;b.document.currentScript.src=base+'assets/photography/collections.js';for(const f of ['photos','optimized','collections'])vm.runInNewContext(fs.readFileSync('assets/photography/'+f+'.js','utf8'),b);console.log(JSON.stringify({base,collections:b.window.shutterTrendsPortfolio}));"""
data=json.loads(subprocess.check_output(['node','-e',code],cwd=ROOT,text=True))
BASE=data['base'];assert BASE.startswith('https://') and BASE.endswith('/')
collections=data['collections']
photos=list({p['id']:p for c in collections for p in c['photos']}.values())
assert all(p.get('alt','').strip() for p in photos),'A published photo needs descriptive alt text'
PAGES={
'':('Candid & Event Photographer in Lynchburg, VA | ShutterTrend','ShutterTrend offers candid photography, portraits, and event coverage in Lynchburg, VA. Capturing genuine expressions and unforgettable moments.','events'),
'portraits':('Candid Portrait Photographer in Lynchburg, VA | ShutterTrend','Explore candid portraits and personal moments by ShutterTrend in Lynchburg, Virginia. Natural expressions, genuine connections, and cinematic storytelling.','portraits'),
'events':('Event Photography in Lynchburg, VA | ShutterTrend','Explore concerts, celebrations, and community moments photographed by ShutterTrend. Inquire about candid event coverage in Lynchburg, Virginia.','events'),
'weddings':('Wedding Photographer in Lynchburg, VA | ShutterTrend','Explore wedding photographs by ShutterTrend and inquire about wedding photography in Lynchburg, Virginia. Genuine expressions and moments as they unfold.','weddings'),
'graduations':('Graduation Photography in Lynchburg, VA | ShutterTrend','Explore graduation photographs by ShutterTrend in Lynchburg, Virginia. Celebrate the pride, excitement, and personal connections behind each milestone.','graduations'),
'services':('Photography Services in Lynchburg, VA | ShutterTrend','Discover ShutterTrend photography services in Lynchburg, Virginia: candid portraits, graduations, weddings, events, and creative collaborations.','events'),
'about':('About ShutterTrend | Lynchburg, VA Photographer','Learn about ShutterTrend and a candid, cinematic approach to photography in Lynchburg, Virginia, focused on authentic moments and visual storytelling.','portraits'),
'contact':('Contact ShutterTrend | Lynchburg Photography','Inquire about portraits, graduations, weddings, or event photography in Lynchburg, Virginia. Share your plans through the ShutterTrend photography inquiry form.','portraits'),
'collections':('Photography Collections in Lynchburg, VA | ShutterTrend','Browse ShutterTrend photography collections: candid portraits, graduations, weddings, concerts, and celebrations, with a focus on Lynchburg, Virginia.','events')}
NAMES={'':'ShutterTrend','portraits':'Personal Moments','events':'Events','weddings':'Weddings','graduations':'Graduations','services':'Services','about':'About','contact':'Contact','collections':'Photography Collections'}
LEGACY={'author/douglasrendlesiii':('Author Archive | ShutterTrend','Legacy author archive. Explore ShutterTrend photography and current services.'),'category/uncategorized':('Uncategorized Archive | ShutterTrend','Legacy WordPress category archive. Explore current ShutterTrend photography.'),'2026/10/27/hello-world':('Hello World — Archived Post | ShutterTrend','Archived WordPress sample post. Visit ShutterTrend for current photography and inquiries.')}

def local(url):
 assert url.startswith(BASE),url
 return ROOT/url[len(BASE):].split('?',1)[0]
def esc(s):return html.escape(str(s),quote=True)
def pageurl(slug):return BASE+(slug+'/' if slug else '')
def category_photos(category):
 if category=='portraits':cats=['portraits']
 elif category=='events':cats=['events','concerts','personal-events']
 else:cats=[category]
 return list({p['id']:p for c in collections if c['category'] in cats for p in c['photos']}.values())
# Four reusable, full-composition JPEG share images; source photos remain untouched.
share=ROOT/'assets/seo';share.mkdir(exist_ok=True)
share_descriptions={}
for category in ['portraits','events','weddings','graduations']:
 candidates=category_photos(category);p=next((p for p in candidates if p['id']=='import-img-3355'),candidates[0])
 share_descriptions[category]=p['alt']
 with Image.open(local(p['showcaseSrc'])) as original:
  image=ImageOps.exif_transpose(original).convert('RGB');image.thumbnail((1200,630),Image.Resampling.LANCZOS)
  output=Image.new('RGB',(1200,630),'#101D35');output.paste(image,((1200-image.width)//2,(630-image.height)//2))
  copyright_exif=Image.Exif()
  for tag in [315,33432]:
   if original.getexif().get(tag):copyright_exif[tag]=original.getexif()[tag]
  output.save(share/(category+'.jpg'),'JPEG',quality=85,optimize=True,icc_profile=original.info.get('icc_profile',b''),exif=copyright_exif)

def gallery_markup(items):
 return ''.join(f'<figure data-photo-id="{esc(p["id"])}"><a href="{esc(p["fullSrc"])}" aria-label="View photograph: {esc(p["alt"])}"><img src="{esc(p["src"])}" srcset="{esc(p.get("srcset",""))}" sizes="(max-width:1008px) calc(100vw - 48px), 960px" width="{p["width"]}" height="{p["height"]}" loading="lazy" decoding="async" alt="{esc(p["alt"])}"></a></figure>' for p in items)
org={'@type':'Organization','@id':BASE+'#organization','name':'ShutterTrend','url':BASE,'description':'ShutterTrend offers candid portraits, graduations, wedding photography, and event coverage in Lynchburg, Virginia, emphasizing natural expressions and unscripted connections.','sameAs':['https://www.instagram.com/shuttertrend/'],'areaServed':{'@type':'City','name':'Lynchburg','containedInPlace':{'@type':'State','name':'Virginia'}},'hasOfferCatalog':{'@type':'OfferCatalog','name':'Photography services','itemListElement':[{'@type':'Offer','itemOffered':{'@type':'Service','name':name,'provider':{'@id':BASE+'#organization'},'areaServed':'Lynchburg, Virginia'}} for name in ['Candid portrait photography','Event photography','Wedding photography','Graduation photography','Creative photography collaborations']]}}
for slug,(title,description,category) in PAGES.items():
 path=ROOT/slug/'index.html';s=path.read_text(encoding='utf8');url=pageurl(slug);image=BASE+'assets/seo/'+category+'.jpg'
 s=re.sub(r'<title>.*?</title>\s*','',s,flags=re.S)
 s=re.sub(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>\s*','',s,flags=re.S)
 s=re.sub(r'<meta\b[^>]*(?:name|property)=["\'](?:description|robots|og:[^"\']*|twitter:[^"\']*|article:[^"\']*)["\'][^>]*>\s*','',s,flags=re.I)
 s=re.sub(r'<link\b[^>]*rel=["\']canonical["\'][^>]*>\s*','',s,flags=re.I)
 graph=[org,{'@type':'WebSite','@id':BASE+'#website','url':BASE,'name':'ShutterTrend','publisher':{'@id':BASE+'#organization'},'inLanguage':'en-US'},{'@type':'CollectionPage' if slug in ['portraits','events','weddings','graduations','collections'] else 'WebPage','@id':url+'#webpage','url':url,'name':title,'description':description,'isPartOf':{'@id':BASE+'#website'},'about':{'@id':BASE+'#organization'},'primaryImageOfPage':{'@type':'ImageObject','url':image,'width':1200,'height':630}}]
 if slug:graph.append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':BASE},{'@type':'ListItem','position':2,'name':NAMES[slug],'item':url}]})
 head=f'<title>{esc(title)}</title>\n<meta name="description" content="{esc(description)}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n<link rel="canonical" href="{url}">\n'
 values={'og:type':'website','og:site_name':'ShutterTrend','og:locale':'en_US','og:title':title,'og:description':description,'og:url':url,'og:image':image,'og:image:width':'1200','og:image:height':'630','og:image:type':'image/jpeg','og:image:alt':share_descriptions[category],'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':description,'twitter:image':image,'twitter:image:alt':share_descriptions[category]}
 head+='\n'.join(f'<meta {"name" if key.startswith("twitter:") else "property"}="{key}" content="{esc(value)}">' for key,value in values.items())
 head+='\n<script type="application/ld+json" id="st-seo-schema">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('</','<\\/')+'</script>\n'
 s=s.replace('</head>',head+'</head>')
 # Provide real HTML image references before the small JS enhancement runs.
 if slug in ['graduations','weddings']:
  pattern=r'(<div class="st-vertical-gallery" data-st-vertical-gallery="'+slug+r'"[^>]*>).*?(</div>)'
  s,n=re.subn(pattern,lambda m:m[1]+gallery_markup(category_photos(slug)[:10] if slug=='graduations' else category_photos(slug))+m[2],s,flags=re.S);assert n==1
 if slug=='collections':
  s=re.sub(r'<noscript>.*?</noscript>','',s,flags=re.S)
  links=''.join(f'<li><a href="{pageurl(k)}">{NAMES[k]}</a></li>' for k in ['portraits','events','weddings','graduations'])
  fallback='<noscript><nav aria-label="Photography galleries"><ul>'+links+'</ul></nav><div class="st-portfolio">'+gallery_markup(photos)+'</div></noscript>'
  s=s.replace('Loading collection…</p>','Explore the photography galleries.</p>')
  s=s.replace('Explore the photography galleries.</p>','Explore the photography galleries.</p>'+fallback)
 path.write_text(s,encoding='utf8',newline='\n')
for slug,(title,description) in LEGACY.items():
 path=ROOT/slug/'index.html';s=path.read_text(encoding="utf8");s=re.sub(r'<title>.*?</title>\s*',f'<title>{esc(title)}</title>',s,flags=re.S);s=re.sub(r'<meta name="robots"[^>]*>','<meta name="robots" content="noindex,follow">',s);s=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{esc(description)}">',s);s=re.sub(r'<link rel="canonical"[^>]*>\s*','',s);s=s.replace('</head>',f'<link rel="canonical" href="{pageurl(slug)}">\n</head>');s=re.sub(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>\s*','',s,flags=re.S);path.write_text(s,encoding="utf8",newline="\n")
p=ROOT/'stories/index.html';s=p.read_text(encoding="utf8");s=re.sub(r'<link rel="canonical"[^>]*>\s*','',s);s=s.replace('</head>',f'<link rel="canonical" href="{BASE}collections/"></head>');p.write_text(s,encoding="utf8",newline="\n")
# No invented lastmod dates; only canonical, indexable landing pages.
ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9');ET.register_namespace('image','http://www.google.com/schemas/sitemap-image/1.1')
ns='{http://www.sitemaps.org/schemas/sitemap/0.9}';ins='{http://www.google.com/schemas/sitemap-image/1.1}';tree=ET.Element(ns+'urlset')
for slug in PAGES:
 node=ET.SubElement(tree,ns+'url');ET.SubElement(node,ns+'loc').text=pageurl(slug)
 relevant=photos if slug=='collections' else category_photos(slug) if slug in ['portraits','events','weddings','graduations'] else []
 if slug=='graduations':relevant=relevant[:10]
 for p in relevant:
  image=ET.SubElement(node,ins+'image');ET.SubElement(image,ins+'loc').text=p['src']
ET.indent(tree);ET.ElementTree(tree).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+BASE+'sitemap.xml\n')
print(f'Updated {len(PAGES)} indexable landing pages; {len(photos)} unique published photographs have alt text and image sitemap entries. Legacy archives/sample post remain reachable with noindex.')
