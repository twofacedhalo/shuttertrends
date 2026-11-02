# ShutterTrend typography

`typography.css` is the final shared stylesheet in each full page's `<head>`.
Edit its `:root` tokens to tune the entire site instead of adding page-specific font overrides.

- Display: existing local Cormorant Garamond, weights 400 and 500. Headings use 500.
- Interface/body: one local DM Sans Latin WOFF2 file covering weights 400–700.
- Both use `font-display: swap`; DM Sans is preloaded once per page. Removed the
  exported duplicate Manrope/remote font-face declarations. No runtime Google Fonts request.
- Hero 44–88px (40–56px on narrow screens); page titles 40–64px;
  section headings 32–44px; collection headings 26–34px; body 16–18px;
  captions/UI 15px. Paragraph line height 1.65; headings 1.12.
- Existing layout, image sizing, motion rules and the original logo styles stay intact.
  Tiny sprocket/film markings remain decorative and aria-hidden.
- Fallbacks: Georgia/Times for display; Arial/Segoe UI for body/interface.

DM Sans was obtained from the [official Google Fonts distribution](https://github.com/google/fonts/tree/main/ofl/dmsans).
Its SIL Open Font License is included in `fonts/DM-Sans-OFL.txt`.
Cormorant Garamond reuses the website's existing files under `wp-content/.../assets/fonts/`.

Checks: browser regression across the nine canonical pages at 1440, 768, 390,
320 and 720 CSS pixels; the latter covers the effective width of a 1440px window
at 200% zoom. For a final native browser check, press Ctrl+Plus until 200% and
Tab through navigation, form fields and photo controls. Fallback font appearance
can vary by operating system.
