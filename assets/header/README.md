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
