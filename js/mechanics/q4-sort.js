// Q4 — Sort & Classify: assign ~5 shark cards to "Reef" or "Open Ocean".
// Ground truth is shark.habitat ('reef' | 'open-ocean').
// A "Verify" button completes; quality = fraction placed correctly.
// Calls ctx.complete exactly once, then locks input.
(function () {
  const STYLE_ID = 'q-sort-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-sort-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 6px 0 2px;
      }
      .q-sort-cards {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;
      }
      .q-sort-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        width: 72px;
        cursor: pointer;
        border-radius: 4px;
        padding: 4px;
        border: 2px solid var(--border-gray, #c8c8c8);
        background: var(--card-white, #fff);
        transition: border-color 0.15s, background 0.15s;
        user-select: none;
      }
      .q-sort-card.q-sort-reef {
        border-color: var(--captcha-blue, #4A90D9);
        background: rgba(74, 144, 217, 0.08);
      }
      .q-sort-card.q-sort-ocean {
        border-color: var(--ocean-deep, #003049);
        background: rgba(0, 48, 73, 0.07);
      }
      .q-sort-card.q-sort-locked {
        pointer-events: none;
      }
      .q-sort-card.q-sort-correct-reef,
      .q-sort-card.q-sort-correct-ocean {
        border-color: var(--biolum, #00F5D4);
      }
      .q-sort-card.q-sort-incorrect {
        border-color: var(--wrong-red, #E24B4A);
      }
      .q-sort-thumb {
        width: 56px;
        height: 42px;
        border-radius: 3px;
        object-fit: cover;
        background: #d0dce6;
        display: block;
      }
      .q-sort-thumb-fallback {
        width: 56px;
        height: 42px;
        border-radius: 3px;
        background: #d0dce6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
      }
      .q-sort-card-name {
        font: 500 9px var(--font-ui, 'Space Grotesk', sans-serif);
        color: var(--ocean-deep, #003049);
        text-align: center;
        line-height: 1.2;
      }
      .q-sort-card-badge {
        font: 700 8px var(--font-ui, 'Space Grotesk', sans-serif);
        letter-spacing: 0.03em;
        padding: 1px 5px;
        border-radius: 8px;
        min-width: 44px;
        text-align: center;
      }
      .q-sort-card:not(.q-sort-reef):not(.q-sort-ocean) .q-sort-card-badge {
        background: var(--chrome-gray, #f0f0f0);
        color: var(--muted, #888);
      }
      .q-sort-reef .q-sort-card-badge {
        background: var(--captcha-blue, #4A90D9);
        color: #fff;
      }
      .q-sort-ocean .q-sort-card-badge {
        background: var(--ocean-deep, #003049);
        color: var(--biolum, #00F5D4);
      }
      .q-sort-legend {
        display: flex;
        justify-content: space-between;
        font: 600 10px var(--font-ui, 'Space Grotesk', sans-serif);
        letter-spacing: 0.05em;
        color: var(--muted, #888);
        text-transform: uppercase;
      }
      .q-sort-legend span:first-child { color: var(--captcha-blue, #4A90D9); }
      .q-sort-legend span:last-child  { color: var(--ocean-deep, #003049); }
      .q-sort-hint {
        font: 400 10px var(--font-ui, 'Space Grotesk', sans-serif);
        color: var(--muted, #888);
        text-align: center;
      }
      .q-sort-verify {
        margin-top: 4px;
      }
    `;
    document.head.appendChild(el);
  }

  // 5 sharks spanning both habitats for good balance.
  var SORT_IDS = ['blacktip', 'oceanic-whitetip', 'nurse', 'mako', 'lemon', 'hammerhead'];

  SHARK.registerMechanic('sort', {
    fullBleed: false,
    timerSeconds: 25,
    mount: function (ctx) {
      injectStyle();

      ctx.setInstruction('Sort each shark: Reef or Open Ocean?');
      ctx.setCaption('Tap a card to toggle its habitat assignment, then hit Verify.');

      // Shuffle and pick up to 5 sharks (always use all 6 from SORT_IDS but take 5 for display).
      var sharkIds = SHARK.shuffle(SORT_IDS.slice()).slice(0, 5);
      var sharkData = sharkIds.map(function (id) { return SHARK.getShark(id); }).filter(Boolean);

      var wrap = document.createElement('div');
      wrap.className = 'q-sort-wrap';

      // Legend row
      var legend = document.createElement('div');
      legend.className = 'q-sort-legend';
      legend.innerHTML = '<span>Reef</span><span>Open Ocean</span>';
      wrap.appendChild(legend);

      // Hint
      var hint = document.createElement('div');
      hint.className = 'q-sort-hint';
      hint.textContent = 'Tap to cycle: unset → Reef → Open Ocean → unset';
      wrap.appendChild(hint);

      // Cards container
      var cards = document.createElement('div');
      cards.className = 'q-sort-cards';

      var cardEls = [];
      var assignments = []; // parallel array: null | 'reef' | 'open-ocean'

      sharkData.forEach(function (shark, idx) {
        assignments.push(null);

        var card = document.createElement('div');
        card.className = 'q-sort-card';

        // Thumbnail image with emoji fallback.
        if (shark.img) {
          var img = document.createElement('img');
          img.className = 'q-sort-thumb';
          img.src = shark.img;
          img.alt = shark.name;
          img.onerror = function () {
            var fallback = document.createElement('div');
            fallback.className = 'q-sort-thumb-fallback';
            fallback.textContent = shark.emoji || '🦈';
            card.replaceChild(fallback, img);
          };
          card.appendChild(img);
        } else {
          var fallback = document.createElement('div');
          fallback.className = 'q-sort-thumb-fallback';
          fallback.textContent = shark.emoji || '🦈';
          card.appendChild(fallback);
        }

        var nameEl = document.createElement('div');
        nameEl.className = 'q-sort-card-name';
        nameEl.textContent = shark.name;
        card.appendChild(nameEl);

        var badge = document.createElement('div');
        badge.className = 'q-sort-card-badge';
        badge.textContent = '?';
        card.appendChild(badge);

        card.addEventListener('click', function () {
          // Cycle: null → reef → open-ocean → null
          var cur = assignments[idx];
          var next = cur === null ? 'reef' : cur === 'reef' ? 'open-ocean' : null;
          assignments[idx] = next;

          card.classList.remove('q-sort-reef', 'q-sort-ocean');
          if (next === 'reef') {
            card.classList.add('q-sort-reef');
            badge.textContent = 'REEF';
          } else if (next === 'open-ocean') {
            card.classList.add('q-sort-ocean');
            badge.textContent = 'OPEN OCEAN';
          } else {
            badge.textContent = '?';
          }
        });

        cardEls.push(card);
        cards.appendChild(card);
      });

      wrap.appendChild(cards);

      // Verify button
      var verify = document.createElement('button');
      verify.className = 'btn q-sort-verify';
      verify.textContent = 'Verify';
      verify.addEventListener('click', function () {
        // Lock all cards
        cardEls.forEach(function (c) { c.classList.add('q-sort-locked'); });
        verify.disabled = true;

        var numCorrect = 0;
        sharkData.forEach(function (shark, idx) {
          var assigned = assignments[idx];
          var truth = shark.habitat; // 'reef' | 'open-ocean'
          var correct = (assigned === truth);
          if (correct) numCorrect++;

          // Visual feedback per card
          cardEls[idx].classList.remove('q-sort-reef', 'q-sort-ocean');
          if (correct) {
            cardEls[idx].classList.add(
              truth === 'reef' ? 'q-sort-correct-reef' : 'q-sort-correct-ocean'
            );
          } else {
            cardEls[idx].classList.add('q-sort-incorrect');
          }
        });

        var quality = numCorrect / sharkData.length;
        ctx.complete({
          correct: quality === 1,
          quality: quality
        });
      });

      wrap.appendChild(verify);
      ctx.content.appendChild(wrap);
    },
  });
})();
