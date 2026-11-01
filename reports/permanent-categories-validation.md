# Permanent appearance, four categories, and taller reel

Validated locally under /shuttertrends/ on 2026-11-01.

- Removed the six presets, selector, theme-switching JavaScript, theme stylesheet, persistence reads/writes, and obsolete theme documentation. No other localStorage data is touched. All public pages use permanent-style.css with #C6A16A accents.
- Preserved the existing continuous dusk/plum/navy/charcoal gradient from dusk-background.css, typography, botanical leaves, occasional falling leaves, particles, spotlight, and scroll reveals. Desktop renders seven botanical leaves and 40 dust motes; compact defaults remain three leaves and 18 motes.
- Four featured cards stack in order: Lynchburg & Local Events, Personal Moments, Weddings, Graduations. Existing optimized images are reused; no physical image files were created, modified, copied, or removed.
- Visually inspected the four selected photographs: live band (IMG_3355), studio portrait (IMG_2225), wedding couple (IMG_5414), graduate with cap (IMG_2943).
- Graduation Day and Graduation Portraits & Companions now use the graduations category (35 photos total), retaining their collection IDs, source folders, and portrait group. Personal Moments at portraits/ lists Candid Portraits and Warm Studio Portraits (32 photos). Weddings remain separate (eight photos). Graduation imagery stays excluded from the homepage reel.
- Added graduations/ using the existing gallery/story components. Browser verified its single-photo feature plus larger 34-photo collection; existing full-color viewer, links, and story behavior are reused.
- At 1440×900 the reel and hero both begin at y=101px. The component is 799px tall, including a 48px pause-control gutter; the photograph viewport is 751px tall. Width and right-edge settings remain unchanged. Height formula: 100dvh - 85px header - 16px clearance.
- Browser checked 1920px, 1440px, 1024px, and 390px: no horizontal page overflow, no theme control, and all four category images loaded with object-fit:contain. Desktop cards are approximately 304–322px tall; compact cards approximately 467px. No distortion or photo cropping.
- Confirmed autoplay starts on clean desktop load. Deterministic tests pass for cursor speed/direction, center crawl, exit autoplay, pause, repeated boundary reversals, reduced motion, hidden tabs, responsive transitions, short reels, and single RAF loop.
- JavaScript syntax checks and Git whitespace checks pass. No browser console errors were recorded.

Settings: assets/homepage/vertical-reel.css controls card stacking and reel dimensions; assets/photography/photos.js controls preview IDs and categories; assets/effects/permanent-style.css controls the fixed gold accents; assets/effects/dusk-background.css controls gradient colors.
