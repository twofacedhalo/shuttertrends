# ShutterTrends photo guide

## 1. File structure

- `assets/photography/photos.js`: the only manifest to edit for photos and collections.
- `assets/photography/collections.js`: manifest validation, path resolution, showcase selection.
- `assets/photography/carousel.js` and `carousel.css`: cinematic homepage showcase and shared collection viewer.
- `assets/photography/galleries.js` and `galleries.css`: collection previews and full galleries.
- `assets/images/featured/`: Lynchburg Through My Lens images.
- `assets/images/events/`: existing concert/event photographs.
- `assets/images/portraits/` and `assets/images/weddings/`: category photos.
- `assets/images/your-event/`: create a folder for each new event when needed.
- `collections/index.html`: reusable full-collection page; no new HTML needed for events.
- Existing `portraits/`, `events/` and `weddings/` pages aggregate matching collections.

Existing WordPress assets and the original `501.01.jpg` stay in place. That
photograph is registered in Concerts; no date/location has been assumed.
Folders may contain a `.gitkeep` so Git preserves them when empty.

## 2. Add photos and manage captions

Open `assets/photography/photos.js`. Each collection has a `photos` list.
Copy your image into that collection's `folder` beneath `assets/images/`,
then add an entry like this (replace the example with your actual photo):

```js
{
  id: 'river-dusk-01',
  file: 'river-at-dusk.webp',
  alt: 'Describe what is actually visible in this photograph.',
  title: 'Your title',
  caption: 'Your caption.',
  location: 'Your location',
  width: 1800,
  height: 1200,
  showcase: true,
  thumbnail: 'river-at-dusk-preview.webp'
}
```

Only `file` and meaningful `alt` text are required. Other fields are optional.
Omit `thumbnail` unless you have created that smaller image in the same folder.
Use a globally unique `id` for each photograph; keep the same ID if you list
the same photograph in several collections, even with different exports.
Identical source paths are also deduplicated in the showcase. The site cannot
recognize copies stored as different filenames unless you give them the same ID.
Use filenames containing letters, digits, dots, hyphens and underscores, with
no spaces, slashes, or leading slash. Match filename case exactly.

Separate entries with commas. Move whole photo objects to reorder them; edit
`title`, `caption` and `location` to change text. Remove an entry to remove
a photo from the site; it does not delete its file. `photos: []` is valid.
Set `published: false` on a photo to hide it everywhere. Set
`showcase: false` to keep it in its collection but exclude it from the homepage
showcase. Eligible photos default to inclusion when `showcase` is omitted.

## 3. Create a named event or category

Add a collection object to the top-level manifest list. For example:

```js
{
  id: 'your-event',
  title: 'Your Event Name',
  description: 'Describe this collection.',
  category: 'events',
  folder: 'your-event',
  date: 'Your event date',
  location: 'Your event location',
  published: true,
  photos: []
}
```

Create `assets/images/your-event/` and add your photos there. Choose a unique
lowercase `id` and folder name using letters, digits and hyphens. Date and
location are optional display text; omit them if unknown. Collection location
is inherited by photos unless overridden per photo. Collection order in the
manifest is the homepage order. Photo order controls previews and full galleries.
Set `published: false` on a collection to hide it from all site views and from
the showcase. Hidden entries are still present in the public JavaScript file;
this is editorial visibility, not private storage.

Published collections automatically get a homepage section with up to three
preview photographs and a **View full collection** link. The shared page is
`collections/?id=your-event`. It works on GitHub Pages without URL rewrites.
The homepage showcase is separate from the ordered collection previews.

Use `category: 'portraits'`, `'weddings'`, `'events'`, or `'concerts'`
to appear on the corresponding existing page (Concerts appears on Events).
Any other category still works on the homepage and full-collection page.
New events need no new HTML or navigation changes.

## 4. Showcase and loading behavior

The homepage selects up to eight distinct eligible photos across all published
collections. It shuffles once per page load using Fisher–Yates, then keeps that
selection and order while you navigate. Reloading makes a new random selection;
it can coincidentally repeat the previous order. The homepage now rotates through that fixed selection every seven seconds; collection viewers remain manual.

