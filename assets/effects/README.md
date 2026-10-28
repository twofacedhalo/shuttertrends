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
gradient retain their own styling. The existing decorative hero background is
retained at 35% opacity; no portfolio photograph is faded or recolored.

Preview by opening the repository's `index.html` in a browser. Existing exported
theme URLs may require internet access. For a subpath preview with Python
installed, run `py -m http.server 8000 --directory C:\Projects` and open
`http://localhost:8000/shuttertrends/`. This optional local server is not a site
dependency. Move the mouse, scroll, leave the window, and try touch/reduced-motion
emulation in browser developer tools. Changes are local until you commit/push.
