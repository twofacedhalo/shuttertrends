# ShutterTrend — imports, navigation, contact and Instagram

All changes remain local until you review, commit and push them. The repository
name, GitHub Pages URL, logo, galleries, photographic backgrounds, spotlight,
viewfinder corners and cinematic carousel are preserved.

## Latest import and requested removals

The Desktop import folder was scanned recursively. SHA-256 comparison found:

- 7 new photographs; 26 previously imported photos skipped.
- 4 MOV sidecars skipped, retained untouched outside the public repository.
- 4 new descriptive collections: Outdoor Gathering, Concert — Color & Light,
  A Sparkler Celebration, and A Day on the Water.
- No actual event name, location or date was guessed. Those details need owner
  review; captions and alt text describe visible content only.

The original import sources remain at
`C:\Users\dougl\OneDrive\Desktop\ShutterTrends-Photo-Imports`.
The optimizer now searches its subfolders as well. Ambiguous filenames with
different contents stop optimization rather than silently choosing a source.

At the owner's subsequent request, `IMG_6362.JPEG` (boat scene) and `IMG_3883.jpg`
(panoramic purple-stage scene) are unpublished across all views. Their seven
unreferenced generated WebP files were removed from the public image directory.
Originals were not moved, changed or deleted. Their manifest entries remain for
editorial history, with `published: false`. The site has 32 published photographs.

Review `reports/latest-import-summary.md` and `reports/photo-optimization.md` for
classifications, dimensions, bytes and savings. All 37 source files, including
the video sidecars, have unchanged checksums.

## Photo eligibility

Edit `assets/photography/photos.js`:

```js
carouselEligible: true,   // homepage carousel only
backgroundEligible: true // separate decorative-background opt-in
```

All 32 remaining published photographs currently have `carouselEligible: true`,
including portraits, graduations, weddings, concerts and personal events. No
photo is excluded because it is vertical. The two owner-removed photos remain
unpublished and never appear. Backgrounds, menus, featured cards and Instagram
previews have independent selections.

The public setting `homepageCarousel.excludePortraits` is currently `false`.
Keep it false to include all categories. An optional future value of true can
exclude portrait-category/group entries, but that filter is not active now.
Legacy `showcase` values are only a fallback when `carouselEligible` is omitted.

The homepage still shuffles once per load and selects up to eight unique photos,
with graceful smaller selections, autoplay, pause/play, adjacent previews,
keyboard navigation, touch swipes and contained, uncropped central photographs.

Run `py tools/optimize_photos.py` after changing source photographs. It generates
sRGB WebP quality 85 variants at maximum long edges of 600/1600/2000/2400px for
thumbnail/gallery/homepage-carousel/large-view uses. It applies orientation,
never upscales, strips GPS and unnecessary metadata, and retains available
copyright/creator fields. Only eligible photos need a carousel derivative.
Existing unused outputs are not automatically deleted; the two requested public
photo removals were handled explicitly after checking references and paths.

## Particles

In `assets/effects/banner.js`, change:

```js
const count = mobile.matches ? 18 : 40;
```

This is approximately 43% denser on desktop and 50% denser on mobile than before.
Particles retain varied slow drift, small sizes and long fade cycles. A small
minority can be slightly brighter. CSS animates transform/opacity; there is no
continuous JavaScript rendering loop. Hidden/offscreen pauses, reduced motion,
and the cursor spotlight remain intact.

## Photographic navigation

Edit `navigation.portraits` and `navigation.events` in `assets/site-config.js`.
Each card has a display `title`, an existing `collectionId`, and optionally an
existing `photoId`. Invalid or unpublished collections/photos are skipped. A
missing photo choice falls back to the first published photo in the collection.

Desktop panels open on hover or keyboard focus. ArrowDown enters cards; Escape
closes the panel and restores focus to its chevron. Mobile uses separate
expandable sections inside the main menu. The root Portraits/Events links remain
ordinary navigation links. Reduced motion disables fades/slides, and existing
small optimized thumbnails are loaded only when a panel is first opened.

The shared header generator is still `node tools/update_header.cjs`. It keeps all
11 exported pages consistent and orders the configuration/data scripts before
the header script, including on About, Services, Contact and archive pages.

## Contact form — configured and live-tested

