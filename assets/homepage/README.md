# Homepage expandable photography cards

The four existing category cards use `features.js` / `features.css` and the
`window.shutterTrendsHomeFeatures` object at the end of `assets/photography/photos.js`.

For each category, list up to four published photo IDs in display order. The first
ID is the original featured image shown when closed. The script removes duplicate
IDs/sources and can fill unused places from published matching category collections.
No source images, category URLs, or other gallery pages are removed.

- Closed: original one-photo card sizing, text, borders and alignment.
- Open desktop: four equal frames with uncropped photographs (object-fit: contain) in one horizontal row.
- Expanded frames share a ratio based on the median photo proportions, bounded between
  1:1 and 3:2 to reduce empty space. Every full photograph remains visible.
- Open tablet/mobile: each photo occupies 88% of the available width, with native horizontal scrolling with scroll snapping and arrow-key
  scrolling when the gallery is focused. Swipe gestures do not toggle the card.
- Native disclosure buttons provide Enter/Space, `aria-expanded` and `aria-controls`.
  The featured photograph is the disclosure button; captions and additional photos do not toggle it.
- Only one open card. IntersectionObserver closes a card once it is fully beyond
  a 120px viewport buffer. Offscreen collapse compensates for page-height changes
  above the viewport rather than moving the visitor's reading position.
- Additional image nodes/requests are created on first expansion. They use the
  existing optimized responsive variants, descriptive alt text and lazy loading.
- Height changes use a short Web Animations transition; reduced motion skips it.
  Existing featured image nodes are reused through open/close cycles.

The homepage filmstrip and its gallery/lightbox implementation are separate and
are unchanged. Category pages remain reachable through the header/footer navigation.

Run `node tools/validate_homepage.cjs` for the shared browser regression checks.

## Mobile background film reel

At widths up to 767px the original reel moves into a fixed, inert, decorative homepage background
layer against the right viewport edge at 48vw. It remains visible throughout scrolling.
It retains the same ordered photographs and three loop copies; no second reel or image
set is created. Tablet (768-1000px) and desktop layouts stay as before.
The track travels upward at 10px/second. A single visible frame gets a 1.3-second warm
light leak after a random 8-15 second delay. Hidden tabs and reduced
motion stop the animation and clear the color timer. The desktop lightbox stays active;
the mobile background cannot receive focus, taps or open a lightbox.

Layout/opacity and leak keyframes are in `vertical-reel.css`; timing and motion are in
`../photography/filmstrip.js`. Run `node tools/validate_mobile_reel.cjs` for mobile checks.

## Randomized bold-script hero H1

`tagline.js` keeps all headline options in the `words` array near the top. Each load
selects one word and keeps it; sessionStorage avoids an immediate repeat when available.
The original headline and separate tagline have been replaced by one semantic H1.
Its accessible label is the complete selected phrase, rather than animated letters.
No DR monogram exists in this checkout; existing header artwork is untouched.

`tagline.css` uses the existing serif for ivory “Life,” and genuine Lobster Two Bold
Italic (700) for the solid gold word. This is a locally hosted 45KB Latin WOFF2 face;
its SIL Open Font License and copyright are in `../typography/fonts/Lobster-Two-OFL.txt`.
Source: https://github.com/google/fonts/tree/main/ofl/lobstertwo
No Google Fonts requests are made by the running site.

The bold glyphs use a one-time, left-to-right angled mask reveal over 2.5 seconds.
This is a directional reveal, not a simulated outline stroke or typewriter effect.
The real font loads before the reveal; a failed font request falls back to readable
cursive. Shared row heights reserve space for every word and keep the description
and booking button still. Mobile uses separate lines for “Life,” and the gold word.
Reduced motion shows the complete phrase immediately. Hidden tabs/page-cache restores
complete the same word and never restart it. Without JavaScript the H1 is visibly
“Life, Unscripted.”. SEO title, metadata, structured data, and canonical URL are stable.

Edit the `words` array to add, remove, or reorder options. The font supports Latin text;
check that new longer words fit the reserved row. Run `node tools/validate_handwriting.cjs`
and `node tools/validate_homepage.cjs` for regression checks. Set `ST_BROWSER=webkit`
with a configured Playwright WebKit installation to check that engine as well.
