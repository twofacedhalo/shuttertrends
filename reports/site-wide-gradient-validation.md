# Site-wide gradient validation

The unchanged homepage gradient now paints all 13 page bodies through assets/effects/dusk-background.css. Exact colors, stop percentages and shade are preserved. Full-width page sections/footer expose one document-height gradient; nested cards/forms/viewers retain their dark surfaces. Min-height 100dvh (100vh fallback) covers short pages. Both layers use 100% 100% and no-repeat, with a midnight html fallback. Existing header/gradient.js measures actual body height, observes content resizing, and samples the same scroll-position band, so no JavaScript change was needed.

Routes audited at desktop 1440x900, tablet 768x1024 and mobile 390x844:
- / (homepage)
- /portraits/ (Personal Moments)
- /events/
- /weddings/
- /graduations/
- /stories/
- /collections/
- /about/
- /services/
- /contact/
- /author/douglasrendlesiii/
- /category/uncategorized/
- /2026/10/27/hello-world/

Results: 39 route/viewport combinations share the exact computed body/header gradient, have transparent full-width page sections/footer, and show no horizontal overflow. All 16 published /collections/?id= detail views were checked at all three sizes (48 checks); none failed gradient or overflow checks. Header height/scroll-band matching and sticky positioning passed at page bottom for every route at all three sizes (39 checks); upward Home scrolling was also exercised. A short archive at 1920x1080 has a 1080px body and full-height gradient without gaps. About top/bottom and short archive screenshots were visually inspected for readability and continuous header/footer blending. Browser console error log was empty. These are viewport simulations, not physical-device tests. No contact form was submitted.

Static review confirms all 13 HTML bodies are unchanged; only CSS cache-version references changed. Palette/gradient declarations compare exactly with the preceding commit, and all stylesheet paths resolve under /shuttertrends/. No image, logo, caption, card, navigation markup, reel/viewer controller or form was modified. Leaves remain homepage-only; the existing silent warm logo flash is unchanged.

Checks: node tools/validate_header_gradient.cjs; node tools/validate_camera_interaction.cjs; node tools/validate_homepage.cjs; git diff --check.
