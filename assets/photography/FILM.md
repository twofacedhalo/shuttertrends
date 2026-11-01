# Responsive cinematic film reel

The homepage has one photography region: a vertical reel in the right grid column above 1000px, and a compact horizontal strip immediately below the hero at 1000px and below. Both use the same filmstrip.js controller and unchanged shuffled shutterTrendsPhotos pool. Portrait-category exclusion and vertical event eligibility stay in collections.js. Published galleries and original assets are unchanged.

## Layout and film decoration

assets/homepage/vertical-reel.css owns the 1.35fr/1fr desktop columns, 1320px maximum container, 24px sticky top offset and calc(100dvh - 132px) reel height. The reel spans the five rows of left-column main content and releases before the separate footer. Parents retain visible overflow; the viewport alone scrolls internally. On smaller screens the grid becomes normal document flow and the reel changes to horizontal touch scrolling. Featured collection cards retain titles, descriptions and links; their preview images are hidden on the homepage to keep the reel primary.

Desktop film rails repeat along both vertical edges. Compact rails repeat above and below the horizontal frames. --st-film-rail controls border width, --st-film-pitch controls sprocket spacing, and .st-film-mark controls decorative lettering. The cycle length is rounded to the pitch so holes remain aligned at the loop seam. Each photograph retains its natural aspect ratio and has responsive optimized sources and lazy loading.

## Motion and interaction

One requestAnimationFrame loop updates scrollTop on desktop or scrollLeft in compact mode. Default travel is 16px/second. Desktop pointer position near the top moves photographs upward; near the bottom moves them downward. Compact mode preserves horizontal pointer control. Speed eases over 400ms, with 24% pointer speed during photo inspection (minimum 4px/second). Edit those settings in filmstrip.js.

The SVG-only 44px play/pause control stops both automatic and pointer-controlled travel. Motion also stops while hidden, departed, offscreen, touching, keyboard-focused, or under reduced motion. Keyboard users can Tab through original collection links, or focus the viewport and use Up/Down on desktop, Left/Right in compact mode, plus Home/End. The breakpoint handler switches the active axis without creating another loop. Duplicated visual frames are hidden from assistive technology and excluded from sequential keyboard focus.

## Vintage black-and-white to original color

film.css applies only homepage reel filters: --st-film-vintage-grayscale (1), -sepia (.08), -contrast (1.10), -brightness (.93), -blur (0px), --st-film-grain-opacity (.12), and --st-film-develop-duration (350ms). A static SVG grain texture covers only each image. Hover/focus reveals the original optimized photograph and fades grain to zero without changing dimensions. On touch, first tap reveals the original and announces that another tap opens its collection; second tap follows the existing link. Keyboard activation remains direct. Reduced motion removes filter transitions.

Visible photo subtitles and hover captions remain absent; accessible link names and alt text retain metadata. Atmospheric and gallery photographs do not receive these filters. The old separate atmospheric-photo renderer and its styles have been removed; gradients, botanical leaves, falling leaves, particles and spotlight remain.

## Files changed for the vertical reel redesign

- index.html
- assets/homepage/vertical-reel.css (new)
- assets/homepage/refinement.css
- assets/photography/filmstrip.js
- assets/photography/FILM.md
- assets/site-config.js
- assets/effects/dusk-background.css
- assets/effects/README.md
- assets/themes/README.md
- assets/effects/photo-background.js (removed)
- assets/effects/photo-background.css (removed)
- assets/effects/hero-soft-focus.css (removed)
