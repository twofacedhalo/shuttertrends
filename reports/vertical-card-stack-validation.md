# Full-width vertical photography card stack

Validated under /shuttertrends/ on 2026-11-01.

- Base feature-card grid and homepage overrides use grid-template-columns:minmax(0,1fr). Each card also uses a single column, with its photograph above the title, unchanged description, and Explore link. No desktop side-by-side rule remains.
- Order: Lynchburg & Local Events, Personal Moments, Weddings, Graduations. Gaps measured exactly 24px between cards. Equal widths verified at all tested sizes.
- Browser widths tested: 1920, 1440, 1024, 820, and 390px. Card-grid computed columns were respectively 714, 649, 449, 739, and 331px: one track at each size. Each card's photo bottom is at or above its copy top. No horizontal page overflow.
- All four existing photos load once their lazy-loaded cards enter view, including the actual wedding couple and graduate raising a cap. object-fit:contain preserves full photographs without distortion. Image height remains bounded at 260–320px; responsive source hints now reflect the full-width preview.
- Explore links target events/, portraits/, weddings/, and graduations/. Existing category pages and photo viewer were retained.
- Desktop reel remains sticky in the right grid column; tablet/mobile retain the compact presentation. Autoplay's vertical transform is active. Reel controller, inverted pointer mapping, 150px/s limit, width/height, hover filters, and play/pause implementation were not changed.
- Existing reveal classes and registration remain; no section or animation logic was replaced.

Validation: browser layout/image/link inspection, node tools/validate_homepage.cjs, node --check assets/homepage/features.js, and git diff --check.

Follow-up: the wrapper and cards now explicitly use display:flex with flex-direction:column, and obsolete grid breakpoint rules were removed. Browser checks at 1920/1440/820/390px confirmed identical card X positions and widths with strictly increasing top positions in the requested order. Homepage stylesheet URLs now carry a version query so previously cached layouts are refreshed.
