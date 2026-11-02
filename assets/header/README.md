# ShutterTrend header

The static header no longer uses WordPress navigation classes, interactivity
attributes, separate open/close buttons, or its standalone navigation driver.
Scoped `st-*` markup and local CSS/JavaScript provide the navigation directly,
without a WordPress runtime or third-party library. Other exported content and
its dependencies remain in place.

## Files

- `header.css`: 84px desktop row, 76px tablet/mobile row, panel, current-state
  underlines, colors and reduced-motion support.
- `header.js`: disclosure state, single-toggle icons, Escape/outside-click/Tab
  handling, focus transfer, responsive reset and current-page highlighting.
- `logo-mark.svg`: editable aperture/lens symbol with four viewfinder corners;
  it is embedded inline so its parts can respond to CSS hover and focus.
- `../../tools/update_header.cjs`: shared header template and static generator.
  Edit its link list or wordmark here, then run `node tools/update_header.cjs`
  from the repository. It regenerates the exported page headers and branding.
  Generated HTML is ready to publish; no build step runs on GitHub Pages.
- `../photography/galleries.js`: dynamic collection page titles use ShutterTrend.
- `../effects/banner.css`: obsolete narrow-screen WordPress-header wrapping
  rules removed; particle/viewfinder behavior remains unchanged.

The generator updates these 11 pages:

```
index.html
portraits/index.html
events/index.html
about/index.html
services/index.html
contact/index.html
weddings/index.html
collections/index.html
author/douglasrendlesiii/index.html
category/uncategorized/index.html
2026/10/27/hello-world/index.html
```

Page titles, metadata, visible footer text and uppercase homepage branding use
**ShutterTrend**. Repository paths, photo filenames, JavaScript data identifiers,
private import-folder names, domain and Git remote retain their existing names.

## Behavior and accessibility

Above 1000px, navigation is one horizontal row with no bullets or menu toggle.
At 1000px and below, one 44px button controls the dark disclosure panel. Its
accessible name and `aria-expanded` state switch between Open menu/Close menu.
The inactive icon is hidden, and the menu is removed from the focus order while
closed. Opening moves focus to Portraits; Escape returns focus to the button.
Tab follows normal document order and closes the panel after leaving the
header. Outside clicks, ordinary link selections, and breakpoint changes close
it. This is a nonmodal navigation disclosure, so it does not trap focus or lock
page scrolling. Without JavaScript the links remain visible and usable.

The current page has a gold underline and `aria-current="page"`. Collection
pages can identify their Events/Portraits parent with `aria-current="location"`.
The homepage logo is the home link and identifies the current homepage.

The aperture rotates 12 degrees, corner brackets move 2px inward, and a faint
gold glow appears on logo hover/keyboard focus. Transitions are 400ms; reduced
motion removes the transformations and transitions. Adjust those rules in
header.css. The wordmark uses the existing editorial font with a serif fallback.

## Preview

From PowerShell, with Python installed:

```powershell
py -m http.server 8000 --directory C:\Projects
```

Visit `http://localhost:8000/shuttertrends/`. Also check Portraits, Events,
Contact, a full collection, and an archive page. Test 1440/1024px desktop,
768px tablet, and 390/320px mobile widths. Check Tab, Enter, Escape, outside
clicking, current-page states, and reduced-motion preferences. Existing
WordPress-exported contact-form/CDN dependencies are separate from this header.
The logo and navigation work independently of those external assets.

No commit, push, repository rename or domain change is performed by this workflow.

## Photographic dropdowns

Portraits and Events now have disclosure panels generated from published manifest collections and the navigation arrays in assets/site-config.js. Desktop hover or anchor focus opens a panel; the chevron can toggle it. ArrowDown enters its cards, Escape closes it and returns focus to the chevron. A short pointer-leave delay avoids flicker. Mobile uses expandable sections within the main menu. Thumbnail sources are assigned only on first opening. Reduced motion removes transitions. Invalid/unpublished destinations are skipped.

The shared generator loads site-config.js, photos.js, optimized.js and collections.js before the header script on every page. The contact page now uses its own local Formspree form; the obsolete WordPress form and form-only scripts were removed.

## Shared scroll-reactive gradient

The navigation remains sticky and uses the existing eight-stop cinematic palette from `../effects/dusk-background.css`. The shared `--st-page-gradient` also paints the homepage; its colors, stop percentages, and 0.64 shade are unchanged. `gradient.js` observes actual body height and positions the header's copy at the corresponding document band as visitors scroll. Scrolling upward reverses the same progression. Updates use one queued frame per scroll burst, without body layout reads on scroll, time-driven color cycles, or extra transitions. Nothing animates at rest; reduced-motion visitors receive the same direct scroll-to-color mapping.

`gradient.js` removes listeners/observation on page departure and reconnects on history restore. Header backgrounds are opaque, so existing page particles/leaves do not become header decorations. No new header effects or shadows are added by the gradient.

## Logo camera interaction

The original camera/aperture artwork and serif wordmark are retained. The logo file's Git blob is `6534319d698dfab614095cfc5fc30406cd8ebe3f`, identical to its original `45fd416` version. Runtime `camera.js` adds a small speaker toggle beside the existing home link, without editing its SVG or text. Desktop/tablet brand dimensions remain those in header.css. A small spacing adjustment between 1001–1100px accommodates the control without shrinking the original branding or changing navigation labels/destinations.

- `camera.css`: one 350ms, maximum-0.38-opacity white flash; fixed overlay, inert and pointer-events:none. Only the existing aperture group rotates 22 degrees and contracts to 90%; the wordmark stays stationary. Reduced motion disables both effects.
- `camera.js`: ordinary logo activation triggers the effect. On the homepage it keeps the document and scroll position; elsewhere it follows the existing home URL after 360ms. Ctrl/Cmd/Shift/Alt clicks, middle-click, and native new-tab actions remain untouched. Keyboard Enter works; held-key repeats and activations within 900ms are coalesced to prevent strobing/overlapping audio.
- `../audio/camera-shutter.wav`: original synthesized mechanical shutter, 0.27s, mono 44.1kHz PCM16, 23,858 bytes, played at 30% volume only after activation. No third-party samples or audio library. See audio/README.md for CC0-1.0 licensing and tools/create_shutter_sound.py to regenerate.
- Sound defaults on, with an accessible pressed-state toggle and `shuttertrend-shutter-muted` preference. Storage/audio failures are caught independently of the visual effect and navigation.
- One flash layer/audio element are reused. Page departure aborts event listeners, clears timers, and pauses/unloads audio; history restore reconnects once. No camera access or actual photograph capture occurs.

All 13 public pages load the shared palette, header CSS/driver, gradient.js, and camera.css/js. The additional pages beyond the original list are stories/index.html and graduations/index.html. New page templates should include these same header assets.

Validation commands: `node tools/validate_header_gradient.cjs`, `node tools/validate_camera_interaction.cjs`, and the existing homepage validation. Browser results are recorded in reports/header-camera-validation.md.
