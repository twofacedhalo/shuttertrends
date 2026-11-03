# ShutterTrend SEO, local discovery and custom-domain setup

## Current production URLs

The production base is now `https://shuttertrend.co/`, served through the existing
custom-domain hosting layer. The homepage, favicon and robots file were verified over
HTTPS in Chrome. `assets/site-config.js` is the canonical production URL source.
Canonical, social/schema URL references and sitemap entries now use the custom domain.
Page titles and descriptions were preserved during this URL-only update.

The initial WordPress DNS observations below are historical, not instructions to undo
the current Cloudflare deployment. No DNS, CNAME or Cloudflare security settings were
changed automatically. Keep the GitHub Pages origin available for the hosting layer.

## Implemented

- Unique titles/descriptions and one canonical URL for Home, Personal Moments,
  Graduations, Weddings, Events, About, Services, Contact and Collections.
- Open Graph and Twitter large-image cards. Four shared 1200×630 JPEG previews
  reuse real portfolio photos, preserve the full composition on a navy canvas,
  and total approximately 472 KB. No original photo was changed.
- Organization, WebSite, WebPage/CollectionPage and BreadcrumbList JSON-LD.
  Only the verified name, Lynchburg service area, actual services and public
  Instagram profile are used. No fabricated address, phone, ratings or hours.
  Organization is used instead of asserting a storefront/local-business profile.
  The obsolete WordPress SearchAction and generic WordPress logo schema were removed.
- `sitemap.xml`: nine canonical, indexable landing URLs and image references
  covering all 99 unique published photographs. No invented last-modified dates.
- `robots.txt`: permits crawling and declares the sitemap. No special AI crawler
  blocking or fabricated crawler-specific guarantees.
- Retired Photo Stories, the sample Hello World post, and legacy author/category
  archives remain reachable but are `noindex`; none appears in the sitemap.
- Generic `collections/?id=...` views consolidate to the Collections hub canonical;
  they are not separate canonical/indexable sitemap pages. The two retired
  Personal Moments collection routes still redirect to `/portraits/`.
- Graduation and Wedding photos exist directly in HTML before JavaScript runs.
  The Collections hub has a no-JavaScript photo/link fallback. Images are also
  discoverable through the image sitemap without interacting with decks/reels.
- All published photos already had descriptive alt text, positive dimensions and
  optimized responsive variants. These were retained rather than guessed or
  renamed. Offscreen gallery images remain lazy-loaded. Alt text is not proof of
  an event name or venue; no new names or locations were inferred.
- Homepage copy emphasizes candid expressions and unscripted connections, with
  factual service-area wording on Home, Services and Contact. No nearby areas
  or physical studio are claimed. This helps explain the business to both people
  and search systems; it does not guarantee AI mentions or search rankings.
- Hero retains its headline, with only the solid-gold Book a Session button.
  Events is a direct navigation link everywhere; Portraits retains its compact menu.
  Events click-to-reveal titles and its original strip code remain unchanged.

## Regenerate and validate after adding photographs

From the repository root, with Node.js and Python/Pillow installed:

```powershell
py tools/update_site_seo.py
py tools/validate_seo.py
node tools/validate_header_gradient.cjs
node tools/validate_camera_interaction.cjs
node tools/validate_homepage.cjs
```

`update_site_seo.py` reads the published manifest, rebuilds image previews,
static gallery markup, metadata and sitemap. It never rewrites source photos.
When adding a new page, add its truthful title/description to `PAGES` there.
Edit typography in `assets/typography/typography.css`; ensure new full pages
include that stylesheet last and preload the same local DM Sans font.

The browser test uses Playwright with Chrome. It resolves an installed Playwright
module, `PLAYWRIGHT_MODULE`, or the bundled Codex runtime if available. There is
no production browser/testing dependency. The old homepage VM fixture was stale
for the current 22-photo reel and is now a compatibility entry point to this test.

