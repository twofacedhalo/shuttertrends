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
layer against the right viewport edge at 42vw. It remains visible throughout scrolling.
It retains the same ordered photographs and three loop copies; no second reel or image
set is created. Tablet (768-1000px) and desktop layouts stay as before.
The track travels upward at 10px/second. A single visible frame gets a 1.3-second warm
light leak after a random 8-15 second delay. Hidden tabs and reduced
motion stop the animation and clear the color timer. The desktop lightbox stays active;
the mobile background cannot receive focus, taps or open a lightbox.

Layout/opacity and leak keyframes are in `vertical-reel.css`; timing and motion are in
`../photography/filmstrip.js`. Run `node tools/validate_mobile_reel.cjs` for mobile checks.
