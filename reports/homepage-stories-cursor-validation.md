# Homepage simplification, viewfinder clearance, and cursor steering

Validated locally on 2026-11-01 under /shuttertrends/.

## Homepage and stories

- Stories in Frames section, subtitle, cards, browse link, and its grid row are removed from the homepage. No story data or photographs were deleted.
- /stories/ is a dedicated portfolio page, accessible through the shared Photo Stories navigation link. Existing /collections/ and collection query URLs remain supported; curated deep links now use /stories/?story=….
- Dedicated page renders 21 stories, with single-photo features, 2–5-photo Mini Photo Stories, larger expandable collections, category filters, fullscreen viewing, and scroll reveals.
- Original category previews restored: import-img-3355 for Lynchburg & Local Events; import-img-3105 for Personal Moments. Both optimized photos load, retain natural proportions, and link to existing collections.
- Hero corners are 24px long with a 12px inset, inside the reserved top/bottom gutters. Featured-card corners are confined to photograph containers and cannot overlap the copy.
- Browser bounding-box checks found zero corner/text intersections and no horizontal page overflow at 1920px, 1440px, 1024px, and 390px. Both category previews are visible and loaded at all four widths.
- Mobile navigation reaches /stories/. Its fullscreen viewer fits the 390px screen, reaches photograph 5/5 with End, closes with Escape, and category filtering returns the expected four Portraits stories. No browser console errors were recorded.

## Reel behavior

- Default autoplay: 22px/second. Cursor maximum: 72px/second. Center crawl: 3px/second. Velocity interpolation: 0.6 seconds. Edge easing retained.
- Browser transform samples confirmed automatic movement and faster upward travel near the top, downward travel near the bottom, and a center crawl. All movement stays on the Y-axis.
- Deterministic elapsed-time tests cover cursor speed zones, direction changes, exit-to-autoplay, pause blocking both modes, held-cursor boundary reflection, touch-only cursor tracking disabled, repeated autoplay reversals, hidden/reduced-motion pause, responsive transitions, short reels, and one RAF loop.
- Expanded width, sticky positioning, black-and-white/color reveal, native-scrollbar hiding, fullscreen photo links, and independent page scrolling are preserved. Compact mobile browsing remains unchanged.

Validation commands: node tools/validate_homepage.cjs; node --check on modified JavaScript; git diff --check. No original image files were modified.
