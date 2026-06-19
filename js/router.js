// Router: owns #app, builds the shell, mounts screens & question mechanics,
// runs the timer, handles answer reveal + advancing through SHARK.arc.
SHARK.router = (function () {
  const REVEAL_MS = 2500;
  let appEl = null;

  function app() {
    if (!appEl) appEl = document.getElementById('app');
    return appEl;
  }

  function scorebarHTML() {
    const s = SHARK.state;
    const total = SHARK.arc ? SHARK.arc.length : 10;
    return `<div class="scorebar">
      <span class="pts">${s.points.toLocaleString()} pts</span>
      <span class="qnum">Q${s.questionIndex + 1} of ${total}</span>
      <span class="streak">🔥 ×${s.streak}</span>
    </div>`;
  }

  // --- Full-screen registered screens (onboarding, score) ---
  function showScreen(id, ctx) {
    const def = SHARK.screens[id];
    app().innerHTML = '';
    if (!def) { app().textContent = 'Missing screen: ' + id; return; }
    def.mount(app(), ctx || {});
  }

  function startOnboarding() {
    showScreen('onboarding', { next: function () { startQuiz(); } });
  }

  function startQuiz() {
    // Preserve onboarding answers across the reset; reshuffle the arc on (re)start.
    const onboarding = SHARK.state.onboarding;
    SHARK.state = SHARK.freshState();
    SHARK.state.onboarding = onboarding;
    if (SHARK.buildArc) SHARK.arc = SHARK.buildArc();
    runQuestion();
  }

  // --- Question flow ---
  function runQuestion() {
    const idx = SHARK.state.questionIndex;
    if (!SHARK.arc || idx >= SHARK.arc.length) { return finish(); }

    const entry = SHARK.arc[idx];
    const def = SHARK.mechanics[entry.mechanicId];
    const shark = SHARK.getShark(entry.sharkId);

    if (def && def.fullBleed) return runFullBleed(entry, def, shark);
    return runCard(entry, def, shark);
  }

  function runCard(entry, def, shark) {
    const root = app();
    root.innerHTML = `
      ${scorebarHTML()}
      <div class="browserbar">sharkquiz.github.io</div>
      <div class="stage">
        <div class="captcha-card">
          <div class="card-header">
            <div class="instruction"></div>
            <div class="card-progress"><div class="bar"></div></div>
          </div>
          <div class="card-content"></div>
          <div class="card-caption"></div>
          <div class="card-footer">
            <div class="footer-left">
              <div class="timer-checkbox"><div class="fill"></div><div class="mark"></div></div>
              <span class="footer-label">I'm not a robot</span>
            </div>
            <span class="brand">🦈 SharkCAPTCHA · Privacy · Terms</span>
          </div>
        </div>
      </div>`;

    const card = root.querySelector('.captcha-card');
    const checkbox = root.querySelector('.timer-checkbox');
    const progress = root.querySelector('.card-progress');
    const instruction = root.querySelector('.instruction');
    const caption = root.querySelector('.card-caption');
    const content = root.querySelector('.card-content');

    const timer = SHARK.createTimer(checkbox, progress);
    const totalSeconds = (def && def.timerSeconds) || 0;
    let done = false;

    const ctx = {
      content: content,
      shark: shark,
      difficulty: entry.difficulty || 'med',
      setInstruction: function (t) { instruction.textContent = t; },
      setCaption: function (html) { caption.innerHTML = html || ''; },
      timer: { succeed: function () { timer.succeed(); }, fail: function () { timer.fail(); } },
      complete: function (result) {
        if (done) return;
        done = true;
        const correct = !!(result && result.correct);
        const quality = result && typeof result.quality === 'number' ? result.quality : undefined;
        const pts = SHARK.scoring.computePoints({
          difficulty: ctx.difficulty,
          secondsRemaining: timer.secondsRemaining(),
          totalSeconds: totalSeconds,
          correct: correct,
          quality: quality,
        });
        correct ? timer.succeed() : timer.fail();
        recordAndReveal(card, shark, pts, correct);
      },
    };

    if (!def) {
      instruction.textContent = 'Missing mechanic: ' + entry.mechanicId;
      setTimeout(function () { ctx.complete({ correct: false }); }, 800);
      return;
    }

    def.mount(ctx);
    if (totalSeconds > 0) {
      timer.start(totalSeconds, function () { ctx.complete({ correct: false }); });
    }
  }

  function runFullBleed(entry, def, shark) {
    const root = app();
    root.innerHTML = `
      ${scorebarHTML()}
      <div class="stage fullbleed"><div class="bleed-root" style="flex:1;display:flex;flex-direction:column;width:100%"></div></div>`;
    const bleedRoot = root.querySelector('.bleed-root');
    let done = false;
    const ctx = {
      root: bleedRoot,
      shark: shark,
      difficulty: entry.difficulty || 'med',
      complete: function (result) {
        if (done) return;
        done = true;
        const quality = result && typeof result.quality === 'number' ? result.quality : 0;
        const pts = SHARK.scoring.computePoints({
          difficulty: ctx.difficulty, secondsRemaining: 0, totalSeconds: 0,
          correct: quality > 0, quality: quality,
        });
        // Mini-game advances straight to next question (no card reveal).
        SHARK.state.answers.push({ correct: quality >= 0.5, points: pts, quality: quality });
        if (quality >= 0.5) { SHARK.state.correctCount++; SHARK.state.streak++; SHARK.state.maxStreak = Math.max(SHARK.state.maxStreak, SHARK.state.streak); }
        else { SHARK.state.streak = 0; }
        SHARK.state.points += pts;
        SHARK.state.questionIndex++;
        runQuestion();
      },
    };
    if (!def) { ctx.complete({ quality: 0 }); return; }
    def.mount(ctx);
  }

  function recordAndReveal(card, shark, pts, correct) {
    const s = SHARK.state;
    s.answers.push({ correct: correct, points: pts });
    s.points += pts;
    if (correct) { s.correctCount++; s.streak++; s.maxStreak = Math.max(s.maxStreak, s.streak); }
    else { s.streak = 0; }

    setTimeout(function () {
      SHARK.renderReveal(card, shark, pts, correct);
      setTimeout(function () {
        s.questionIndex++;
        runQuestion();
      }, REVEAL_MS);
    }, 650);
  }

  function finish() {
    showScreen('score', {
      restart: function () { startOnboarding(); },
      shareText: function () {
        const tier = SHARK.tierFor ? SHARK.tierFor(SHARK.state) : 'Shark';
        return `I scored ${SHARK.state.points.toLocaleString()} pts on SharkCAPTCHA and ranked: ${tier} 🦈`;
      },
    });
  }

  return { startOnboarding: startOnboarding, startQuiz: startQuiz, finish: finish };
})();
