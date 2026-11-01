# Cinematic homepage polish and logo alignment

Validated locally under /shuttertrends/ on 2026-11-01.

## Viewport-height reel

The homepage navigation is sticky. A ResizeObserver measures its actual border-box height into --st-reel-header-height. The reel is sticky at that offset and its height uses 100dvh minus the measured header and an 8px bottom clearance (100vh fallback retained). A populated 44px bottom ribbon holds the quiet cursor hint and existing pause control without covering photographs.

| Viewport | Header | Reel top | Reel height | Bottom clearance |
| --- | --- | --- | --- | --- |
| 1920×1080 | 85px | 85px | 987px | 8px |
| 1440×900 | 85px | 85px | 807px | 8px |
| 1366×768 | 85px | 85px | 675px | 8px |
| 768×1024 | 77px | Compact layout | Automatic height | Not forced |
| 390×844 | 77px | Compact layout | Automatic height | Not forced |

The new boundary wrapper limits sticky travel to the hero, introduction, and collection cards. Browser scroll checks confirm the reel ends at the collection-region boundary, before Instagram, Contact, and the footer. Its expanded width, natural photo proportions, and scrollbar-free clipped viewport remain.

## Logo alignment

Navigation and content share --st-home-nav-max:1280px and a responsive gutter calculation. The complete logo/emblem outer box is the reference, rather than its wordmark or the decorative brackets. All hero copy/buttons, intro copy, and four cards use the same parent edge.

| Desktop width | Logo left | Content left | Reel left before → after | Column gap |
| --- | --- | --- | --- | --- |
| 1920px | 312.50px | 312.50px | 1146.59 → 1146.61px | 56px |
| 1440px | 72.50px | 72.50px | 733.80 → 733.81px | 56px |
| 1366px | 54.64px | 54.63px | 695.31 → 695.33px | 54.63px |

Differences of at most 1/64px are layout rounding. At 1920px the content expands approximately 64px toward the left. At other widths the same navigation container determines alignment. The reel is visually stationary. Tablet/mobile keep their comfortable existing gutters.

## Spacing, film, and interactions

- Tightened hero-to-intro spacing without resizing the headline or buttons. The introduction uses 24px/32px vertical padding, a 12px heading/paragraph gap, balanced serif heading, and 46ch paragraph maximum.
- Added very subtle warm film-rail illumination/depth; existing small numbers and stock markings use muted #C6A16A. No new grain, blur, light leaks, particles, or seasonal themes.
- Card hover and keyboard focus emphasize only matching reel frames using real collection IDs/category metadata. Verified Events and Weddings matches, no-match graduation behavior, clearing on exit/focus loss, and uninterrupted autoplay. No jump or scrolling is requested by this feature.
- Fine-pointer desktop hint fades after the first reel interaction. Browser verified opacity reaching zero; compact and reduced-motion rules hide cursor guidance. The hint has no pointer interception and stays outside photographs and pause control.
- New delegated listeners are aborted on pagehide; header observation disconnects and reconnects on pageshow. Navigation-away/back check confirmed measurement, highlighting, and one reel group restore correctly.
- The filmstrip motion controller was not changed. Existing deterministic tests still measure top/down and bottom/up at 149.4px/s, center crawl, and return to approximately 22px/s autoplay; pause, boundaries, hidden tabs, reduced motion, touch-only handling, and one RAF loop pass.

## Responsive and accessibility results

All five requested sizes have no horizontal page overflow, no headline overflow, and zero measured viewfinder/text intersections. Four category cards retain a single vertical column, their wording, existing photographs, and links. All four photos load once in view, with no broken images. No JavaScript console errors were recorded. No live contact form submission was made.

Files: index.html, assets/homepage/vertical-reel.css, assets/homepage/polish.js, assets/photography/FILM.md, and this report. Original and optimized image files remain unchanged.

Checks: actual browser layout/scroll/focus/hover/navigation inspection; node tools/validate_homepage.cjs; node --check assets/homepage/polish.js; git diff --check.
