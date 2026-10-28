// PHOTO MANIFEST — see PHOTO-GUIDE.md. Array order controls collection/photo order.
// After adding photos, run: py tools/optimize_photos.py
// Original import paths are private local settings in tools/photo-sources.local.json.
// Only backgroundEligible: true photos can become decorative homepage backgrounds.
window.shutterTrendsCollections = [
  {
    "id": "lynchburg",
    "title": "Lynchburg Through My Lens",
    "description": "A personal perspective on the places and moments close to home.",
    "category": "lynchburg",
    "folder": "featured",
    "published": true,
    "photos": []
  },
  {
    "id": "concerts",
    "title": "Concerts",
    "description": "Live music, shared energy, and moments on stage.",
    "category": "concerts",
    "folder": "events",
    "published": true,
    "photos": [
      {
        "id": "501-01",
        "file": "501.01.jpg",
        "alt": "Musicians performing outdoors under a canopy with an upright bass, guitars, and microphones.",
        "title": "Live performance",
        "width": 2000,
        "height": 1333,
        "showcase": true
      }
    ]
  },
  {
    "id": "portraits",
    "title": "Portraits",
    "description": "Personality, expression, and atmosphere.",
    "category": "portraits",
    "folder": "portraits",
    "published": false,
    "photos": []
  },
  {
    "id": "weddings",
    "title": "Weddings",
    "description": "The people, connections, and details of a wedding day.",
    "category": "weddings",
    "folder": "weddings",
    "published": false,
    "photos": []
  },
  {
    "id": "graduation-day",
    "title": "Graduation Day",
    "description": "A graduation-day portrait full of color and celebration.",
    "category": "portraits",
    "folder": "graduation-day",
    "published": true,
    "photos": [
      {
        "id": "import-img-1058",
        "file": "IMG_1058.jpg",
        "title": "Graduation Day",
        "alt": "A smiling graduate wearing a cap, gown, and flower leis among a crowd outdoors.",
        "width": 6000,
        "height": 4000,
        "showcase": true
      }
    ]
  },
  {
    "id": "graduation-portraits",
    "title": "Graduation Portraits & Companions",
    "description": "A graduation session on the lawn, with a much-loved companion.",
    "category": "portraits",
    "folder": "graduation-portraits",
    "published": true,
    "photos": [
      {
        "id": "import-img-2926",
        "file": "IMG_2926.jpg",
        "title": "Across the Lawn",
        "alt": "A graduate in a blue gown walks across a lawn toward a leafy tree.",
        "width": 3053,
        "height": 4580,
        "showcase": false,
        "backgroundEligible": true
      },
      {
        "id": "import-img-2943",
        "file": "IMG_2943.jpg",
        "title": "The Next Chapter",
        "alt": "A graduate raises a decorated cap beside a brick building.",
        "width": 3087,
        "height": 4631,
        "showcase": true
      },
      {
        "id": "import-img-2990",
        "file": "IMG_2990.jpg",
        "title": "A Quiet Companion",
        "alt": "A graduate in a blue gown leans toward a dog while seated on a lawn.",
        "width": 2850,
        "height": 4275,
        "showcase": false
      },
      {
        "id": "import-img-3013",
        "file": "IMG_3013.jpg",
        "title": "A Proud Pair",
        "alt": "A smiling graduate holds a dog dressed in a small graduation outfit outdoors.",
        "width": 3126,
        "height": 4689,
        "showcase": true
      },
      {
        "id": "import-img-3105",
        "file": "IMG_3105.jpg",
        "title": "Together on Graduation Day",
        "alt": "Two people lean toward a dog held between them on a grassy lawn.",
        "width": 4621,
        "height": 3081,
        "showcase": true
      }
    ]
  },
  {
    "id": "candid-portraits",
    "title": "People & Everyday Moments",
    "description": "Candid expressions, conversations, and quiet moments.",
    "category": "portraits",
    "folder": "candid-portraits",
    "published": true,
    "photos": [
      {
        "id": "import-img-1275",
        "file": "IMG_1275.jpg",
        "title": "An Afternoon Together",
        "alt": "Two people standing together on a sidewalk beside a brick building.",
        "width": 6000,
        "height": 4000,
        "showcase": false
      },
      {
        "id": "import-img-1290",
        "file": "IMG_1290.jpg",
        "title": "In Conversation",
        "alt": "Two people talking indoors beside a painting and a table.",
        "width": 6000,
        "height": 4000,
        "showcase": false
      },
      {
        "id": "import-img-1293",
        "file": "IMG_1293.jpg",
        "title": "A Candid Moment",
        "alt": "A seated person wearing a baseball cap smiles during an indoor gathering.",
        "width": 5710,
        "height": 3807,
        "showcase": false
      },
      {
        "id": "import-img-1295",
        "file": "IMG_1295.jpg",
        "title": "At the Gathering",
        "alt": "A person leaning against a wall at an indoor gathering, with seated guests behind.",
        "width": 6000,
        "height": 4000,
        "showcase": false
      },
      {
        "id": "import-img-1318",
        "file": "IMG_1318.jpg",
        "title": "Among the Flowers",
        "alt": "A person in profile beside yellow flowers and leafy branches near a window.",
        "width": 6000,
        "height": 4000,
        "showcase": true,
        "backgroundEligible": true
      },
      {
        "id": "import-img-1517",
        "file": "IMG_1517.jpg",
        "title": "By Candlelight",
        "alt": "A person seated at a table looks to the side in a dim, warmly lit interior.",
        "width": 6000,
        "height": 4000,
        "showcase": true,
        "backgroundEligible": true
      }
    ]
  },
  {
    "id": "community-atrium",
    "title": "Community Gathering — Atrium",
    "description": "People coming together in a bright atrium.",
    "category": "events",
    "folder": "community-atrium",
    "published": true,
    "photos": [
      {
        "id": "import-img-1769",
        "file": "IMG_1769.jpg",
        "title": "Community Connections",
        "alt": "People interacting with red-shirted event staff in a bright brick-walled atrium.",
        "width": 6000,
        "height": 4000,
        "showcase": false
      },
      {
        "id": "import-img-1783",
        "file": "IMG_1783.jpg",
        "title": "An Atrium Gathering",
        "alt": "A wide view of an atrium with people, reclining chairs, and event tables.",
        "width": 6000,
        "height": 4000,
        "showcase": false
      }
    ]
  },
  {
    "id": "celebration-at-home",
    "title": "Celebration at Home",
    "description": "Warm light, shared company, and a tray of cupcakes.",
    "category": "events",
    "folder": "celebration-at-home",
    "published": true,
    "photos": [
      {
        "id": "import-img-2087",
        "file": "IMG_2087.jpg",
        "title": "A Celebration at Home",
        "alt": "A smiling person holds a tray of cupcakes during an indoor gathering.",
        "width": 6000,
        "height": 4000,
        "showcase": false
      },
      {
        "id": "import-img-2108",
        "file": "IMG_2108.jpg",
        "title": "Evening Company",
        "alt": "Two people look toward the camera in a warmly lit room during a gathering.",
        "width": 6000,
        "height": 4000,
        "showcase": false
      }
    ]
  },
  {
    "id": "outdoor-concert-1",
    "title": "Outdoor Concert — Set 1",
    "description": "Live music under an outdoor canopy, from stage to audience.",
    "category": "concerts",
    "folder": "outdoor-concert-1",
    "published": true,
    "photos": [
      {
        "id": "import-img-3355",
        "file": "IMG_3355.jpg",
        "title": "Music Under the Canopy",
        "alt": "Musicians with guitars and an upright bass perform on a covered outdoor stage.",
        "width": 5061,
        "height": 3374,
        "showcase": true,
        "backgroundEligible": true
      },
      {
        "id": "import-img-3415",
        "file": "IMG_3415.jpg",
        "title": "On Stage",
        "alt": "An upright bassist and a guitarist perform beside microphones under an outdoor canopy.",
        "width": 4000,
        "height": 6000,
        "showcase": true
      },
      {
        "id": "import-img-3456",
        "file": "IMG_3456.jpg",
        "title": "From the Audience",
        "alt": "Audience members watch musicians performing under a canopy from a picnic table.",
        "width": 4330,
        "height": 2887,
        "showcase": false
      }
    ]
  },
  {
    "id": "purple-stage",
    "title": "Purple Stage — Live Music",
    "description": "Performers and audience silhouettes under purple lights.",
    "category": "concerts",
    "folder": "purple-stage",
    "published": true,
    "photos": [
      {
        "id": "import-img-3880",
        "file": "IMG_3880.jpg",
        "title": "Purple Stage",
        "alt": "A band performs under purple lighting with audience silhouettes in the foreground.",
        "width": 4734,
        "height": 3156,
        "showcase": false
      },
      {
        "id": "import-img-3883",
        "file": "IMG_3883.jpg",
        "title": "Across the Stage",
        "alt": "A panoramic view of a band under purple stage lights and dark audience silhouettes.",
        "width": 5854,
        "height": 1849,
        "showcase": true,
        "backgroundEligible": true
      },
      {
        "id": "import-img-4035",
        "file": "IMG_4035.jpg",
        "title": "At the Microphone",
        "alt": "A vocalist holds a microphone while performing under purple lighting.",
        "width": 3236,
        "height": 4854,
        "showcase": false
      }
    ]
  },
  {
    "id": "street-side-live-music",
    "title": "Street-Side Live Music",
    "description": "Musicians performing among brick buildings and passing street life.",
    "category": "concerts",
    "folder": "street-side-live-music",
    "published": true,
    "photos": [
      {
        "id": "import-img-4408",
        "file": "IMG_4408.jpg",
        "title": "Keeping Time",
        "alt": "A guitarist and drummer perform outdoors beside brick buildings.",
        "width": 2429,
        "height": 3239,
        "showcase": false
      },
      {
        "id": "import-img-4409",
        "file": "IMG_4409.jpg",
        "title": "Street-Side Sound",
        "alt": "A panoramic view of musicians performing outdoors on a street beside brick buildings.",
        "width": 5244,
        "height": 1656,
        "showcase": true
      }
    ]
  },
  {
    "id": "wedding-portraits",
    "title": "Wedding Portraits",
    "description": "Quiet wedding portraits in the evening light.",
    "category": "weddings",
    "folder": "wedding-portraits",
    "published": true,
    "photos": [
      {
        "id": "import-img-6390",
        "file": "IMG_6390.jpg",
        "title": "A Shared Moment",
        "alt": "A couple in wedding attire lean their foreheads together in a garden at sunset.",
        "width": 6000,
        "height": 4000,
        "showcase": true
      },
      {
        "id": "import-img-6412",
        "file": "IMG_6412.jpg",
        "title": "In the Evening Light",
        "alt": "A person in a wedding gown sits on a wooden railing overlooking a lawn at sunset.",
        "width": 4000,
        "height": 6000,
        "showcase": true,
        "backgroundEligible": true
      }
    ]
  }
];
