# ShutterTrend browser and Search icons

The artwork is the original aperture/camera symbol from `assets/header/logo-mark.svg`,
without the wordmark. The header logo is unchanged. Gold paths retain their original
colors and proportions on the existing dark backing.

All 13 public HTML files use the same root-relative icon set for `https://shuttertrend.co/`:

- `/favicon.ico`: conventional bitmap ICO frames at 16, 32 and 48 pixels.
- `/favicon-48x48.png`: 48×48 browser/favicon image.
- `/favicon-192x192.png`: 192×192 higher-resolution favicon/manifest image.
- `/apple-touch-icon.png`: 180×180 Apple touch icon.
- `/assets/icons/site.webmanifest`: root scope/start URL, using the 192px root icon
  and the existing 512px icon. No WordPress icon references remain in active metadata.

The existing SVG, 32px PNG and nested icon files remain available for compatibility;
no source logo/photo/vendor asset was deleted. Root-relative paths intentionally target
the custom-domain root. A raw GitHub project preview at `/shuttertrends/` cannot use
those paths unless its hosting layer maps the root assets; the custom domain is canonical.

Run `py tools/validate_favicon.py` for references, canonical host, dimensions and ICO
frame checks. Chrome and Playwright WebKit successfully decode all supplied formats;
native Safari is not available on the Windows development machine.

Googlebot and Googlebot-Image user-agent probes are useful access checks but do not
verify requests from Google's actual crawler IPs. Keep Cloudflare's verified-crawler
access working; no authentication or robots restrictions should cover the homepage or
these icons. No Cloudflare security settings were changed in this update.

Google chooses whether and when to show the favicon. Keep these URLs stable. After
publication, the owner can use Search Console URL Inspection on the homepage and
request recrawling; changes are not immediate or guaranteed. No special Google-only
favicon metadata is necessary.

Source: https://developers.google.com/search/docs/appearance/favicon-in-search