Use previous/next buttons, Left/Right keys, Home/End or horizontal touch swipes.
Keyboard controls apply when focus is inside the carousel; Tab reaches it and
its controls. Reduced-motion preferences disable fades. One photo still shows
its counter and hides navigation and rotation buttons. Zero photos shows an empty message.
The first showcase image loads near the viewport; other showcase images are
requested only when selected. Failed images retain the last successful image
and announce an error; use the controls to continue or fix the filename/reload.

Collection previews and full galleries use lazy image loading. Optional
`thumbnail` exports reduce preview traffic; full collections use the main
`file`. If a preview fails, it retries the main image, then shows an unavailable
message if that also fails. Empty collections remain visible with a friendly
message; unknown/unpublished collection links offer the published collection list.
A static site cannot check whether an image exists before requesting it.

## 5. Image sizes and aspect ratios

Use web-sized WebP, AVIF or JPEG exports, around 1600–2000px on the long edge
for main photos, ideally 200–400KB. For previews, export 600–800px versions,
ideally under 100KB, and reference them with `thumbnail`. Keep originals
elsewhere. The original concert JPEG remains untouched at about 1MB. Generated WebP versions now serve the website instead.

Enter actual exported dimensions in `width` and `height` to reserve space.
The showcase fits the whole image in a stable dark frame; gallery images retain
natural proportions. Portraits and landscapes are not cropped. Full-gallery
images select the collection carousel; its Open larger photograph link opens the optimized large-view image. No stock photos, database,
directory listing, build tool or WordPress runtime is required.

## Automatic optimization

After adding or changing photographs in the manifest, run from the repository:

```powershell
py -m pip install -r tools/requirements-images.txt
py tools/optimize_photos.py
```

Python with Pillow and Node.js are needed only for local preparation, never
for GitHub Pages. The script automatically discovers published manifest photos,
applies EXIF orientation, converts embedded ICC profiles to sRGB, resizes with
Lanczos without upscaling or added sharpening, and writes WebP at quality 85
(method 6). If WebP support is unavailable, it writes optimized progressive
JPEG at quality 85. Untagged RGB is assumed sRGB and flagged in the report;
non-RGB sources without a color profile stop the run rather than guess colors.
Only copyright/creator metadata is copied from EXIF, IPTC or standard XMP.
GPS, camera details and timestamps are not copied. Review the report for
missing copyright data or untagged source color assumptions.

Generated files live in `assets/images/optimized/`. The generated
`assets/photography/optimized.js` maps each source filename to thumbnail,
gallery, showcase and large-view variants. Do not edit it manually.
`collections.js` merges those references into the photo data; `srcset` and
`sizes` let browsers choose appropriately sized images. Browser display loads
only the selected carousel images and lazy gallery previews, with the large
image fetched only when its link is opened.

Limits on the longest edge: 600px thumbnails, 1600px galleries/collection
carousels, 2000px homepage showcase, 2400px large-view links (also suitable for
a future fullscreen lightbox). The current site opens the large image through
a link; no separate modal lightbox is added. Identical effective dimensions
share one file, so a 2000px source uses one 2000px file for showcase/large view,
never a duplicate 2400px export. Showcase-excluded photos need no showcase
variant. Empty/unpublished collections produce no files. Existing outputs are
reused on repeat runs; obsolete generated files are not automatically deleted.

The script reports dimensions, exact bytes, per-file savings, color handling,
rights retention and verified source SHA-256 in
`reports/photo-optimization.md` and `reports/photo-optimization.json`.
Savings describe transfer sizes, not repository size: originals remain intact.

For future photos, keep originals outside the public repository, with collection
folder names beneath your private source directory. For example:

```powershell
py tools/optimize_photos.py --originals-dir C:\PhotographyOriginals
```

A source entry `folder: 'events', file: 'photo.jpg'` then reads
`C:\PhotographyOriginals\events\photo.jpg`. Use the same manifest fields;
the generated mapping serves only optimized files. Keep that generated mapping
when publishing. Every published source must exist under the chosen source
root. The existing original inside the repository has not been moved/deleted;
relocating it remains a review decision. Commit/push only after reviewing output.

## Orientation-aware viewing

The shared carousel reads each loaded image's natural dimensions and classifies
it as portrait, landscape or square. It uses `object-fit: contain`, centers the
whole image on charcoal, and never crops or stretches it. Collection viewers retain charcoal surroundings. The homepage uses blurred neighboring thumbnail previews. The homepage's randomized eight-photo
selection remains unchanged while browsing. Full collections retain manifest
order and use the same controls, swipe gestures and keyboard behavior.