No Search Console, Rich Results Test or Schema.org validator account was accessed.
JSON-LD was parsed and checked for required graph consistency locally; that is not
certification of rich-result eligibility. Use [Schema.org Validator](https://validator.schema.org/)
and [Google Rich Results Test](https://search.google.com/test/rich-results) after deployment.
An Organization graph by itself does not guarantee a rich result.

## Google Search Console and Bing — owner steps

1. Verify the current URL-prefix property `https://shuttertrend.co/`
   in Search Console using a supported ownership method. Never put private tokens here.
2. Submit `https://shuttertrend.co/sitemap.xml` in Sitemaps.
3. Inspect the homepage, Personal Moments, Events, Graduations and Weddings with
   URL Inspection. Review the rendered HTML and selected canonical; request
   indexing where appropriate. Google decides when/whether to index.
4. Check Pages/Indexing, sitemap status and Core Web Vitals after crawl data exists.
   No public Lighthouse/PageSpeed score or Google indexing result is claimed here.
5. Optionally verify the site and submit its sitemap in Bing Webmaster Tools.
6. If eligible, maintain an accurate Google Business Profile for a service-area
   business. Do not invent a public studio address or opening hours.

Important GitHub project-site detail: robots.txt must be at an origin's root to
control that origin. A project file at `/shuttertrends/robots.txt` is not the root
robots policy for `twofacedhalo.github.io`. Submit the sitemap directly in Search
Console; if you manage a separate root user-site repository, its `/robots.txt`
can reference this project sitemap. After custom-domain migration this repo's
robots.txt naturally becomes `https://shuttertrend.co/robots.txt`.

Sources: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Google robots.txt requirements](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt).

## Historical direct-GitHub migration notes — do not apply to the current Worker setup

The domain is now in production. The following older direct-GitHub migration notes
are retained for reference only; do not change working Cloudflare DNS/Worker routing
without a separate migration plan. Moving DNS changes which website the domain serves. Keep the old site available
until the new host and HTTPS are ready. Preserve unrelated mail/MX/TXT records.

1. Verify domain ownership in your GitHub account's Pages settings using GitHub's
   supplied TXT record. Do not invent verification values.
2. In this repository's **Settings → Pages**, confirm deployment from `main` and
   the repository root, then set the Custom domain to `shuttertrend.co`.
3. At the registrar/DNS provider, replace the WordPress apex A records with
   GitHub Pages' documented A records: `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153`. Set `www` CNAME to
   `twofacedhalo.github.io` (no `/shuttertrends/` path). Check/remove only conflicting
   web-host A/AAAA records using GitHub's current documentation.
4. Wait for DNS validation and GitHub's certificate, enable **Enforce HTTPS**, and
   test the apex, www redirect and all nine page paths. Verify the served homepage
   is the new repository version, not the old WordPress site.
5. Once ready, add/retain the root `CNAME` containing `shuttertrend.co`, change
   `productionUrl` in `assets/site-config.js` to `https://shuttertrend.co/`, update old
   production-prefix links in exported HTML to the new root where appropriate,
   and regenerate SEO. Validate all assets, canonicals, share previews and sitemap
   on the root domain before publishing. Relative asset paths support both hosts.
6. Verify the new Domain property in Search Console with Google's supplied DNS
   TXT value. Submit `https://shuttertrend.co/sitemap.xml`. Keep the old property
   for migration monitoring; verify GitHub's old-address redirects and both hosts'
   canonical behavior. Do not change nameservers or erase mail records blindly.
7. Re-test form delivery, mobile galleries and social sharing on the new origin.
   Formspree domain restrictions, if enabled in the owner's dashboard, may need
   the new domain added. Never claim delivery on the new domain before testing it.

Use the current [GitHub Pages custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
No registrar/GitHub settings have been changed automatically in this update.

## Validation performed

- Static metadata/canonical/JSON-LD consistency, sitemap XML and image references.
- 294 valid static internal links; nine live canonical URLs returned 200.
- Browser checks for nine pages at desktop/tablet/mobile and 200%-equivalent width.
- Local font loading, heading clipping, one H1 per main page, and no horizontal overflow.
  A local font-loading run measured CLS 0.0028; this is not a public field metric.
- Actual 22-photo reel, play/pause, reduced motion, selected-photo modal, three
  Personal Moments decks, single-column galleries, no-JavaScript discovery,
  direct Events navigation and retained click-to-reveal event titles.
- Contact validation/failure/success and input retention tested with mocked
  responses; no further live email sent. The earlier owner-confirmed live delivery
  test remains recorded in `reports/contact-live-test.json`.

Search engine indexing, AI-engine inclusion, registrar migration and social
platform cache refreshes are external steps, not results asserted by these checks.
