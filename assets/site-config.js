// Public configuration only. Never put API keys or passwords here.
window.shutterTrendConfig = {
  stories: { homepageLimit: 4, featured: ['warm-studio', 'cap-in-the-air', 'wedding-day-portraits', 'across-the-lawn'] },
  filmReel: { autoplaySpeed: 22, cursorMaxSpeed: 150, cursorCrawlSpeed: 3, velocityEaseSeconds: .6, edgeEaseDistance: 100 },
  seasonalEffects: {
    decorativeLeaves: { enabled: true, desktopCount: 7, mobileCount: 3, size: 1, radius: 220 },
    autumnLeaves: {
      enabled: true, // Manual seasonal switch; independent of the calendar.
      maxLeaves: 8, mobileMaxLeaves: 3,
      opacity: [0.30, 0.55],
      spawnIntervalMs: [5000, 10000]
    }
  },
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
      { title: 'Personal Moments', page: 'portraits' },
      { title: 'Graduations', page: 'graduations' },
      { title: 'Weddings', page: 'weddings' }
    ],
    events: [
      { title: 'Community Gatherings', collectionId: 'community-atrium', photoId: 'import-img-1769' },
      { title: 'Concerts', collectionId: 'outdoor-concert-1', photoId: 'import-img-3355' },
      { title: 'Celebrations', collectionId: 'celebration-at-home', photoId: 'import-img-2087' },
      { title: 'Outdoor Gatherings', collectionId: 'outdoor-gathering' }
    ]
  }
};
