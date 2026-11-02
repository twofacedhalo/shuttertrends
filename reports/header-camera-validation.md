# Original branding, scroll-reactive header, and camera interaction

Validated locally under /shuttertrends/ on 2026-11-01.

## Branding and scope

- Camera/aperture SVG is identical to original Git version 45fd416 (blob 6534319d698dfab614095cfc5fc30406cd8ebe3f). No restoration or artwork replacement was necessary.
- Original serif family, gold/cream colors, emblem dimensions, and internal brand spacing remain. Browser measurements: desktop 48px emblem / 32px wordmark; mobile 44px / 29px; extra-small 38px / 27px, matching existing styles. Wordmark bounds remain stationary during the camera effect.
- All 13 page bodies, including complete inline logos, original wordmarks, links, Get in touch button, homepage wording, category cards, and photography markup, match their previous versions after line-ending normalization. Only head asset links were added/updated. Camera UI is attached at runtime.
- Photo files, film motion controller, navigation driver, contact form, and homepage layout styles are unchanged.

## Header gradient

- Reused the exact existing eight CSS colors, percentages, and 0.64 shade in one shared --st-page-gradient. The homepage still renders that same gradient. Other page backgrounds remain unchanged; their shared navigation uses the homepage palette.
- The sticky header paints a document-height copy of this gradient, offset by actual scroll position. Browser confirmed computed header/homepage background images are identical.
- Desktop samples: top offset 0px; middle scroll 2073px → offset -2073px; lower page 3586px → -3586px; upward return 845px → -845px. Header stayed at viewport top. Screenshots confirmed warm upper tones, indigo/purple through the middle, and deep navy lower down.
- No independent palette presets, timer-based color changes, header leaves, particles, wind, or new shadows. Header style remained unchanged while scrolling stopped.
- Unit tests pass for one queued frame per scroll burst, no body layout reads during scroll, reverse scrolling, document resize, idle stability, hidden state, cleanup, and history restore. No time-based gradient animation is used, including under reduced motion.

## Camera interaction

- One reused flash overlay and one audio element. Browser observed the flash class and aperture animation after logo activation; both clean up afterward. Overlay is fixed/inert with pointer-events:none, so it cannot block controls or shift layout.
- Audio is assets/audio/camera-shutter.wav: original synthesized two-stage mechanical shutter, CC0-1.0, 0.27s mono 44.1kHz PCM16 WAV, 23,858 bytes. Configured at 30% volume. Browser decoded and played it once to completion after activation; played ranges were empty and audio paused on initial load and arrival from another page.
- Homepage activation preserved the same shuffled reel sequence, demonstrating no reload. A direct native click while scrolled kept scrollY exactly 804px and body height unchanged. Keyboard logo activation also triggers the flash.
- Muting keeps the visual effect while audio stays paused at time zero. The preference persisted onto About and back. The real speaker button has a pressed state, live status, and visible 2px keyboard focus indicator.
- About-page logo activation visibly initiates the interaction and returns to /shuttertrends/ after the brief delay. Unit timing checks navigation at 360ms, not earlier. Normal modified/middle/new-tab navigation is not prevented.
- Rapid activation is coalesced within 900ms; unit tests verify one flash/audio play, no overlapping audio, held-Enter suppression, and graceful blocked-audio behavior. Reduced-motion tests verify visual classes are omitted; CSS also disables flash/aperture animation.
- Page departure clears timers/listeners and unloads audio. Browser history restore retained one flash layer and one audio element, with sound preference and gradient behavior intact.

## Responsive checks and preservation

Browser checked 1440, 1366, 1024, 1001, 768, 390, and 320px widths. No horizontal page overflow; branding remains aligned with the homepage column. Small container-gap adjustments at narrow desktop widths accommodate the discreet speaker icon while retaining logo size and navigation labels/CTA.

Desktop photographic dropdown keyboard Enter/Escape, mobile menu and portrait dropdown, sound-toggle keyboard activation, homepage link navigation, and gradient updates were exercised. No JavaScript console errors were recorded. Mobile checks use browser viewport simulation rather than a physical iOS/Android device; native media restrictions are handled gracefully.

Commands: node tools/validate_header_gradient.cjs; node tools/validate_camera_interaction.cjs; node tools/validate_homepage.cjs; node --check on new scripts; branding/body preservation audit; git diff --check. No live contact submission was made.
