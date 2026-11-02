# Photography setup

See ../../PHOTO-GUIDE.md. Edit photos.js to manage named collections and photos.
collections.js validates the manifest and selects the homepage showcase once per
page load. Carousel and gallery code consumes that data. Put image files in
../images/<collection-folder>/, never in this scripts folder.

## Dedicated collection entries

A collection may set `previewMode: "collection"` to use the existing 35mm card as a direct collection-page link rather than a Photo Story preview. `coverPhotoId` selects the card image independently of the gallery viewing order. The optional fields do not affect other collections.

`an-afternoon-together` reuses the `candid-portraits` image folder and optimized keys. Its 21 references were moved from `candid-portraits`; no image files were moved, copied or edited. The original numeric viewing order, photo IDs, metadata and derivatives remain intact. IMG_3122 is the cover. Graduation collections and the IMG_3105 homepage cover are unchanged. Curated Photo Stories continue to resolve the same global photo IDs.
