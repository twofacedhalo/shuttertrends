# Interchangeable cinematic themes

Change assets/site-config.js → themes:

- defaultTheme: autumn-after-dark (default).
- allowVisitorThemeSelection: true. Set false to hide the selector.
- randomizeThemeOnLoad: false. Randomization applies only without a valid saved preference.

Saved choices use localStorage key shuttertrend-visual-theme, with graceful handling of unavailable storage. The selector uses native buttons, pressed/expanded states, focus management, Escape and outside-click closing. It loads on the existing public pages.

Add presets in assets/themes/presets.js using preset(id, name, [eight gradient colors], options). Gradient entries are {color, at}; options.gradient can provide custom stop positions. Shared defaults merge particles, leaves, spotlight and decorativeLeaves settings. The selector automatically includes new presets. Legacy photo settings are retained as inert preset data for compatibility; no atmospheric background photograph is rendered by the new homepage.

Themes control accent, shade, particles.desktop/mobile/color/glow/opacity, leaves.enabled/maxLeaves/mobileMaxLeaves/opacity/spawnIntervalMs/colors/shape, spotlight.tint/intensity, grain, lightLeak and leakColor. seasonalEffects.autumnLeaves.enabled remains the global falling-leaf off switch. Existing dust and falling-leaf controllers update their own layers on st-theme-change. Theme switching never creates another illustration layer or animation loop. Registered gradient colors blend over 600ms where supported; reduced motion removes transitions.

## Botanical autumn leaves

seasonalEffects.decorativeLeaves in site-config.js controls enabled, desktopCount (7, maximum 8 placements), mobileCount (3), size (1 = default), and radius (220 pixels). Sizes, rotations, SVG shapes and asymmetric positions are in decorative-leaves.js; responsive size factors are in decorative-leaves.css.

Each preset has decorativeLeaves.inactive, active, glow, and opacity settings. Defaults are muted bronze, #D6AD69 gold, .28 glow and .20 inactive opacity. Add a decorativeLeaves option block to any preset to customize them. Theme switching changes CSS variables without recreating leaves.

The fixed decorative layer shares st-spotlight-position events from the spotlight's eased, demand-driven loop. Leaf centers are cached on resize/breakpoint changes, avoiding per-frame layout reads. The layer owns no mouse listener, timer, or animation loop. Mobile/coarse pointers and reduced motion receive a subtle static highlight. Illustrations are inert, ignore pointer events and are hidden from assistive technology.

## Current homepage layout

vertical-reel.css provides the desktop editorial grid and sticky right-column film reel, with a horizontal fallback below the hero on smaller screens. refinement.css retains shared typography/buttons. The separate atmospheric photograph and its rendering/feathering files are removed. Background atmosphere now comes from the theme gradient, botanical leaves, falling leaves, particles, grain/light leaks where configured, and spotlight.

Reel details and adjustable settings are documented in assets/photography/FILM.md. The existing published photo exclusions remain: Raising a Glass and Purple Stage are unpublished; At the Microphone remains eligible. Original photo files and gallery collections are retained.
