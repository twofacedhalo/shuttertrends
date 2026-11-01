# Homepage spotlight

The fixed, decorative `data-st-spotlight` layer in `index.html` is hidden from
assistive technology and cannot receive pointer events. Its negative z-index
inside the body's isolated stacking context places it behind all content.
Only the homepage loads `spotlight.css` and `spotlight.js`.

Change these variables at the top of `spotlight.css`:

| Variable | Meaning |
| --- | --- |
| `--st-spotlight-color` | Comma-separated RGB values (default `207, 172, 104`) |
| `--st-spotlight-radius` | CSS length or clamp expression; default 360–850px |
| `--st-spotlight-intensity` | Opacity from 0 to 1; default `.13` |
| `--st-spotlight-smoothing` | Time constant in milliseconds; default `240`, lower follows faster, `0` follows on the next frame |
| `--st-spotlight-rest-x` / `-rest-y` | Rest position as viewport fractions, default `.5` / `.35` |

Reload after changing settings. Touch/coarse-pointer devices and reduced-motion
preferences use a static resting glow at 65% of the configured opacity. Pointer
movement starts a frame loop only until the light settles. Leaving the document
or blurring the window eases back to rest. Hiding the page cancels animation;
returning to it resets to rest. Scrolling needs no handler because the light
uses fixed viewport coordinates. No external dependencies or additional images.

Large homepage sections are transparent or lightly tinted to reveal the light.
Cards, photo frames, navigation surfaces, photographs, and the existing hero
gradient retain their own styling. The former static gold-speckle hero image is no longer used by the banner. Its file remains intact. Real CSS dust motes now appear in the banner; no portfolio photograph is altered.

Preview by opening the repository's `index.html` in a browser. Existing exported
theme URLs may require internet access. For a subpath preview with Python
installed, run `py -m http.server 8000 --directory C:\Projects` and open
`http://localhost:8000/shuttertrends/`. This optional local server is not a site
dependency. Move the mouse, scroll, leave the window, and try touch/reduced-motion
emulation in browser developer tools. Changes are local until you commit/push.

## Animated banner and frames

The homepage loads banner.css and banner.js. The script creates 40 small spans on
desktop/tablet and 18 at widths up to 760px. CSS animates only transform/opacity,
with randomized 32–62 second durations, negative start delays, 1.2–3.8px sizes,
low opacity, and up to 24px horizontal drift while rising 220px per cycle.

The inert, aria-hidden dust layer is positioned over the hero's document region
using ResizeObserver (including header/font changes), with no scroll handler or
continuous JavaScript frame loop. IntersectionObserver pauses it outside the
viewport; page visibility and pagehide pause it too. Reduced motion removes the
animation and keeps faint static motes. All decorative layers ignore pointers.

Layer order is body charcoal, photos/dark scrims (-3), dust (-2), spotlight (-1),
and content. The static artwork file remains available for existing metadata;
it is not downloaded or painted by the banner. The banner now has a responsive
440–640px desktop minimum, content-driven mobile height and 32px mobile vertical
padding. Very narrow header rows may wrap rather than overflow.

Four short viewfinder L brackets replace the former full-edge lines on the hero, central homepage carousel display, and featured cards. The cards reveal them only on hover or focus-within.
Particle counts/duration/size are adjustable in banner.js; movement endpoints,
frame colors, responsive spacing, and background strength are in banner.css.

## Camera viewfinder corners

The shared ::after rules in banner.css draw eight short CSS background strokes
(two per corner), with no full rectangular border and no extra DOM or JavaScript
animation. This is limited to the homepage banner, main carousel and two feature
cards. The particle layer remains behind the content and brackets.

Tune the variables in the body.home block at the top of banner.css:

| Variable | Default | Purpose |
| --- | --- | --- |
| --st-viewfinder-color | #c6a16a | Muted warm gold |
| --st-viewfinder-stroke | 1px | Stroke width; 1–2px recommended |
| --st-viewfinder-length | clamp(18px,2.2vw,30px) | Length of each L arm |
| --st-viewfinder-inset | 16px; 10px mobile | Distance inside the framed area |
| --st-viewfinder-opacity | .5 | Resting banner/carousel opacity |
| --st-viewfinder-active-opacity | .8 | Hover/keyboard-focus opacity |
| --st-viewfinder-duration | 280ms | Opacity transition, disabled for reduced motion |

