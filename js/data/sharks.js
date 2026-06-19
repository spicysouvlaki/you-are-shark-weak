// Shark dataset. STARTER DATA — the data agent replaces image paths + fills credit{}
// with real iNaturalist CC-licensed photos in /assets/sharks/. Keyed by id (see CONTRACT.md).
// Facts/latin/depth/length are real and may be kept as-is.
SHARK.sharks = {
  'hammerhead': {
    name: 'Scalloped Hammerhead', latin: 'Sphyrna lewini',
    fact: 'Its wide cephalofoil head is packed with electroreceptors that detect prey buried in sand.',
    img: 'assets/sharks/hammerhead.jpg', emoji: '🦈',
    maxDepthM: 512, maxLengthM: 4.3, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'nurse': {
    name: 'Nurse Shark', latin: 'Ginglymostoma cirratum',
    fact: 'Nurse sharks are slow bottom-dwellers that can pump water over their gills to breathe while resting.',
    img: 'assets/sharks/nurse.jpg', emoji: '🦈',
    maxDepthM: 130, maxLengthM: 3.0, habitat: 'reef',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'whale': {
    name: 'Whale Shark', latin: 'Rhincodon typus',
    fact: 'The largest fish alive, the whale shark is a gentle filter-feeder eating plankton and small fish.',
    img: 'assets/sharks/whale.jpg', emoji: '🐋',
    maxDepthM: 1928, maxLengthM: 18.8, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'blacktip': {
    name: 'Blacktip Reef Shark', latin: 'Carcharhinus melanopterus',
    fact: 'Named for the black tips on its fins, it patrols shallow reef flats often with its dorsal fin exposed.',
    img: 'assets/sharks/blacktip.jpg', emoji: '🦈',
    maxDepthM: 75, maxLengthM: 2.0, habitat: 'reef',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'oceanic-whitetip': {
    name: 'Oceanic Whitetip', latin: 'Carcharhinus longimanus',
    fact: 'A bold open-ocean roamer with rounded white-tipped fins, once among the most abundant large animals on Earth.',
    img: 'assets/sharks/oceanic-whitetip.jpg', emoji: '🦈',
    maxDepthM: 230, maxLengthM: 4.0, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'tiger': {
    name: 'Tiger Shark', latin: 'Galeocerdo cuvier',
    fact: 'Known as the ocean\'s garbage can, tiger sharks eat almost anything and lose their stripes with age.',
    img: 'assets/sharks/tiger.jpg', emoji: '🦈',
    maxDepthM: 1136, maxLengthM: 5.5, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'thresher': {
    name: 'Thresher Shark', latin: 'Alopias vulpinus',
    fact: 'Its tail can be as long as its body and is whipped like a weapon to stun schooling fish.',
    img: 'assets/sharks/thresher.jpg', emoji: '🦈',
    maxDepthM: 650, maxLengthM: 6.1, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'goblin': {
    name: 'Goblin Shark', latin: 'Mitsukurina owstoni',
    fact: 'A deep-sea living fossil with translucent skin and jaws that shoot forward to snatch prey.',
    img: 'assets/sharks/goblin.jpg', emoji: '🦈',
    maxDepthM: 1300, maxLengthM: 3.8, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'great-white': {
    name: 'Great White Shark', latin: 'Carcharodon carcharias',
    fact: 'It can breach clear out of the water at over 40 km/h when ambushing seals from below.',
    img: 'assets/sharks/great-white.jpg', emoji: '🦈',
    maxDepthM: 1200, maxLengthM: 6.1, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'bull': {
    name: 'Bull Shark', latin: 'Carcharhinus leucas',
    fact: 'Bull sharks tolerate fresh water and have been found hundreds of kilometres up rivers.',
    img: 'assets/sharks/bull.jpg', emoji: '🦈',
    maxDepthM: 152, maxLengthM: 3.5, habitat: 'reef',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'mako': {
    name: 'Shortfin Mako', latin: 'Isurus oxyrinchus',
    fact: 'The fastest shark in the ocean, the mako can burst to around 70 km/h.',
    img: 'assets/sharks/mako.jpg', emoji: '🦈',
    maxDepthM: 750, maxLengthM: 4.0, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'lemon': {
    name: 'Lemon Shark', latin: 'Negaprion brevirostris',
    fact: 'Its yellowish skin camouflages it over sandy seafloors; it returns to the same nurseries to breed.',
    img: 'assets/sharks/lemon.jpg', emoji: '🦈',
    maxDepthM: 92, maxLengthM: 3.4, habitat: 'reef',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'reef': {
    name: 'Caribbean Reef Shark', latin: 'Carcharhinus perezi',
    fact: 'A common reef predator that can rest motionless on the bottom, unusual for a requiem shark.',
    img: 'assets/sharks/reef.jpg', emoji: '🦈',
    maxDepthM: 378, maxLengthM: 3.0, habitat: 'reef',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  },
  'basking': {
    name: 'Basking Shark', latin: 'Cetorhinus maximus',
    fact: 'The second-largest fish, it filter-feeds with a cavernous open mouth while cruising near the surface.',
    img: 'assets/sharks/basking.jpg', emoji: '🦈',
    maxDepthM: 1264, maxLengthM: 12.0, habitat: 'open-ocean',
    credit: { creator: '', source: 'iNaturalist', license: 'CC BY-NC', url: '' }
  }
};
