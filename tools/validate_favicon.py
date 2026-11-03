from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse
from PIL import Image
import json,re
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.icons=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='link' and a.get('rel') in ['icon','apple-touch-icon','manifest']:self.icons.append(a)
expected={'/favicon.ico','/favicon-48x48.png','/favicon-192x192.png','/apple-touch-icon.png','/assets/icons/site.webmanifest'}
count=0
for page in Path('.').rglob('*.html'):
 if any(p in page.parts for p in ['wp-content','wp-includes','work','.git']):continue
 text=page.read_text(encoding='utf8');normalized=text.replace('\\/','/')
 assert 's0.wp.com/i/webclip.png' not in normalized and 'wp-includes/images/w-logo' not in normalized,page
 parser=Parser();parser.feed(text);assert {a['href'] for a in parser.icons}==expected and len(parser.icons)==5,page
 for icon in parser.icons:assert Path(icon['href'].lstrip('/')).exists(),icon
 canon=re.search(r'<link rel="canonical" href="([^"]+)"',text).group(1);assert canon.startswith('https://shuttertrend.co/'),page
 count+=1
for name,size in [('favicon-48x48.png',48),('favicon-192x192.png',192),('apple-touch-icon.png',180)]:
 with Image.open(name) as image:assert image.size==(size,size) and image.format=='PNG'
with Image.open('favicon.ico') as image:assert {(16,16),(32,32),(48,48)}<=image.ico.sizes()
manifest=json.loads(Path('assets/icons/site.webmanifest').read_text());assert manifest['scope']==manifest['start_url']=='/'
for item in manifest['icons']:assert item['src'].startswith('/') and Path(item['src'].lstrip('/')).exists()
print('PASS:',count,'pages share the same root-relative ICO/48/192/Apple/manifest links; canonical custom domain; no WordPress site-icon references; correct square dimensions and ICO frames.')
