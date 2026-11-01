# Film reel control in the column gap

Validated locally under /shuttertrends/ on 2026-11-01.

The existing button and event handlers are retained. CSS positions the 44×44px circular control at the sticky reel's vertical center and negative half of the shared column-gap variable. Its dark background, muted gold border/icon, hover highlight, and 2px keyboard focus outline remain distinct from the gradient. At narrow desktop widths the gap is at least 54px so neither the target nor focus ring overlaps adjacent content.

The reel now uses 100dvh minus the actual header height measured by the existing observer. Both the former 8px bottom clearance and 44px control ribbon are removed. The film viewport fills the component to the bottom edge. The existing cursor hint shares the column gap below the button, with no space reserved under the film.

| Viewport | Reel top | Film bottom | Button center X/Y | Gap center X / reel center Y |
| --- | --- | --- | --- | --- |
| 1920×1080 | 85px | 1080px | 1118.61 / 582.50px | 1118.61 / 582.50px |
| 1440×900 | 85px | 900px | 705.81 / 492.50px | 705.81 / 492.50px |
| 1366×768 | 85px | 768px | 668.02 / 426.50px | 668.02 / 426.50px |

- All three desktop sizes: exact gap and reel-center alignment, 44×44px target, zero bottom padding, and no horizontal page overflow.
- Extra 1024px desktop check: button fully inside a 54px gap, with no page overflow.
- Tablet 768×1024 and mobile 390×844: control is 8px inside the reel's lower-right edge, with no floating empty-area control or reserved bottom ribbon. Existing compact manual touch browsing and its inactive autoplay control are preserved.
- Scrolling through the collection cards keeps the button at the reel center. The existing boundary wrapper releases the reel and button before Contact and the footer.
- Actual click pauses movement. Moving the cursor over the paused reel leaves its transform exactly unchanged. Keyboard Enter resumes from the held position (about 86px), without resetting to zero. Focus-visible uses a 2px outline.
- Existing deterministic tests pass: inverted top/down and bottom/up speeds approximately 149.4px/s, gentle center, exit autoplay approximately 22px/s, pause, boundaries, reduced motion, hidden tabs, touch-only behavior, and single RAF loop.
- Film controller JavaScript, photos, logo, navigation, typography, left alignment, category cards, reveals, and botanical effects are unchanged. No JavaScript console errors were recorded.

Files: assets/homepage/vertical-reel.css, index.html (stylesheet version), assets/photography/FILM.md, and this report.
