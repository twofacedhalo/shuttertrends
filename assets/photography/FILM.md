# Responsive cinematic film reel

The homepage uses one shuffled photography pool: a sticky vertical reel above 1000px and a compact touch-browsable strip below that breakpoint. Portrait-category exclusion remains in collections.js. Original photographs are never altered.

## Layout and decoration

assets/homepage/vertical-reel.css controls the full-width desktop grid, two columns, 24px sticky offset, and viewport height. --st-reel-edge sets the outer margin (clamp(24px,2vw,40px)); --st-reel-desktop-width sets the reel width (min(46vw,720px)). The former 1320px grid cap is removed. Left-column sections stay at most 714px wide and retain their typography; the inter-column gap remains 28–56px. The reel begins at the hero section top, spans six content rows including Stories in Frames, and releases before the footer. Its ancestors retain visible overflow; only the internal viewport is clipped. There is no visible reel heading or desktop scrollbar.

--st-film-rail controls border thickness, --st-film-pitch controls sprocket spacing, and .st-film-mark controls lettering. Images retain their original proportions. Compact layouts use horizontal touch browsing without automatic horizontal animation or page overflow.

## Motion and accessibility

filmstrip.js uses one requestAnimationFrame loop and translate3d(0,Y,0) on desktop. The track moves upward automatically, eases near each end, reverses, and repeats downward/upward. No wheel handler traps page scrolling. Configure filmReel.autoplaySpeed (18px/second) and edgeEaseDistance (100px) in assets/site-config.js. The controller eases velocity over 0.6 seconds and reduces speed to 65% during mouse inspection.

The icon-only 44px play/pause button preserves position and direction. Motion pauses offscreen, while the document is hidden, during keyboard browsing, and while a story viewer is open. Reduced motion disables automatic travel. Compact view remains manually accessible with touch and Left/Right arrows; desktop supports Up/Down and Home/End. Initialization is guarded against duplicate loops.

## Vintage appearance and story links

film.css settings: --st-film-vintage-grayscale:1, --st-film-vintage-sepia:.08, --st-film-vintage-contrast:1.10, --st-film-vintage-brightness:.93, --st-film-vintage-blur:0px, --st-film-grain-opacity:.12, --st-film-develop-duration:350ms. Hover/focus reveals original color and removes grain without resizing. First touch tap reveals color; second opens the related photo story. Visible subtitles remain absent. Story viewer and gallery images have no vintage filter.

## Stories and scroll reveals

stories-data.js defines curated stories by published photo IDs. site-config.js selects the homepage features. stories.js provides collection stories, category filtering, incremental browsing, larger-set expanders, and a native fullscreen dialog with arrow/Home/End keys, Escape, focus restoration, and touch swipe. stories.css controls their layout.

assets/effects/reveals.css exposes text/photo durations (650/750ms), rises (24/18px), and easing. reveals.js uses one-shot IntersectionObserver registrations, 110ms story staggers capped at 650ms, and a 60px early-entry margin. Hero text is immediately visible. Only the reel container enters once; moving frames never receive individual reveals. Content remains visible without JavaScript or under reduced motion. Keyboard focus immediately reveals its target.

## Validation

Run `node tools/validate_homepage.cjs` from the repository root for deterministic reel timing, pause, visibility, reduced-motion, initialization, manifest paths, portrait exclusion, and story-reference checks. Browser layout and viewer checks are recorded in reports/homepage-validation.md.
