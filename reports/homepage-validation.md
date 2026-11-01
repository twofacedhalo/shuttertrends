# Homepage and portfolio validation

Validated locally under /shuttertrends/ on 2026-11-01.

- Desktop 1440×900: hero/reel section top both 117px, clipped reel viewport, no manual scrollbar or horizontal page overflow, automatic vertical transform after a clean load.
- Tablet 820×1180 and mobile 390×844: compact touch-browsable presentation and no horizontal page overflow; hero headline visible immediately.
- Story portfolio: 21 stories, 12 initially rendered, Show more reveals all 21, six single-frame features, category filtering, and a 34-frame expandable collection.
- Fullscreen viewer: uncropped object-fit:contain, filter:none, optimized original-color asset; next and End navigation, Escape close, and focus restoration verified.
- Scroll reveals: lead/supporting/title/control stagger verified at 0/110/220/330/440/650ms; moving film frames have no individual reveal classes. Revealed content retains its visible state.
- Deterministic controller test: automatic travel, both directions and bounds across repeated cycles, one RAF at a time, pause/resume, hidden-document pause, reduced-motion pause, initialization guard.
- Data validation: 96 published photos with optimized GitHub Pages paths; portrait-category reel exclusion; removed Raising a Glass and Purple Stage photos excluded; At the Microphone retained; seven curated story definitions resolve published IDs.
- Import validation: all 106 original file hashes unchanged; 326 optimized output paths/dimensions verified, no GPS EXIF.

No live contact form submission was made. Touch layout and touch handler paths were reviewed; this was browser viewport testing rather than a physical-device test. The preexisting missing IMG_6018.JPEG original is documented in missing-originals.json; existing derivatives remain available.

Additional browser checks: downward motion after reaching the far end, unchanged paused position, isolated hover color/grain restoration, all six theme choices retaining one eight-frame track, and legacy collection thumbnail opening the 34-frame fullscreen viewer. No console errors were recorded.
