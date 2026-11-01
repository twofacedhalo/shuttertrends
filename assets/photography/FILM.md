# 35mm collection cards and homepage filmstrip

Shared decoration lives in film.css. Tune the :root variables:

- --st-film-rail: top/bottom border thickness (34px desktop, 30px tablet, 24px mobile).
- --st-film-pitch: sprocket repeat spacing (32/24/20px). The lightweight SVG has a slightly rounded rectangular hole; its width scales with this spacing.
- --st-film-hole-height: sprocket height (7/6/5px).
- --st-film-mark-color: warm film lettering color. Font size/spacing are in .st-film-mark.
- --st-film-stock: near-black border color.
- --st-film-image-height: shared strip image height; widths follow each photo's original aspect ratio.

Marking text is created in galleries.js (collection cards) and filmstrip.js (strip frames). All stock labels and frame numbers are aria-hidden, separate from real photo alt text. The whole collection card is a native link, with no nested interactive controls. Each index card loads just one preview image lazily. Collection detail thumbnails and their manual viewer remain intact.

The homepage filmstrip replaces the old arrow presentation and consumes the existing shuffled shutterTrendsPhotos pool unchanged. Categorization, portrait exclusion, vertical event eligibility, and the import workflow are unchanged. It has no navigation arrows. Mouse position controls direction/speed, the center rests, and leaving restores the default 16px/second drift. Edit speed and pointer multiplier in filmstrip.js. Touch uses native horizontal scrolling; keyboard users can Tab through original collection links or focus the viewport and use Left/Right/Home/End. A visible Pause/Play control is provided.

Two matching groups create the loop. Only original links enter the keyboard/accessibility sequence; repeated visual frames retain working pointer links. Padding rounds the cycle width to a sprocket-spacing multiple, preserving rail alignment at wraparound. Fractional travel is accumulated to avoid stalling at low speeds. Images retain fixed-height aspect-ratio space before loading. A resize observer remeasures only when needed.

Automatic movement stops for reduced motion, hidden/departed pages, offscreen content, touch interaction, keyboard focus inside the viewport, or the pause switch. The frame loop runs only while movement is active. Reduced motion leaves native manual scrolling available and removes hover transitions. The existing single atmospheric photo, dusk gradient, leaves, dust and spotlight are untouched.

## Vintage-to-original interaction

Homepage frames wrap their image in .st-film-image, which adds one static SVG noise texture above only that image. Adjust --st-film-vintage-saturation (.70), -sepia (.20), -contrast (.93), -brightness (.93), -blur (.65px), --st-film-grain-opacity (.12), and --st-film-develop-duration (350ms) in film.css. Hover on fine pointers, keyboard focus, or .is-original restores the untouched optimized image and fades out grain. Visible captions are omitted; accessible link names preserve photo metadata, and film markings remain above the grain. Collection viewers and the atmospheric background do not receive this treatment.

On touch, the first tap reveals the original and announces that a second tap opens the collection; the second tap follows the original link. Keyboard activation remains a direct link. Hovering scales pointer-directed speed to 24% (minimum 4px/sec) and speed eases over 400ms inside the existing frame loop, including gentle reversals. Pause still cancels that loop. Reduced motion removes filter transitions and automatic motion; native manual scrolling remains available.