Desktop frame height is `clamp(320px, 75vh, 900px)`, capped at `80vh` for
short viewports. At widths of 600px or less, it becomes
`clamp(220px, 55svh, 520px)`, capped at `65svh`, with vh fallbacks.
The stable small-viewport unit avoids mobile address-bar resizing. Every slide
occupies the same fixed frame; portrait images use available height and
landscapes use available width as their ratio permits. Images crossfade inside
that frame. The charcoal side/top space preserves composition.

Captions and 48px controls sit outside the photo. A reserved 8rem metadata area
prevents variable caption lengths from moving the controls or following content;
long text scrolls and can be reached with Tab. On mobile the controls come
before the metadata. Reduced-motion disables fades and thumbnail-scroll motion.
Full collection thumbnails select/focus the large viewer; modified clicks still
open the optimized image URL. The Open larger photograph link opens the large
optimized version. Thumbnail grids retain natural image proportions and logical
reading order, so vertical images can be taller without forced cropping.

## Randomized editorial photo background

Only photos marked `backgroundEligible: true` are candidates for the homepage's
decorative photographic background. This is independent of `showcase`, which
controls the central carousel. Omitted or false means the photo is not eligible.
Unpublished photos and unpublished collections are always excluded.

Six existing public photos are initially enabled: IMG_2926 (Across the Lawn),
IMG_1318 (Among the Flowers), IMG_1517 (By Candlelight), IMG_3355 (Music Under
the Canopy), IMG_3883 (Across the Stage), and IMG_6412 (In the Evening Light).
Change/remove those flags or add the flag to any other approved manifest photo.
No new source images, image derivatives, or external images are required.

The background script makes its own deduplicated candidate list using stable
photo IDs and optimized source URLs. It shuffles this copy and selects 1–3
photos once per page load, capped by availability. The carousel's selection
and ordering are not modified. Scale, position, and angle vary across three
asymmetrical edge zones on desktop. Random selections can coincidentally repeat;
there is no cross-visit tracking or storage. With no eligible photos, it makes
no background image requests and preserves the charcoal/spotlight fallback.

At widths above 1000px, up to three selected photos appear. Tablets (601–1000px)
display at most two. Phones display only one with a stronger dark overlay.
On an initial phone load, only that one photo receives a source. Resizing keeps
the same selected arrangement, revealing/hiding its other members as appropriate;
it never reshuffles on scroll, resizing, or carousel navigation.

Background images use existing 600px/1600px responsive variants with low fetch
priority. There are no image preloads, extra full-resolution requests, scroll
handlers, or continuous background animation. A short opacity reveal is disabled
for reduced motion. The original photograph's aspect ratio is preserved; the
viewport clips decorative outer edges without stretching the image.

The fixed photo layer sits at z-index -2 inside the homepage's isolated body.
The existing spotlight remains at -1 above it and below page content. Both are
non-interactive; the photographic layer is inert and hidden from assistive
technology. Strong left/center gradient scrims protect text and controls; cards,
navigation and the carousel retain their existing surfaces and content.

Files: `assets/effects/photo-background.js`, `photo-background.css`,
`assets/photography/photos.js`, and the homepage integration in `index.html`.
Adjust `--st-background-photo-opacity`, gradient stops, and responsive placement
in the new CSS file. The existing spotlight implementation is unchanged; the
new stylesheet only makes its opaque backing transparent to reveal the photos.

## Cinematic three-photo homepage

The homepage has overlaid 48px circular gold navigation buttons at the left and
right stage edges. The counter and an accessible Pause/Play button remain below
the stage, alongside the reserved caption area. Full-size collection viewers
retain their manual behavior and existing controls.

Desktop side buttons display the previous/next photograph using existing 600px
thumbnail variants, blurred by 16px and darkened. The sharp central photograph
always uses contain sizing. Preview regions are clipped outside the central
frame; portrait photographs leave wider preview areas, while landscape photos
receive a wider central frame. Clicking a preview selects its photograph.
Neighbors wrap around. Two-photo selections show just one alternate preview;
one-photo selections show none. At 600px screen width or below, previews are
hidden so the central photo and overlaid arrows retain enough space.

