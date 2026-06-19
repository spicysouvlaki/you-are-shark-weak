// Q3 — True/False Streak: 5 rapid-fire statements about the whale shark.
// Two big buttons (True / False). One statement at a time; advance on tap.
// Partial credit via quality = numCorrect / 5.
// Calls ctx.complete exactly once after all 5 statements are answered.
(function () {
  const STYLE_ID = 'q-tf-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-tf-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 8px 0 4px;
      }
      .q-tf-progress {
        font: 500 11px var(--font-ui, 'Space Grotesk', sans-serif);
        color: var(--muted, #888);
        letter-spacing: 0.04em;
        align-self: flex-end;
      }
      .q-tf-statement {
        font: 500 15px var(--font-ui, 'Space Grotesk', sans-serif);
        color: var(--ocean-deep, #003049);
        text-align: center;
        min-height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        line-height: 1.4;
      }
      .q-tf-buttons {
        display: flex;
        gap: 10px;
        width: 100%;
      }
      .q-tf-btn {
        flex: 1;
        padding: 14px 0;
        border: none;
        border-radius: 4px;
        font: 700 16px var(--font-ui, 'Space Grotesk', sans-serif);
        cursor: pointer;
        transition: opacity 0.1s, transform 0.1s;
      }
      .q-tf-btn:active {
        transform: scale(0.97);
      }
      .q-tf-btn-true {
        background: var(--captcha-blue, #4A90D9);
        color: #fff;
      }
      .q-tf-btn-false {
        background: var(--wrong-red, #E24B4A);
        color: #fff;
      }
      .q-tf-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
      }
      .q-tf-feedback {
        font: 400 12px var(--font-ui, 'Space Grotesk', sans-serif);
        min-height: 18px;
        text-align: center;
      }
      .q-tf-feedback.correct { color: var(--biolum, #00F5D4); }
      .q-tf-feedback.wrong   { color: var(--wrong-red, #E24B4A); }
      .q-tf-score-dots {
        display: flex;
        gap: 6px;
      }
      .q-tf-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--border-gray, #c8c8c8);
        transition: background 0.2s;
      }
      .q-tf-dot.correct { background: var(--biolum, #00F5D4); }
      .q-tf-dot.wrong   { background: var(--wrong-red, #E24B4A); }
    `;
    document.head.appendChild(el);
  }

  // Real, accurate whale shark facts — mix of true and false.
  // Source-checked against published marine biology literature.
  var STATEMENTS = [
    {
      text: 'The whale shark is the largest fish in the ocean.',
      answer: true,
      explanation: 'Correct — it reaches up to ~18 m and is the largest known fish species.'
    },
    {
      text: 'Whale sharks have teeth they use to chew krill and plankton.',
      answer: false,
      explanation: 'False — they filter-feed using gill rakers; their hundreds of tiny teeth are vestigial and unused.'
    },
    {
      text: 'Whale sharks give birth to live young, not eggs.',
      answer: true,
      explanation: 'Correct — they are ovoviviparous: eggs hatch internally and pups are born live.'
    },
    {
      text: 'Whale sharks are classified as an Endangered species.',
      answer: true,
      explanation: 'Correct — the IUCN lists the whale shark as Endangered due to fishing and vessel strikes.'
    },
    {
      text: 'Whale sharks can swim faster than 50 km/h when hunting.',
      answer: false,
      explanation: 'False — whale sharks are slow swimmers, typically cruising at 3–5 km/h; they do not actively hunt.'
    },
  ];

  SHARK.registerMechanic('truefalse', {
    fullBleed: false,
    timerSeconds: 25,
    mount: function (ctx) {
      injectStyle();

      const whaleShard = ctx.shark || SHARK.getShark('whale');
      ctx.setInstruction('True or False? Rapid-fire whale shark facts.');
      ctx.setCaption(
        whaleShard && whaleShard.credit
          ? 'Whale shark · ' + whaleShard.credit.source + ' · ' + whaleShard.credit.license
          : 'Whale shark · Rhincodon typus'
      );

      // Shuffle statements for replay variety.
      const statements = SHARK.shuffle(STATEMENTS.slice());

      const wrap = document.createElement('div');
      wrap.className = 'q-tf-wrap';

      // Progress indicator (e.g. "1 / 5")
      const progress = document.createElement('div');
      progress.className = 'q-tf-progress';
      wrap.appendChild(progress);

      // Score dots
      const dotsRow = document.createElement('div');
      dotsRow.className = 'q-tf-score-dots';
      var dots = [];
      for (var d = 0; d < 5; d++) {
        var dot = document.createElement('div');
        dot.className = 'q-tf-dot';
        dotsRow.appendChild(dot);
        dots.push(dot);
      }
      wrap.appendChild(dotsRow);

      // Statement text
      const statEl = document.createElement('div');
      statEl.className = 'q-tf-statement';
      wrap.appendChild(statEl);

      // Buttons row
      const btnRow = document.createElement('div');
      btnRow.className = 'q-tf-buttons';

      const trueBtn = document.createElement('button');
      trueBtn.className = 'q-tf-btn q-tf-btn-true';
      trueBtn.textContent = 'True';

      const falseBtn = document.createElement('button');
      falseBtn.className = 'q-tf-btn q-tf-btn-false';
      falseBtn.textContent = 'False';

      btnRow.appendChild(trueBtn);
      btnRow.appendChild(falseBtn);
      wrap.appendChild(btnRow);

      // Feedback line
      const feedback = document.createElement('div');
      feedback.className = 'q-tf-feedback';
      wrap.appendChild(feedback);

      ctx.content.appendChild(wrap);

      var current = 0;
      var numCorrect = 0;
      var done = false;

      function showStatement(idx) {
        progress.textContent = (idx + 1) + ' / ' + statements.length;
        statEl.textContent = statements[idx].text;
        feedback.textContent = '';
        feedback.className = 'q-tf-feedback';
        trueBtn.disabled = false;
        falseBtn.disabled = false;
      }

      function handleAnswer(userAnswer) {
        if (done) return;
        trueBtn.disabled = true;
        falseBtn.disabled = true;

        var stmt = statements[current];
        var correct = (userAnswer === stmt.answer);
        if (correct) numCorrect++;

        // Update dot
        dots[current].classList.add(correct ? 'correct' : 'wrong');

        // Show brief feedback
        feedback.textContent = correct ? ('✓ ' + stmt.explanation) : ('✗ ' + stmt.explanation);
        feedback.className = 'q-tf-feedback ' + (correct ? 'correct' : 'wrong');

        current++;

        if (current >= statements.length) {
          // All answered — complete after a short pause.
          done = true;
          setTimeout(function () {
            var allRight = (numCorrect === statements.length);
            ctx.complete({
              correct: allRight,
              quality: numCorrect / statements.length
            });
          }, 900);
        } else {
          // Advance to next statement after brief feedback display.
          setTimeout(function () {
            showStatement(current);
          }, 700);
        }
      }

      trueBtn.addEventListener('click', function () { handleAnswer(true); });
      falseBtn.addEventListener('click', function () { handleAnswer(false); });

      showStatement(0);
    },
  });
})();
