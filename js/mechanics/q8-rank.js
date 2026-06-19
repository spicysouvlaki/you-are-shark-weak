// Q8 — Rank 'Em: "Order these sharks from smallest to largest by max length."
// Shows 4 shark cards in random order; user taps up/down arrows to reorder them.
// Sharks chosen for clearly distinct maxLengthM values:
//   nurse (3.0m) < bull (3.5m) < great-white (6.1m) < whale (18.8m)
// A "Verify" button checks correctness.
// quality = 1 if fully correct; 0.5 if 3/4 in right position; else 0.
(function () {
  var STYLE_ID = 'q-rank-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-rank-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 6px;
      }
      .q-rank-direction-label {
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        font-size: 11px;
        font-weight: 600;
        color: var(--captcha-blue, #4A90D9);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        text-align: center;
        margin-bottom: 2px;
      }
      .q-rank-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .q-rank-row {
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .q-rank-arrows {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex-shrink: 0;
      }
      .q-rank-arrow-btn {
        width: 30px;
        height: 26px;
        border: 1.5px solid var(--border-gray, #c8c8c8);
        border-radius: 4px;
        background: var(--chrome-gray, #f0f0f0);
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ocean-deep, #003049);
        transition: background 0.1s, border-color 0.1s;
        padding: 0;
        line-height: 1;
        user-select: none;
        -webkit-user-select: none;
      }
      .q-rank-arrow-btn:hover:not(:disabled) {
        background: #deeefb;
        border-color: var(--captcha-blue, #4A90D9);
      }
      .q-rank-arrow-btn:disabled {
        opacity: 0.25;
        cursor: default;
      }
      .q-rank-card {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 9px;
        background: var(--chrome-gray, #f0f0f0);
        border: 1.5px solid var(--border-gray, #c8c8c8);
        border-radius: 6px;
        padding: 8px 10px;
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        transition: border-color 0.15s;
        min-width: 0;
      }
      .q-rank-card-emoji {
        font-size: 22px;
        flex-shrink: 0;
        line-height: 1;
      }
      .q-rank-card-img {
        width: 36px;
        height: 36px;
        object-fit: cover;
        border-radius: 4px;
        flex-shrink: 0;
        display: block;
      }
      .q-rank-card-info {
        min-width: 0;
      }
      .q-rank-card-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--ocean-deep, #003049);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .q-rank-card-latin {
        font-size: 10px;
        color: #888;
        font-style: italic;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .q-rank-card.q-rank-correct {
        border-color: var(--biolum, #00F5D4);
        background: var(--ocean-deep, #003049);
      }
      .q-rank-card.q-rank-correct .q-rank-card-name {
        color: var(--biolum, #00F5D4);
      }
      .q-rank-card.q-rank-correct .q-rank-card-latin {
        color: rgba(0,245,212,0.6);
      }
      .q-rank-card.q-rank-wrong {
        border-color: var(--wrong-red, #E24B4A);
        background: #fdf0f0;
      }
      .q-rank-card.q-rank-wrong .q-rank-card-name {
        color: var(--wrong-red, #E24B4A);
      }
      .q-rank-card-length-reveal {
        font-size: 10px;
        font-family: var(--font-mono, monospace);
        color: var(--biolum, #00F5D4);
        opacity: 0.8;
        margin-top: 1px;
      }
      .q-rank-card.q-rank-wrong .q-rank-card-length-reveal {
        color: var(--wrong-red, #E24B4A);
      }
      .q-rank-verify {
        margin-top: 8px;
        width: 100%;
      }
      .q-rank-list.q-rank-locked .q-rank-arrow-btn {
        pointer-events: none;
        opacity: 0.2;
      }
    `;
    document.head.appendChild(el);
  }

  // Fixed 4 sharks with clearly distinct sizes (smallest → largest ground truth)
  var SHARK_IDS_ORDERED = ['nurse', 'bull', 'great-white', 'whale'];
  // maxLengthM: nurse 3.0, bull 3.5, great-white 6.1, whale 18.8

  SHARK.registerMechanic('rank', {
    fullBleed: false,
    timerSeconds: 30,
    mount: function (ctx) {
      injectStyle();
      ctx.setInstruction('Order these sharks: smallest to largest (max length).');
      ctx.setCaption('Use the arrows to reorder. Tap Verify when done.');

      var sharks = SHARK_IDS_ORDERED.map(function (id) {
        return SHARK.getShark(id);
      }).filter(Boolean);

      // Shuffle for display
      var order = SHARK.shuffle(sharks.slice());

      var wrap = document.createElement('div');
      wrap.className = 'q-rank-wrap';

      var dirLabel = document.createElement('div');
      dirLabel.className = 'q-rank-direction-label';
      dirLabel.textContent = '↑ Smallest  →  Largest ↓';
      wrap.appendChild(dirLabel);

      var list = document.createElement('div');
      list.className = 'q-rank-list';
      wrap.appendChild(list);

      function renderRow(shark, idx, total) {
        var row = document.createElement('div');
        row.className = 'q-rank-row';

        // Arrow buttons
        var arrows = document.createElement('div');
        arrows.className = 'q-rank-arrows';

        var upBtn = document.createElement('button');
        upBtn.className = 'q-rank-arrow-btn';
        upBtn.textContent = '▲';
        upBtn.title = 'Move up (smaller)';
        upBtn.disabled = idx === 0;

        var downBtn = document.createElement('button');
        downBtn.className = 'q-rank-arrow-btn';
        downBtn.textContent = '▼';
        downBtn.title = 'Move down (larger)';
        downBtn.disabled = idx === total - 1;

        arrows.appendChild(upBtn);
        arrows.appendChild(downBtn);

        // Card
        var card = document.createElement('div');
        card.className = 'q-rank-card';

        var mediaEl;
        if (shark.img) {
          var img = document.createElement('img');
          img.className = 'q-rank-card-img';
          img.src = shark.img;
          img.alt = shark.name;
          img.onerror = function () {
            img.remove();
            var em = document.createElement('span');
            em.className = 'q-rank-card-emoji';
            em.textContent = shark.emoji || '🦈';
            card.insertBefore(em, card.firstChild);
          };
          mediaEl = img;
        } else {
          var em2 = document.createElement('span');
          em2.className = 'q-rank-card-emoji';
          em2.textContent = shark.emoji || '🦈';
          mediaEl = em2;
        }
        card.appendChild(mediaEl);

        var info = document.createElement('div');
        info.className = 'q-rank-card-info';

        var nameEl = document.createElement('div');
        nameEl.className = 'q-rank-card-name';
        nameEl.textContent = shark.name;

        var latinEl = document.createElement('div');
        latinEl.className = 'q-rank-card-latin';
        latinEl.textContent = shark.latin;

        info.appendChild(nameEl);
        info.appendChild(latinEl);
        card.appendChild(info);

        row.appendChild(arrows);
        row.appendChild(card);

        // Store shark ref for scoring
        row._shark = shark;
        row._upBtn = upBtn;
        row._downBtn = downBtn;

        return row;
      }

      function rebuildList() {
        list.innerHTML = '';
        order.forEach(function (shark, idx) {
          var row = renderRow(shark, idx, order.length);
          list.appendChild(row);

          row._upBtn.addEventListener('click', function () {
            if (idx === 0) return;
            var tmp = order[idx - 1];
            order[idx - 1] = order[idx];
            order[idx] = tmp;
            rebuildList();
          });

          row._downBtn.addEventListener('click', function () {
            if (idx === order.length - 1) return;
            var tmp = order[idx + 1];
            order[idx + 1] = order[idx];
            order[idx] = tmp;
            rebuildList();
          });
        });
      }

      rebuildList();

      var done = false;
      var verify = document.createElement('button');
      verify.className = 'btn q-rank-verify';
      verify.textContent = 'Verify';

      verify.addEventListener('click', function () {
        if (done) return;
        done = true;

        list.classList.add('q-rank-locked');
        verify.disabled = true;

        // Ground truth: sorted by maxLengthM ascending
        var sortedByLength = sharks.slice().sort(function (a, b) {
          return (a.maxLengthM || 0) - (b.maxLengthM || 0);
        });

        // Score: count how many positions match
        var correctPositions = 0;
        order.forEach(function (shark, idx) {
          if (shark === sortedByLength[idx]) correctPositions++;
        });
        var allCorrect = correctPositions === order.length;
        var quality = allCorrect ? 1 : (correctPositions >= 3 ? 0.5 : 0);

        // Reveal correct/wrong state on each card + show actual length
        Array.prototype.forEach.call(list.children, function (row, idx) {
          var card = row.querySelector('.q-rank-card');
          if (!card) return;
          var shark = row._shark;
          var isCorrect = (shark === sortedByLength[idx]);
          card.classList.add(isCorrect ? 'q-rank-correct' : 'q-rank-wrong');

          // Show length
          var lengthEl = document.createElement('div');
          lengthEl.className = 'q-rank-card-length-reveal';
          lengthEl.textContent = 'max ' + (shark.maxLengthM || '?') + ' m';
          card.querySelector('.q-rank-card-info').appendChild(lengthEl);
        });

        ctx.complete({ correct: allCorrect, quality: quality });
      });

      wrap.appendChild(verify);
      ctx.content.appendChild(wrap);
    }
  });
})();
