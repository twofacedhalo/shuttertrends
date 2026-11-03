# Homepage expandable photography cards

The four existing category cards use `features.js` / `features.css` and the
`window.shutterTrendsHomeFeatures` object at the end of `assets/photography/photos.js`.

For each category, list up to four published photo IDs in display order. The first
ID is the original featured image shown when closed. The script removes duplicate
IDs/sources and can fill unused places from published matching category collections.
No source images, category URLs, or other gallery pages are removed.

- Closed: original one-photo card sizing, text, borders and alignment.
- Open desktop: four uncropped previews in one horizontal row.
- Open tablet/mobile: native horizontal scrolling with scroll snapping and arrow-key
  scrolling when the gallery is focused. Swipe gestures do not toggle the card.
- Native disclosure buttons provide Enter/Space, `aria-expanded` and `aria-controls`.
  Clicking the photo/copy area also toggles the same disclosure; it never navigates.
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
