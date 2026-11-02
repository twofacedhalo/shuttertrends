from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse
from PIL import Image
import json
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.icons=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='link' and a.get('rel') in ['icon','apple-touch-icon','manifest']:self.icons.append(a)
count=0
for page in Path('.').rglob('*.html'):
 if any(p in page.parts for p in ['wp-content','wp-includes','work','.git']):continue
 text=page.read_text(encoding='utf8');assert 's0.wp.com/i/webclip.png' not in text,page
 p=Parser();p.feed(text);assert len(p.icons)==4,(page,p.icons)
 for base in ['https://example.test/','https://example.test/shuttertrends/']:
  current=urljoin(base,page.as_posix())
  for icon in p.icons:
   resolved=urljoin(current,icon['href']);assert resolved.startswith(base+'assets/icons/'),(page,resolved)
   local=Path(resolved[len(base):]);assert local.exists(),local
   if icon['rel']=='manifest':
    manifest=json.loads(local.read_text());assert urljoin(resolved,manifest['scope'])==base
    for item in manifest['icons']:assert Path(urljoin(resolved,item['src'])[len(base):]).exists()
 count+=1
for name,size in [('favicon-32.png',32),('apple-touch-icon.png',180),('icon-192.png',192),('icon-512.png',512)]:
 with Image.open('assets/icons/'+name) as image:assert image.size==(size,size)
print('PASS:',count,'HTML pages; no WordPress icon links; SVG/PNG/Apple/manifest paths valid at domain root and /shuttertrends/; correct image sizes.')
