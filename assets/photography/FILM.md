# Responsive cinematic film reel

The homepage uses one shuffled photography pool: a sticky vertical reel above 1000px and a compact touch-browsable strip below that breakpoint. Portrait-category exclusion remains in collections.js. Original photographs are never altered.

## Layout and decoration

assets/homepage/vertical-reel.css controls the editorial grid. The homepage header is sticky; polish.js measures its actual height with ResizeObserver into --st-reel-header-height (85px desktop fallback). The reel starts immediately below it and uses calc(100dvh - var(--st-reel-header-height)), without bottom control padding or clearance. The same 44px play/pause button is positioned at the sticky reel midpoint and negative half of --st-home-column-gap, centering it between the columns. The gap has a 54px minimum to accommodate its target and focus ring. Compact layouts place the control 8px inside the lower-right reel edge. --st-reel-edge and --st-reel-desktop-width preserve the expanded right-side position. --st-home-nav-max (1280px) is shared by the navigation and --st-home-align-gutter, so the whole left column aligns to the outer logo edge while the reel and inter-column gap stay in place. A separate st-home-reel-boundary spans hero, introduction, and collection rows; sticky travel ends before Instagram, Contact, and the footer. Ancestors retain visible overflow; only the internal viewport is clipped. No visible reel heading or native desktop scrollbar is used.

--st-film-rail controls border thickness, --st-film-pitch controls sprocket spacing, and .st-film-mark controls lettering. Images retain their original proportions. Compact layouts use horizontal touch browsing without automatic horizontal animation or page overflow.

## Motion and accessibility

filmstrip.js uses one requestAnimationFrame loop and translate3d(0,Y,0) on desktop. The track moves upward automatically, eases near each end, reverses, and repeats downward/upward. No wheel handler traps page scrolling. Configure filmReel in assets/site-config.js: autoplaySpeed (22px/second), cursorMaxSpeed (150px/second), cursorCrawlSpeed (3px/second), velocityEaseSeconds (0.6), and edgeEaseDistance (100px). A fine mouse pointer moves the visible photographs downward in the upper half and upward in the lower half. The center 35–65% stays gentle; a nonlinear power curve accelerates toward 150px/second at the edges. Exact center crawls at approximately 0.6px/second. Pointer exit restores the automatic direction smoothly without resetting position. Held cursor travel reflects at boundaries. Touch-only devices do not track the pointer.

The icon-only 44px play/pause button preserves position and direction. Motion pauses offscreen, while the document is hidden, during keyboard browsing, and while a story viewer is open. Reduced motion disables automatic travel. Compact view remains manually accessible with touch and Left/Right arrows; desktop supports Up/Down and Home/End. Initialization is guarded against duplicate loops.

## Vintage appearance and story links

film.css settings: --st-film-vintage-grayscale:1, --st-film-vintage-sepia:.08, --st-film-vintage-contrast:1.10, --st-film-vintage-brightness:.93, --st-film-vintage-blur:0px, --st-film-grain-opacity:.12, --st-film-develop-duration:350ms. Hover/focus reveals original color and removes grain without resizing. First touch tap reveals color; second opens the related photo story. Visible subtitles remain absent. Story viewer and gallery images have no vintage filter.

## Stories and scroll reveals

stories-data.js defines curated stories by published photo IDs. The homepage contains no story cards; /stories/ is the dedicated Photo Stories destination in the shared navigation. stories.js provides collection stories, category filtering, incremental browsing, larger-set expanders, and a native fullscreen dialog with arrow/Home/End keys, Escape, focus restoration, and touch swipe. stories.css controls their layout.

assets/effects/reveals.css exposes text/photo durations (650/750ms), rises (24/18px), and easing. reveals.js uses one-shot IntersectionObserver registrations, 110ms story staggers capped at 650ms, and a 60px early-entry margin. Hero text is immediately visible. Only the reel container enters once; moving frames never receive individual reveals. Content remains visible without JavaScript or under reduced motion. Keyboard focus immediately reveals its target.

## Validation

Run `node tools/validate_homepage.cjs` from the repository root for deterministic reel timing, pause, visibility, reduced-motion, initialization, manifest paths, portrait exclusion, and story-reference checks. Browser layout and viewer checks are recorded in reports/homepage-validation.md.

## Viewfinder and homepage previews

The hero uses 24px corners inset 12px, inside the reserved 48px/44px top/bottom gutters (56px/64px on compact layouts). Featured-card corners belong only to the photo area, never the text copy. Four vertically stacked category cards (Events, Personal Moments, Weddings, Graduations) reuse published photo IDs from shutterTrendsHomeFeatures in photos.js. At every breakpoint each card uses one column with a contained photograph above its text. All four cards occupy the full left content-column width with 24px vertical gaps.

## Permanent appearance and categories

Theme switching, presets, and localStorage persistence are removed. permanent-style.css supplies the fixed #C6A16A accents; dusk-background.css retains the original continuous navy/plum/charcoal gradient. Botanical leaves, falling leaves, dust, spotlight, and scroll reveals remain independently controlled. Graduation collections use category graduations while retaining the portraits categoryGroup for reel exclusion. Existing collection IDs, source folders, and optimized assets are unchanged.

Featured previews now use a responsive 3:2 box with object-fit:contain. Personal Moments retains IMG_3105 (couple with dog); Weddings uses IMG_6390 (wedding couple); Graduations uses IMG_1058 (graduate in cap and gown). These existing landscape images fill the card width without cropping or distortion.

## Cinematic homepage polish

polish.js connects card hover/keyboard focus to reel frames using existing collection IDs and category metadata. Matching frames receive a restrained gold outline; unrelated frames, position, and velocity remain unchanged. No match leaves the reel unchanged. Delegated listeners use AbortController, disconnect on pagehide, and reconnect on pageshow; the header observer follows the same lifecycle.

The fine-pointer desktop hint sits quietly below the control in the column gap, fades after the first reel pointer or keyboard interaction, and is hidden in compact layouts and reduced motion. Film rails use subtle warm inset illumination; frame numbers/stock markings stay muted gold. Intro spacing is 24px/32px, with a 12px heading/paragraph gap and a 46ch paragraph limit. Hero typography and buttons retain their sizes.
