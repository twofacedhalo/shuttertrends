# Landscape featured previews

Restored original Personal Moments photograph IMG_3105 (couple with dog). Selected existing landscape wedding IMG_6390 and graduation IMG_1058 after visual review. Events retains IMG_3355.

All four previews use a responsive 3:2 box with object-fit:contain. Removed the fixed-height override that left wide blank margins around portrait photos. No original or optimized image files were modified, duplicated, or generated.

Browser validation: all four images load; desktop preview boxes measure approximately 647×431px at a 1440px viewport and mobile boxes 329×219px at 390px. Source and box aspect ratios match within image-resize rounding, with no distortion, cropping, or broad side gaps. No horizontal page overflow. Card order, descriptions, exploration links, reveals, and reel implementation remain unchanged.

Checks: node tools/validate_homepage.cjs; node --check assets/photography/photos.js; git diff --check.
