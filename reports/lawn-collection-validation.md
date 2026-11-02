# An Afternoon Together: session organization

Collection: /shuttertrends/collections/?id=an-afternoon-together
Category: Portraits / Personal Moments
Description: An easy afternoon outdoors, shared smiles, and the little moments that make a memory.
Cover: IMG_3122.jpg (import-90e1cfb57735), a landscape photograph of both people and their corgi.

Visual inspection of optimized previews confirmed matching people, clothing, corgi, lawn and red farm buildings throughout the 21 selected photographs. Existing metadata and filename sequence support the grouping. The collection keeps the original numeric order: seated portraits and affectionate moments, the running dog sequence, then walking together. No date, location or subject identity was invented.

References moved from People & Everyday Moments, preserving every per-photo metadata field and the same physical candid-portraits folder:
IMG_3058.jpg, IMG_3062.jpg, IMG_3070.jpg, IMG_3075.jpg,
IMG_3100.jpg, IMG_3102.jpg, IMG_3121.jpg, IMG_3122.jpg, IMG_3125.jpg,
IMG_3136.jpg, IMG_3151.jpg, IMG_3153.jpg, IMG_3162.jpg, IMG_3163.jpg,
IMG_3180.jpg, IMG_3183.jpg, IMG_3188.jpg,
IMG_3190.jpg, IMG_3192.jpg, IMG_3194.jpg, IMG_3195.jpg.

No selected images require classification confirmation. The related graduation photographs were deliberately left in their existing graduation collection, including IMG_3105 (the unchanged homepage Personal Moments cover), IMG_3013 and IMG_3055. This respects the request to preserve Graduations. Unrelated indoor/sidewalk portraits remain in People & Everyday Moments; studio portraits are unchanged.

Implementation: existing collection manifest/route and existing 35mm card, with optional previewMode/coverPhotoId settings. Only the new entry uses the direct View Collection card. It appears on /portraits/ and in the existing Portraits dropdown. Shared asset cache versions were updated in all 13 HTML heads; body markup is unchanged.

Validation:
- Snapshot comparison confirms every original photo ID, metadata object and physical source path is unchanged; no photo references deleted or duplicated. All other collection objects and homepage cover configuration compare exactly with the preceding commit.
- Six unrelated candid photos remain; 21 photos are in the new collection. All 96 published photos and optimized viewer paths remain valid.
- Browser opened every one of the 21 thumbnails in the existing fullscreen viewer with the matching index and contain sizing. No console errors.
- Card cover checked at 1440x900, 768x1024 and 390x844: original 3:2 proportions, contain fit, image loaded, shared gradient, no horizontal overflow.
- Mobile collection has 21 previews, no horizontal overflow, working fullscreen portrait view. Mobile Portraits dropdown links to the new collection. The existing Across the Lawn deep link still opens its original four-photo story.
- Existing homepage/reel, header gradient and silent logo flash validations pass. Photograph files, lightbox/controller code, curated story definitions, contact form and homepage card markup are unchanged.
- Viewport simulations, not physical-device tests. No contact form submitted.
