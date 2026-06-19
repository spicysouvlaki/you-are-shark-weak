// Central scoring. Mechanics never compute points — the router calls this.
SHARK.scoring = (function () {
  const BASE = { easy: 500, med: 700, hard: 1000 };

  // opts: { difficulty, secondsRemaining, totalSeconds, correct, quality }
  function computePoints(opts) {
    const base = BASE[opts.difficulty] || 700;
    // quality defaults to 1 when correct, 0 when wrong.
    let quality = (typeof opts.quality === 'number') ? opts.quality : (opts.correct ? 1 : 0);
    quality = Math.max(0, Math.min(1, quality));
    if (quality <= 0) return 0;

    let timeFrac = 0;
    if (opts.totalSeconds > 0 && typeof opts.secondsRemaining === 'number') {
      timeFrac = Math.max(0, Math.min(1, opts.secondsRemaining / opts.totalSeconds));
    }
    const timeBonus = base * 0.5 * timeFrac;
    return Math.round((base + timeBonus) * quality);
  }

  return { computePoints, BASE };
})();
