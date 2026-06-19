// Bootstraps the app: builds the question arc and starts onboarding.
// Loaded last (after all mechanics & screens have registered).
(function () {
  // Canonical arc from SPEC. Mini-game is pinned to slot 5 (index 4).
  const CANON = [
    { mechanicId: 'tiles',       sharkId: 'hammerhead',       difficulty: 'easy' },
    { mechanicId: 'oddoneout',   sharkId: 'nurse',            difficulty: 'easy' },
    { mechanicId: 'truefalse',   sharkId: 'whale',            difficulty: 'med'  },
    { mechanicId: 'sort',        sharkId: 'oceanic-whitetip', difficulty: 'med'  },
    { mechanicId: 'minigame',    sharkId: 'whale',            difficulty: 'med'  },
    { mechanicId: 'spotfake',    sharkId: 'tiger',            difficulty: 'med'  },
    { mechanicId: 'shadow',      sharkId: 'thresher',         difficulty: 'hard' },
    { mechanicId: 'rank',        sharkId: 'great-white',      difficulty: 'med'  },
    { mechanicId: 'hotcold',     sharkId: 'goblin',           difficulty: 'hard' },
    { mechanicId: 'elimination', sharkId: 'great-white',      difficulty: 'hard' },
  ];

  function buildArc() {
    // Shuffle the non-mini-game questions for replay variety while pinning the
    // mini-game to slot 5 and never repeating a mechanic back-to-back.
    const minigame = CANON[4];
    const others = SHARK.shuffle(CANON.filter(function (q) { return q.mechanicId !== 'minigame'; }));
    const arc = [];
    let oi = 0;
    for (let i = 0; i < 10; i++) {
      if (i === 4) { arc.push(minigame); continue; }
      arc.push(others[oi++]);
    }
    // guard against accidental adjacency (all unique here, so this is belt-and-suspenders)
    for (let i = 1; i < arc.length; i++) {
      if (arc[i].mechanicId === arc[i - 1].mechanicId && i !== 4 && i - 1 !== 4) {
        for (let j = i + 1; j < arc.length; j++) {
          if (j !== 4 && arc[j].mechanicId !== arc[i - 1].mechanicId) {
            const t = arc[i]; arc[i] = arc[j]; arc[j] = t; break;
          }
        }
      }
    }
    return arc;
  }

  SHARK.buildArc = buildArc;

  function boot() {
    SHARK.arc = buildArc();
    SHARK.router.startOnboarding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
