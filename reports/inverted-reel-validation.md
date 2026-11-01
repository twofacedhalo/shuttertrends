# Inverted cursor movement and 150px/s limit

The previous cursor mapping was top → visible photographs upward, bottom → downward, with a 72px/s maximum. The new mapping is top → visible photographs downward, bottom → upward, with a 150px/s maximum. All coordinates refer to the visible photograph movement, accounting for the track's negative-Y transform.

The center 35–65% uses a gentle curve (approximately 0.6px/s at exact center, up to 3px/s at the zone edges). Outside that zone a power-1.7 curve accelerates toward 150px/s. Existing 0.6-second exponential velocity interpolation and boundary easing remain. Autoplay stays at 22px/s, with its direction retained on cursor exit where boundaries permit. No position reset or extra RAF loop was added.

Validation on 2026-11-01:

- Deterministic elapsed-time tests: top/down 149.4px/s, bottom/up 149.4px/s, center 0.5px/s after settling, exit autoplay 22.5px/s while settling toward 22.
- Tests pass for pause blocking both modes, boundary reflection without out-of-range frames, touch-only cursor tracking disabled, reduced motion, hidden-document pause, responsive transitions, short reels, and one RAF loop.
- Desktop browser confirms top pointer moves the visible track downward and bottom pointer moves it upward. Center steering remains gentle. No console errors.
- Existing reel dimensions, decoration, filters, photo links, sticky layout, keyboard access, and compact touch browsing are unchanged by this adjustment. No wheel interception or horizontal animation was added.
- Additional remote editorial text and photograph/story title commits were reviewed and merged, preserving their changes alongside the permanent appearance and category layout.

Settings: filmReel.cursorMaxSpeed in assets/site-config.js; mapping and nonlinear curve in assets/photography/filmstrip.js. Autoplay speed remains filmReel.autoplaySpeed:22.