Keep stroke/length values modest. Card corners rest at opacity 0 and reveal on
:hover or :focus-within; existing keyboard focus indicators remain intact. There
is no inward movement, flashing or pulsing. carousel.js exposes the current
central-photo inset through --st-photo-frame-inset, so the brackets track the
sharp display area while preserving the blurred neighbors. A small contained
image gutter keeps the strokes off the photograph without cropping it.

Particle density is controlled by `const count = mobile.matches ? 18 : 40` in banner.js. This is about 43% more desktop motes and 50% more mobile motes than the earlier 28/12 version. Roughly 8% may be slightly brighter, with the same long, gentle fade cycle; there is no flashing.

## Single background composition and visible autumn leaves

Exactly one backgroundEligible photograph is chosen at document initialization, independently of carousel categories. Portrait backgrounds remain eligible. The same image stays mounted through scrolling and responsive changes, using object-fit: contain and a blurred extension of that image. Desktop uses 64vw, tablet 80vw, mobile 92vw within the viewport. No additional atmospheric images are created. The fixed layer remains visible from hero to footer. A radial mask follows the sharp image’s intrinsic bounds, fading all outer edges while retaining a sharp center. A viewport-wide, blurred extension reuses the same selected optimized URL.

In assets/site-config.js, atmosphericBackground.avoidImmediateRepeat (true) uses sessionStorage to exclude the last selection when alternatives exist. If storage is unavailable, selection still works randomly. This does not guarantee uniqueness between browser tabs. Photo eligibility remains in the existing photography metadata.

seasonalEffects.autumnLeaves controls enabled, maxLeaves (8), mobileMaxLeaves (3), opacity ([.30, .55]) and spawnIntervalMs ([5000, 10000]). Two initial desktop/tablet leaves (one mobile) start partway through their fall so they are visible immediately; subsequent groups have 1–3 leaves (one mobile). Leaf sizes are 12–28px, durations 28–40 seconds. Gentle fading starts at 5% of the fall. The previous long initial wait and low compounded opacity made the effect easy to miss; the original single animation system now handles this without duplication.

The inert leaf layer is above atmospheric photographs and below spotlight/content. It ignores pointers. Hidden pages clear leaves and cancel timers; returning restarts with an initial group. Reduced motion disables falling. Leaves are removed on animation completion, and density caps prevent accumulation. Existing golden dust and carousel rules are unchanged.

## Dusk-to-blue-night homepage

The homepage loads dusk-background.css after the existing atmospheric effects. Its body.home background is one document-height gradient: scrolling reveals copper/rose, mauve/indigo, slate/blue, then navy/near-black. No scroll handler, JavaScript loop, time-based color animation or fixed background attachment is needed. The gradient responds automatically to content height and viewport changes.

Edit the eight --st-dusk-*, --st-twilight-*, --st-night-* and --st-midnight-* color variables at the top of assets/effects/dusk-background.css. Stops are at 0/14/28/43/58/73/88/100 percent. --st-atmosphere-shade (.64) controls the dark contrast overlay; --st-spotlight-intensity (.10) tunes the gold glow. The fixed photographic backing is transparent while images retain contain sizing and a light navy scrim. Large section surfaces are transparent to avoid seams.

Supported browsers use a native scroll timeline to lower the leaf layer opacity from 1 to .65 toward midnight. Other browsers use .85 throughout. Reduced motion skips this enhancement and existing falling animations remain disabled. Leaf settings, particle density, photo eligibility and all interactive scripts remain unchanged.

## Feathered full-page atmosphere settings

In photo-background.css, body.home owns the visibility and positioning settings. --st-background-photo-opacity defaults to .33 (banner.css no longer overrides it). --st-photo-solid-core (48%) sets the fully opaque center of the elliptical mask; lowering it gives a wider feather. --st-photo-feather-end (100%) sets the transparent boundary; keep it at or below 100% to avoid hard edges. --st-photo-width (64vw/80vw/92vw), --st-photo-right (4vw), --st-photo-top and --st-photo-bottom control the sharp composition’s area. --st-photo-object-position controls the blurred extension’s focal point and the contained image alignment.

--st-photo-extension-opacity (.16; .12 mobile) and --st-photo-extension-blur (32px; 20px mobile) tune the viewport-wide atmosphere. Both prefixed and standard masks support modern Safari, Chrome and Firefox. Only the extension uses cover/blur; the sharp image uses intrinsic proportions with contain and max dimensions. The fixed composition requires no scroll handler, resizing loop or document-height image buffer. Portrait eligibility, session selection and filmstrip rules remain unchanged.
