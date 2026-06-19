// Shark dataset. Keyed by id (see CONTRACT.md).
// Images downloaded to /assets/sharks/ — CC-licensed photos from Wikimedia Commons.
// credit{} filled with real attribution for every downloaded image.
SHARK.sharks = {
  'hammerhead': {
    name: 'Scalloped Hammerhead', latin: 'Sphyrna lewini',
    fact: 'Its wide cephalofoil head is packed with electroreceptors that detect prey buried in sand.',
    img: 'assets/sharks/hammerhead.jpg', emoji: '🦈',
    maxDepthM: 512, maxLengthM: 4.3, habitat: 'open-ocean',
    credit: {
      creator: 'Kris Mikael Krister',
      source: 'Wikimedia Commons',
      license: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Scalloped_Hammerhead_Shark_Sphyrna_Lewini_(226845659).jpeg'
    }
  },
  'nurse': {
    name: 'Nurse Shark', latin: 'Ginglymostoma cirratum',
    fact: 'Nurse sharks are slow bottom-dwellers that can pump water over their gills to breathe while resting.',
    img: 'assets/sharks/nurse.jpg', emoji: '🦈',
    maxDepthM: 130, maxLengthM: 3.0, habitat: 'reef',
    credit: {
      creator: '',
      source: 'Wikimedia Commons',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Nurse_shark.jpg'
    }
  },
  'whale': {
    name: 'Whale Shark', latin: 'Rhincodon typus',
    fact: 'The largest fish alive, the whale shark is a gentle filter-feeder eating plankton and small fish.',
    img: 'assets/sharks/whale.jpg', emoji: '🐋',
    maxDepthM: 1928, maxLengthM: 18.8, habitat: 'open-ocean',
    credit: {
      creator: 'Abe Khao Lak',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Similan_Dive_Center_-_great_whale_shark.jpg'
    }
  },
  'blacktip': {
    name: 'Blacktip Reef Shark', latin: 'Carcharhinus melanopterus',
    fact: 'Named for the black tips on its fins, it patrols shallow reef flats often with its dorsal fin exposed.',
    img: 'assets/sharks/blacktip.jpg', emoji: '🦈',
    maxDepthM: 75, maxLengthM: 2.0, habitat: 'reef',
    credit: {
      creator: 'Charles J. Sharp',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Blacktip_reef_shark_(Carcharhinus_melanopterus)_Moorea.jpg'
    }
  },
  'oceanic-whitetip': {
    name: 'Oceanic Whitetip', latin: 'Carcharhinus longimanus',
    fact: 'A bold open-ocean roamer with rounded white-tipped fins, once among the most abundant large animals on Earth.',
    img: 'assets/sharks/oceanic-whitetip.jpg', emoji: '🦈',
    maxDepthM: 230, maxLengthM: 4.0, habitat: 'open-ocean',
    credit: {
      creator: 'Johan Lantz',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Oceanic_Whitetip_Shark_(cropped).jpg'
    }
  },
  'tiger': {
    name: 'Tiger Shark', latin: 'Galeocerdo cuvier',
    fact: 'Known as the ocean\'s garbage can, tiger sharks eat almost anything and lose their stripes with age.',
    img: 'assets/sharks/tiger.jpg', emoji: '🦈',
    maxDepthM: 1136, maxLengthM: 5.5, habitat: 'open-ocean',
    credit: {
      creator: 'Albert kok',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Tiger_shark.jpg'
    }
  },
  'thresher': {
    name: 'Thresher Shark', latin: 'Alopias vulpinus',
    fact: 'Its tail can be as long as its body and is whipped like a weapon to stun schooling fish.',
    img: 'assets/sharks/thresher.jpg', emoji: '🦈',
    maxDepthM: 650, maxLengthM: 6.1, habitat: 'open-ocean',
    credit: {
      creator: 'NOAA/PIER',
      source: 'Wikimedia Commons',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Alopias_vulpinus_noaa2.jpg'
    }
  },
  'goblin': {
    name: 'Goblin Shark', latin: 'Mitsukurina owstoni',
    fact: 'A deep-sea living fossil with translucent skin and jaws that shoot forward to snatch prey.',
    img: 'assets/sharks/goblin.jpg', emoji: '🦈',
    maxDepthM: 1300, maxLengthM: 3.8, habitat: 'open-ocean',
    credit: {
      creator: 'Hungarian Snow',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Goblin_shark_snout.jpg'
    }
  },
  'great-white': {
    name: 'Great White Shark', latin: 'Carcharodon carcharias',
    fact: 'It can breach clear out of the water at over 40 km/h when ambushing seals from below.',
    img: 'assets/sharks/great-white.jpg', emoji: '🦈',
    maxDepthM: 1200, maxLengthM: 6.1, habitat: 'open-ocean',
    credit: {
      creator: 'Pterantula (Terry Goss)',
      source: 'Wikimedia Commons',
      license: 'CC BY 2.5',
      url: 'https://commons.wikimedia.org/wiki/File:White_shark.jpg'
    }
  },
  'bull': {
    name: 'Bull Shark', latin: 'Carcharhinus leucas',
    fact: 'Bull sharks tolerate fresh water and have been found hundreds of kilometres up rivers.',
    img: 'assets/sharks/bull.jpg', emoji: '🦈',
    maxDepthM: 152, maxLengthM: 3.5, habitat: 'reef',
    credit: {
      creator: 'Albert Kok',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Bull_shark_(2007).jpg'
    }
  },
  'mako': {
    name: 'Shortfin Mako', latin: 'Isurus oxyrinchus',
    fact: 'The fastest shark in the ocean, the mako can burst to around 70 km/h.',
    img: 'assets/sharks/mako.jpg', emoji: '🦈',
    maxDepthM: 750, maxLengthM: 4.0, habitat: 'open-ocean',
    credit: {
      creator: 'Mark Conlin, SWFSC Large Pelagics Program',
      source: 'Wikimedia Commons',
      license: 'Public domain',
      url: 'https://commons.wikimedia.org/wiki/File:Isurus_oxyrinchus_by_mark_conlin.jpg'
    }
  },
  'lemon': {
    name: 'Lemon Shark', latin: 'Negaprion brevirostris',
    fact: 'Its yellowish skin camouflages it over sandy seafloors; it returns to the same nurseries to breed.',
    img: 'assets/sharks/lemon.jpg', emoji: '🦈',
    maxDepthM: 92, maxLengthM: 3.4, habitat: 'reef',
    credit: {
      creator: 'Albert kok',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Lemon_shark2.jpg'
    }
  },
  'reef': {
    name: 'Caribbean Reef Shark', latin: 'Carcharhinus perezi',
    fact: 'A common reef predator that can rest motionless on the bottom, unusual for a requiem shark.',
    img: 'assets/sharks/reef.jpg', emoji: '🦈',
    maxDepthM: 378, maxLengthM: 3.0, habitat: 'reef',
    credit: {
      creator: 'Albert kok',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Caribbean_reef_shark.jpg'
    }
  },
  'basking': {
    name: 'Basking Shark', latin: 'Cetorhinus maximus',
    fact: 'The second-largest fish, it filter-feeds with a cavernous open mouth while cruising near the surface.',
    img: 'assets/sharks/basking.jpg', emoji: '🦈',
    maxDepthM: 1264, maxLengthM: 12.0, habitat: 'open-ocean',
    credit: {
      creator: 'candiche',
      source: 'Wikimedia Commons',
      license: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Basking_Shark_in_Cornwall.jpg'
    }
  }
};
