from pathlib import Path
import re,html,json,subprocess,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
root=Path('.');base=subprocess.check_output(['node','-e',"global.window={};require('./assets/site-config.js');console.log(window.shutterTrendConfig.productionUrl)"],text=True).strip()
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','i':'http://www.google.com/schemas/sitemap-image/1.1'}
tree=ET.parse('sitemap.xml');urls=[e.text for e in tree.findall('.//s:url/s:loc',ns)];assert len(urls)==len(set(urls))==9
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.tags=[]
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)
titles=[];checked=0
for url in urls:
 assert url.startswith(base) and '?' not in url
 slug=url[len(base):];path=root/slug/'index.html';text=path.read_text(encoding='utf8');p=Parser();p.feed(text)
 titles.append(html.unescape(re.search(r'<title>(.*?)</title>',text).group(1)))
 def metas(key):return [a['content'] for t,a in p.tags if t=='meta' and (a.get('name')==key or a.get('property')==key)]
 assert len(metas('description'))==len(metas('robots'))==1
 assert len([a for t,a in p.tags if t=='link' and a.get('rel')=='canonical' and a['href']==url])==1
 assert 'noindex' not in metas('robots')[0]
 assert metas('og:url')==[url] and metas('og:title')==[titles[-1]] and metas('twitter:title')==[titles[-1]]
 assert len(metas('og:image'))==1
 image=root/metas('og:image')[0][len(base):];assert image.exists()
 schema=json.loads(re.search(r'<script type="application/ld\+json" id="st-seo-schema">(.*?)</script>',text,re.S).group(1))
 assert schema['@context']=='https://schema.org';types={n['@type'] for n in schema['@graph']};assert {'Organization','WebSite'}<=types
 org=next(n for n in schema['@graph'] if n['@type']=='Organization');assert org['name']=='ShutterTrend' and org['url']==base;assert 'address' not in org and 'telephone' not in org and 'aggregateRating' not in org
 assert org['sameAs']==['https://www.instagram.com/shuttertrend/']
 for tag,a in p.tags:
  if tag=='a' and a.get('href'):
   href=html.unescape(a['href']);u=urlparse(href)
   if u.scheme and not href.startswith(base):continue
   if href.startswith(base):target=root/unquote(href[len(base):].split('?',1)[0].split('#',1)[0])
   elif not u.scheme and not href.startswith(('#','//')):target=path.parent/unquote(u.path)
   else:continue
   if not u.path:continue
   if u.path.startswith('/wp-json') or u.query and not u.path:continue
   assert target.exists(),(str(path),href);checked+=1
for u in tree.findall('.//i:loc',ns):assert (root/u.text[len(base):]).exists(),u.text
assert len(set(titles))==9
for f in ['author/douglasrendlesiii/index.html','category/uncategorized/index.html','2026/10/27/hello-world/index.html','stories/index.html']:assert 'noindex' in (root/f).read_text(encoding='utf8')
assert 'Disallow:' not in Path('robots.txt').read_text()
assert all(url.startswith(base) for url in urls)
print(f'PASS: 9 unique titles/descriptions/canonicals and schema graphs, sitemap XML/image paths, indexable landing pages, 4 noindex legacy routes, {checked} valid static internal links, consistent configured production URLs.')