Automatic rotation advances approximately every 7000ms with a 1000ms crossfade,
cycling through the once-shuffled homepage selection without reshuffling.
It pauses on mouse hover, keyboard focus, touch/control interaction, hidden
tabs, offscreen stages, and visible native/ARIA modal dialogs. The Pause button
keeps rotation stopped until Play is selected. Play permits rotation to resume
after hover/focus/interaction ends, with a fresh seven-second delay. Reduced
motion disables automatic rotation and fades, including when the preference
changes while the page is open. Automatic changes are not announced repeatedly
to screen readers; manual navigation has polite status announcements.

There is currently no modal lightbox; large-view links are preserved. Navigating
away stops the timer. A future custom lightbox can send `st-lightbox-open` and
`st-lightbox-close` events on document; native and visible ARIA modals are also
detected. Native-dialog closing/removal resumes when other pause reasons clear.

Active photographs and preview thumbnails are decoded before being displayed;
preview sources are cached for the current page. Only selected central images
receive full carousel sources. No new photo derivatives or libraries were added.
Timing is configured by the 7000ms timeout in carousel.js and 1000ms opacity
transition in carousel.css. Preview blur is the 16px CSS filter.

## Approved Desktop import

The approved import adds nine named collections and 26 photos. Original files
stay in the Desktop import folder; only generated WebP derivatives are public.
Twelve imports join the existing eligible photo in the randomized showcase pool.
Dates and locations are omitted because they were not confirmed. Collection and
photo display titles are descriptive working titles and can be edited in photos.js.
The empty generic Portraits/Weddings manifest entries are retained as unpublished
placeholders; the populated named collections appear on those category pages.

The optimizer checks the normal originals directory first, then uses the flat
private import folder when a collection source file is absent from the repository.
This folder is remembered in `tools/photo-sources.local.json`, which is ignored
by Git. Do not publish this local settings file or copy originals into public
folders. On this computer the usual command still works:

```powershell
py tools/optimize_photos.py
```

On another computer, point to your own private folder explicitly:

```powershell
py tools/optimize_photos.py --imports-dir "D:\YourPrivatePhotoImports"
```

Flat import filenames must be unique; keep each photo's `file` value identical
to its original filename, including case. The collection `folder` acts as a
logical source key; imported JPEG originals do not need to exist in those public
folders. Generated variants remain under `assets/images/optimized/` and the
generated manifest maps these keys to the optimized URLs. Keep both generated
files and mapping when publishing. An unavailable private source stops an
optimization run without replacing the previous generated manifest.

## 6. Preview and publish with GitHub Desktop

1. In GitHub Desktop, select the `shuttertrends` repository and choose
   **Repository → Show in Explorer**. Edit the configuration and copy your photos.
2. Open `index.html` in your browser for a quick carousel check. Open
   `portraits/index.html`, `events/index.html`, and `weddings/index.html` too.
   GitHub Desktop shows file diffs; it does not render a website preview.
   Existing exported theme assets use live URLs, so an internet connection may
   be needed to reproduce all existing styling and animations locally.
3. For an HTTP preview, use an editor's static-server feature, or, if Python is
   installed, run `py -m http.server 8000 --directory C:\Projects` and visit
   `http://localhost:8000/shuttertrends/`. This also checks the repository subpath.
   A local preview server is optional and is not a production dependency.
4. Check desktop/mobile widths, every photo, captions, buttons and keyboard
   navigation. Confirm filenames match exactly and the browser reports no
   missing images. Changes remain local until you publish them.
5. Review the **Changes** tab in GitHub Desktop. When satisfied, enter a summary
   and choose **Commit to [your branch]**, then **Push origin**. If using a review
   branch, merge it into the configured Pages publishing branch when ready.
6. Confirm the repository's **Settings → Pages** publishing source, and check
   the deployment in **Actions**. Once it succeeds, refresh
   `https://twofacedhalo.github.io/shuttertrends/` (Ctrl+F5 if needed).

Official references: [reviewing and committing in GitHub Desktop](https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop),
[pushing changes](https://docs.github.com/en/desktop/making-changes-in-a-branch/pushing-changes-to-github-from-github-desktop),
and [Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

All new asset URLs resolve beneath `/shuttertrends/` without a hard-coded domain
or server-side code. Keep the folder structure intact. Re-exporting WordPress
pages can overwrite the HTML integrations; preserve/reapply the gallery markup
and script/style links if you perform a fresh export.
