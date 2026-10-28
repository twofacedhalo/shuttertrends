// Public configuration only. Never put API keys or passwords here.
window.shutterTrendConfig = {
  homepageCarousel: { allowedCategories: ['weddings', 'events', 'concerts', 'personal-events', 'lynchburg'] }, // Weddings and events only; backgrounds remain independent.
  contact: {
    email: 'douglasrendlesiii@gmail.com',
    formEndpoint: 'https://formspree.io/f/xbggyrpq' // Owner-provided public form endpoint; notifications are configured in Formspree.
  },
  instagram: {
    profileUrl: 'https://www.instagram.com/shuttertrend/',
    // Curated website photographs, not a live Instagram feed.
    items: [
      { photoId: 'import-img-3355', postUrl: '' },
      { photoId: 'import-img-3013', postUrl: '' },
      { photoId: 'import-img-6412', postUrl: '' },
      { photoId: 'import-img-3105', postUrl: '' },
      { photoId: 'import-img-1318', postUrl: '' }
    ]
  },
  navigation: {
    portraits: [
      { title: 'Portraits & Lifestyle', collectionId: 'candid-portraits', photoId: 'import-img-1318' },
      { title: 'Graduations', collectionId: 'graduation-portraits', photoId: 'import-img-3013' },
      { title: 'Weddings', collectionId: 'wedding-portraits', photoId: 'import-img-6412' }
    ],
    events: [
      { title: 'Community Gatherings', collectionId: 'community-atrium', photoId: 'import-img-1769' },
      { title: 'Concerts', collectionId: 'outdoor-concert-1', photoId: 'import-img-3355' },
      { title: 'Celebrations', collectionId: 'celebration-at-home', photoId: 'import-img-2087' },
      { title: 'Outdoor Gatherings', collectionId: 'outdoor-gathering' }
    ]
  }
};
