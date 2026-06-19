// Global namespace + state + registries. Loaded first.
window.SHARK = window.SHARK || {};

SHARK.mechanics = {};
SHARK.screens = {};

SHARK.registerMechanic = function (id, def) { SHARK.mechanics[id] = def; };
SHARK.registerScreen = function (id, def) { SHARK.screens[id] = def; };

SHARK.freshState = function () {
  return {
    points: 0,
    streak: 0,
    maxStreak: 0,
    questionIndex: 0,
    onboarding: { watched: null, love: null },
    answers: [],
    correctCount: 0,
  };
};

SHARK.state = SHARK.freshState();

// Fisher-Yates shuffle helper (shared).
SHARK.shuffle = function (arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Safe shark lookup with a generic fallback.
SHARK.getShark = function (id) {
  const s = (SHARK.sharks && SHARK.sharks[id]) || null;
  if (s) return s;
  return { name: 'Shark', latin: 'Selachimorpha', fact: 'Sharks have existed for over 400 million years.', img: '', emoji: '🦈', credit: {} };
};
