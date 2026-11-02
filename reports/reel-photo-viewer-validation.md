# Single-photograph reel viewer

Homepage reel frames are real buttons with dialog semantics and no navigation URL. Each opens only its own fullSrc optimized original in a dedicated native modal dialog. The existing story viewer and category card links are unchanged.

The viewer uses a nearly black viewport, 12px margins, contain sizing, no filters, and one 44px close button. Native Escape, outside-image click, keyboard focus containment and focus return are supported. Root/body scrolling is locked while open, then restored along with page and compact reel scroll offsets. Position, direction, velocity, cursor steering and user pause state are preserved without creating another animation loop. Mouse activation avoids refocusing/repositioning the reel before opening. A closing-state guard prevents rapid reopening from racing dialog cleanup.

Validation:
- Existing homepage controller tests pass: autoplay, inverted cursor mapping, 150px/s maximum, reversal, pause, reduced motion, compact/touch behavior and one RAF.
- Added tests for every generated frame, exact full-color source, no href/navigation, modal freeze, exact position restoration, prior paused state, focus trap/return and outside close.
- All 96 published viewer source paths checked against local assets.
- Browser: all eight sampled reel frames open individual optimized images; URL unchanged; only close control; Escape and keyboard focus return work; no console errors.
- Browser viewport checks at desktop 1280x720, mobile portrait 390x844 and landscape 844x390: contain sizing, full-color/filter:none, original proportions and 12px edge margins. These are viewport simulations, not physical-device tests.
- Existing four category links retain their original gallery destinations; source homepage markup is unchanged.

Changed implementation files: assets/photography/filmstrip.js and assets/photography/film.css. No photograph files or collection data changed.
