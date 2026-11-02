# ShutterTrend browser icons

The icon artwork is copied from `assets/header/logo-mark.svg`. Its original
aperture paths, viewfinder corners and colors are unchanged; a charcoal backing
keeps it visible in light or dark browser chrome. The header logo file is untouched.

- `favicon.svg`: scalable browser icon.
- `favicon-32.png`: 32×32 fallback.
- `apple-touch-icon.png`: 180×180 Apple icon.
- `icon-192.png` / `icon-512.png`: web manifest icons.
- `/favicon.ico`: 16/32/48px legacy fallback at the deployment root.
- `site.webmanifest`: paths relative to this folder; start URL/scope resolve to
  either the GitHub project root or a root-domain static/Workers deployment.

Every public HTML file uses depth-relative icon URLs. No root-absolute
`/assets/...` paths or WordPress icon URLs are required. Cloudflare Workers must
serve these static files and preserve their content types; a Worker that proxies
another origin or filters requests needs its own deployment/cache configuration.

Run `py tools/validate_favicon.py` to validate paths and image dimensions.
