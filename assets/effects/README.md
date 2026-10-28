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

The homepage loads banner.css and banner.js. The script creates 28 small spans on
desktop/tablet and 12 at widths up to 760px. CSS animates only transform/opacity,
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