Public settings are in `assets/site-config.js`:

```js
contact: {
  email: 'douglasrendlesiii@gmail.com',
  formEndpoint: 'https://formspree.io/f/xbggyrpq'
}
```

One clearly labeled live browser submission was accepted with HTTP 200 and
`ok: true`. The owner confirmed the email arrived. Its reference is recorded in
`reports/contact-live-test.json`. No additional real test emails were sent for
the subsequent visual changes.

The legacy WordPress form, premature success panel and form-only scripts were
replaced with a local, aligned form. Required name/email/message fields are
validated, optional type/date fields are included, and a `_gotcha` honeypot is
sent to Formspree. Requests are locked while sending and after success. A success
message appears only after a successful JSON submission response. HTTP errors, network failures and timeouts show an error and retain input for retry.

The visible contact email does not configure provider notifications: the owner
must keep the notification recipient set to `douglasrendlesiii@gmail.com` inside
Formspree and keep it verified. To change providers/forms later:

1. Create or select the form in Formspree and verify the recipient email.
2. Copy its public `https://formspree.io/f/...` endpoint into the config field.
3. Enable the service's spam controls. If enabling a CAPTCHA flow, use its
   supported integration; do not disable protection just to bypass an error.
4. Make one identifiable test submission; confirm it in the dashboard and inbox
   (including spam). HTTP acceptance alone does not prove inbox delivery.

If the endpoint is blank/invalid, the form disables sending and provides a
direct email link. No fake endpoint or credentials are used.

Official references: [Formspree AJAX submission](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax)
and [honeypot filtering](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering).

## Instagram showcase

The owner-provided profile is `https://www.instagram.com/shuttertrend/`.
The Follow on Instagram button opens it in a new tab. The section is between
the two featured category cards and the final contact invitation.

Edit `instagram.profileUrl` and `instagram.items` in `assets/site-config.js`:

```js
instagram: {
  profileUrl: 'https://www.instagram.com/shuttertrend/',
  items: [
    { photoId: 'import-img-3355', postUrl: '' },
    { photoId: 'import-img-3013', postUrl: '' },
    { photoId: 'import-img-6412', postUrl: '' }
  ]
}
```

Choose 3–6 existing published photo IDs. There are currently five curated
previews after removing the requested purple-stage photograph. To make a tile
clickable, paste the actual HTTPS Instagram `/p/...` or `/reel/...` post URL.
With no post URL it is an ordinary photograph, not a fake/broken link. A missing
profile URL hides the follow button and shows a brief unavailable-link message.

These are curated website photographs, explicitly labeled as such—not a live
Instagram feed. They use existing optimized thumbnails with intentional square
preview crops; full gallery photographs remain uncropped. There are no Instagram
embeds, API requests, access tokens or private credentials. A future supported
live-feed adapter could populate the same configuration/renderer separately.

## Main files changed

- `assets/photography/photos.js`, `collections.js`, `optimized.js`, `galleries.js`:
  imports, publication decisions, independent eligibility and category routes.
- `tools/optimize_photos.py`: recursive private-source lookup and carousel-aware
  derivative generation. `assets/images/optimized/`: generated public WebPs.
- `assets/effects/banner.js`: particle density/opacity.
- `assets/site-config.js`: public form, Instagram and menu settings.
- `assets/header/header.js`, `header.css`, `tools/update_header.cjs`: photo menus
  and correctly ordered shared scripts on every exported page.
- `assets/contact/contact.js`, `contact.css`, `contact/index.html`: functional,
  validated, styled contact integration and obsolete form removal.
- `assets/social/instagram.js`, `instagram.css`, `index.html`: curated showcase.
- All 11 exported HTML pages: regenerated shared navigation/data wiring.
- `PHOTO-GUIDE.md`, component READMEs and reports: current maintenance guidance.

## Preview locally

```powershell
py -m http.server 8000 --directory C:\Projects
```

Open `http://localhost:8000/shuttertrends/` and `/shuttertrends/contact/`.
Review dropdowns, narrow mobile widths, Instagram configuration, collection
links and contact spacing. Use mocked responses for repeated automated form
tests; a real submission sends an actual email. Nothing has been committed or
pushed, so the public site retains its previous version until you publish.
