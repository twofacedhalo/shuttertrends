# Graduation Day upload grouping

Added the three user-provided JPEGs to the existing graduation-day collection after its original IMG_1058 cover. No new collection or route was created. The gallery now contains four photographs.

- Photo 1: graduate and companion outdoors; 1280x1280. ID import-ee6e2fc26f4d.
- Photo 2: graduate with two people and a bouquet indoors; 1280x853. ID import-83669f2ef148.
- Photo 3: close graduation portrait indoors; 1280x853. ID import-f77485a1620e.

Original uploads remain untouched at their attachment locations. Source SHA-256 values did not duplicate any manifest photo. Only six WebP derivatives were added: a 600px thumbnail and full-size copy for each source. Existing optimizer color/rights handling was reused. Gallery and fullscreen roles share the full-size copy, without upscaling. Exact dimensions, hashes and byte sizes are in graduation-day-import.json. No identities, family relationships, dates or locations were inferred.

Validation: all four photos opened in the existing fullscreen viewer with contain sizing. Mobile square photo retained 1:1 proportions; no horizontal overflow or console errors. Existing Graduation Day cover, other collection metadata and all prior optimized variants compare unchanged with the preceding commit. Homepage reel tests pass; the total published count is now 99 (38 graduation photos). Shared photo/optimized asset cache versions updated across all 13 HTML heads; no body markup changed.
