// Q6 — Spot the Fake: "One of these tiger shark facts is a lie. Tap it."
// Shows 3 statements about the tiger shark; 2 are true, 1 is plausible-but-false.
// Correct = user taps the lie.
(function () {
  const STYLE_ID = 'q-fake-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-fake-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }
      .q-fake-card {
        background: var(--chrome-gray, #f0f0f0);
        border: 1.5px solid var(--border-gray, #c8c8c8);
        border-radius: 6px;
        padding: 12px 14px;
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        font-size: 13px;
        color: #222;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
        line-height: 1.45;
        user-select: none;
        -webkit-user-select: none;
      }
      .q-fake-card:hover:not(.q-fake-locked) {
        border-color: var(--captcha-blue, #4A90D9);
        background: #e6f0fb;
      }
      .q-fake-card.q-fake-selected {
        border-color: var(--captcha-blue, #4A90D9);
        background: #deeefb;
      }
      .q-fake-card.q-fake-correct-reveal {
        border-color: var(--biolum, #00F5D4);
        background: var(--ocean-deep, #003049);
        color: var(--biolum, #00F5D4);
        font-weight: 500;
      }
      .q-fake-card.q-fake-wrong-reveal {
        border-color: var(--wrong-red, #E24B4A);
        background: #fdf0f0;
        color: var(--wrong-red, #E24B4A);
      }
      .q-fake-badge {
        display: inline-block;
        font-size: 10px;
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-left: 6px;
        padding: 1px 5px;
        border-radius: 3px;
        vertical-align: middle;
      }
      .q-fake-badge-lie {
        background: var(--wrong-red, #E24B4A);
        color: #fff;
      }
      .q-fake-badge-true {
        background: var(--biolum, #00F5D4);
        color: var(--ocean-deep, #003049);
      }
      .q-fake-list.q-fake-locked .q-fake-card {
        cursor: default;
        pointer-events: none;
      }
    `;
    document.head.appendChild(el);
  }

  // Tiger shark facts: 2 true, 1 plausible-but-false lie.
  // The lie is index 1 (tiger sharks do NOT have the strongest bite of all sharks —
  // that title belongs to the bull shark by some measures, or great white by others,
  // not the tiger). We mark it so the mechanic knows which to flag.
  var STATEMENTS = [
    {
      text: 'Tiger sharks are one of the few shark species known to attack humans unprovoked, second only to great white sharks in recorded bites.',
      isLie: false
    },
    {
      text: 'Tiger sharks have the strongest bite force of any shark species — their jaws can exert over 3 tonnes of pressure per square centimetre.',
      isLie: true   // LIE: that extreme figure belongs to no shark; bull & great white compete for strongest recorded bite; tiger is powerful but not the record holder
    },
    {
      text: 'Young tiger sharks have distinct dark stripe markings that fade as the shark matures into adulthood.',
      isLie: false
    }
  ];

  SHARK.registerMechanic('spotfake', {
    fullBleed: false,
    timerSeconds: 20,
    mount: function (ctx) {
      injectStyle();
      ctx.setInstruction('One of these tiger shark facts is a lie. Tap the lie.');
      ctx.setCaption('Tiger shark · <em>Galeocerdo cuvier</em>');

      var done = false;
      // Shuffle display order but preserve isLie flag
      var shuffled = SHARK.shuffle(STATEMENTS.slice());

      var list = document.createElement('div');
      list.className = 'q-fake-list';

      shuffled.forEach(function (stmt) {
        var card = document.createElement('div');
        card.className = 'q-fake-card';
        card.textContent = stmt.text;

        card.addEventListener('click', function () {
          if (done) return;
          done = true;
          list.classList.add('q-fake-locked');

          var correct = stmt.isLie; // correct = user tapped the lie

          // Reveal all cards
          Array.prototype.forEach.call(list.children, function (c) {
            var s = c._stmt;
            if (s.isLie) {
              c.classList.add('q-fake-correct-reveal');
              var badge = document.createElement('span');
              badge.className = 'q-fake-badge q-fake-badge-lie';
              badge.textContent = 'LIE';
              c.appendChild(badge);
            } else {
              c.classList.add('q-fake-wrong-reveal'); // style as "true fact" dimmed
              var badge2 = document.createElement('span');
              badge2.className = 'q-fake-badge q-fake-badge-true';
              badge2.textContent = 'TRUE';
              c.appendChild(badge2);
              // Override the wrong-reveal color for true cards — use neutral instead
              c.style.borderColor = 'var(--border-gray, #c8c8c8)';
              c.style.background = '#f7f7f7';
              c.style.color = '#555';
            }
          });

          ctx.complete({ correct: correct });
        });

        card._stmt = stmt;
        list.appendChild(card);
      });

      ctx.content.appendChild(list);
    }
  });
})();
