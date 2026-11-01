# Interchangeable cinematic themes

Change assets/site-config.js → themes:

- defaultTheme: autumn-after-dark (default).
- allowVisitorThemeSelection: true. Set false to hide the selector.
- randomizeThemeOnLoad: false. When true, randomization applies only without a valid saved preference.

Visitor selection uses localStorage key shuttertrend-visual-theme. Storage failures are caught; the site remains usable. Autumn After Dark is the fallback. The selector loads on the site's existing public pages, has native buttons with pressed/expanded state, focuses the selected choice on opening, and closes with Escape or an outside click.

Add another preset in assets/themes/presets.js using preset(id, name, [eight gradient colors], options). A preset's gradient array contains {color, at} stops, and options.gradient can supply custom positions. Presets merge shared defaults for photo, particles, leaves and spotlight. The selector automatically lists new presets, so winter/spring/summer/holiday themes need configuration only unless new artwork is desired.

Settings include accent, shade, photo.opacity/solidCore/featherEnd/saturation/sepia, particles.desktop/mobile/color/glow/opacity, leaves.enabled/maxLeaves/mobileMaxLeaves/opacity/spawnIntervalMs/colors/shape, spotlight.tint/intensity, grain, lightLeak and leakColor. Setting leaves.enabled false supports a future theme without autumn leaves. The legacy seasonalEffects.autumnLeaves.enabled remains a global off switch; theme presets supply the coordinated density/color settings.

The controller sets CSS variables, updates the current theme, and dispatches st-theme-change. Existing leaf and dust controllers update their own layers rather than creating new instances. Switching themes never reruns background selection or touches photo categorization. The grain and light leaks share one static, inert decorative layer. Registered gradient color properties blend over 600ms where supported; reduced motion disables transitions and existing falling/scrolling animation preferences remain respected.

Homepage polish is in assets/homepage/refinement.css: 1280px text grid, responsive gutters, headline hierarchy, wider filmstrip, subdued film rails, photo scrim, button consistency and reduced decorative emphasis. Filmstrip controls retain descriptive accessible labels while showing small play/pause symbols; instructions remain available to assistive technology. Original photography assets are unchanged.

## Files changed in this update

- assets/site-config.js
- assets/themes/presets.js
- assets/themes/themes.js
- assets/themes/themes.css
- assets/themes/README.md
- assets/homepage/refinement.css
- assets/effects/autumn-leaves.js
- assets/effects/banner.js
- assets/effects/photo-background.css
- assets/photography/filmstrip.js
- assets/photography/photos.js (Raising a Glass unpublished)
- index.html
- about/index.html
- events/index.html
- portraits/index.html
- collections/index.html
- services/index.html
- contact/index.html
- weddings/index.html
- author/douglasrendlesiii/index.html
- category/uncategorized/index.html
- 2026/10/27/hello-world/index.html
