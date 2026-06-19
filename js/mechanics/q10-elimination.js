// Q10 — Elimination Round: "Narrow down to the correct shark using clues."
// Mechanic id: 'elimination'
// Truth: ctx.shark (great white shark)
// Present 6 shark options; deliver 3 sequential clues; user taps to eliminate wrong ones.
// correct = final locked pick is ctx.shark.name
// quality = based on how cleanly user eliminated (fewer wrong eliminations = higher quality)
(function () {
  var STYLE_ID = 'q-elim-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = [
      '.q-elim-wrap { display:flex; flex-direction:column; gap:8px; padding:4px 0; }',

      '.q-elim-clues-wrap {',
      '  background: var(--chrome-gray);',
      '  border-radius: 4px;',
      '  padding: 8px 10px;',
      '  min-height: 48px;',
      '}',

      '.q-elim-clue-label {',
      '  font-family: var(--font-ui);',
      '  font-size: 10px;',
      '  font-weight: 600;',
      '  color: var(--captcha-blue);',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.08em;',
      '  margin-bottom: 4px;',
      '}',

      '.q-elim-clue-text {',
      '  font-family: var(--font-ui);',
      '  font-size: 13px;',
      '  color: var(--ocean-deep);',
      '  line-height: 1.4;',
      '}',

      '.q-elim-clue-text.fade-in {',
      '  animation: q-elim-fadein 0.35s ease forwards;',
      '}',

      '@keyframes q-elim-fadein {',
      '  from { opacity:0; transform:translateY(4px); }',
      '  to   { opacity:1; transform:translateY(0); }',
      '}',

      '.q-elim-clue-index {',
      '  font-family: var(--font-mono);',
      '  font-size: 10px;',
      '  color: var(--muted);',
      '  margin-top: 4px;',
      '}',

      '.q-elim-grid {',
      '  display: grid;',
      '  grid-template-columns: 1fr 1fr;',
      '  gap: 6px;',
      '}',

      '.q-elim-card {',
      '  position: relative;',
      '  border: 2px solid var(--border-gray);',
      '  border-radius: 5px;',
      '  padding: 8px 6px 6px;',
      '  background: var(--card-white);',
      '  cursor: pointer;',
      '  transition: border-color 0.15s, opacity 0.2s;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 4px;',
      '  user-select: none;',
      '}',

      '.q-elim-card:active { transform: scale(0.97); }',

      '.q-elim-card.eliminated {',
      '  opacity: 0.35;',
      '  border-color: var(--wrong-red);',
      '  cursor: default;',
      '}',

      '.q-elim-card.eliminated .q-elim-card-name::after {',
      '  content: "";',
      '  position: absolute;',
      '  left: 4px; right: 4px;',
      '  top: 50%;',
      '  border-top: 2px solid var(--wrong-red);',
      '  pointer-events: none;',
      '}',

      '.q-elim-card.selected {',
      '  border-color: var(--captcha-blue);',
      '  background: #eef5ff;',
      '}',

      '.q-elim-card.locked-correct {',
      '  border-color: var(--biolum);',
      '  background: var(--ocean-deep);',
      '}',

      '.q-elim-card.locked-correct .q-elim-card-name { color: var(--biolum); }',
      '.q-elim-card.locked-correct .q-elim-card-emoji { filter: none; }',

      '.q-elim-card.locked-wrong {',
      '  border-color: var(--wrong-red);',
      '  opacity: 0.5;',
      '}',

      '.q-elim-card-emoji {',
      '  font-size: 26px;',
      '  line-height: 1;',
      '}',

      '.q-elim-card-img {',
      '  width: 100%;',
      '  height: 50px;',
      '  object-fit: cover;',
      '  border-radius: 3px;',
      '  display: block;',
      '}',

      '.q-elim-card-name {',
      '  position: relative;',
      '  font-family: var(--font-ui);',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  color: var(--ocean-deep);',
      '  text-align: center;',
      '  line-height: 1.25;',
      '}',

      '.q-elim-x {',
      '  position: absolute;',
      '  top: 4px; right: 4px;',
      '  font-size: 13px;',
      '  color: var(--wrong-red);',
      '  font-weight: 700;',
      '  display: none;',
      '  line-height: 1;',
      '}',

      '.q-elim-card.eliminated .q-elim-x { display: block; }',

      '.q-elim-actions {',
      '  display: flex;',
      '  gap: 6px;',
      '}',

      '.q-elim-btn-next {',
      '  flex: 1;',
      '}',

      '.q-elim-btn-lock {',
      '  flex: 1;',
      '}',

      '.q-elim-hint {',
      '  font-family: var(--font-ui);',
      '  font-size: 10px;',
      '  color: var(--muted);',
      '  text-align: center;',
      '}',

      '.q-elim-wrap.locked .q-elim-card { pointer-events: none; }',
    ].join('\n');
    document.head.appendChild(el);
  }

  // Clues about the great white shark, from least to most specific
  var CLUES = [
    'This shark is found in temperate and sub-polar coastal waters — not just tropical seas.',
    'It is one of the largest predatory fish alive, regularly exceeding 5 metres in length.',
    'It is famous for spectacular breaching — launching its full body clear out of the water when ambushing prey from below.',
  ];

  // 6 options: great-white is always included; pick 5 diverse decoys
  var DECOY_IDS = ['tiger', 'bull', 'hammerhead', 'mako', 'whale', 'thresher', 'nurse', 'blacktip'];
  var PICK_DECOYS = 5;

  SHARK.registerMechanic('elimination', {
    fullBleed: false,
    timerSeconds: 35,
    mount: function (ctx) {
      injectStyle();

      var shark = ctx.shark; // should be great-white
      var targetId = 'great-white';
      // Safely get the real target from SHARK data
      var target = SHARK.getShark(targetId) || shark;
      var targetName = target ? target.name : 'Great White Shark';

      ctx.setInstruction('Read each clue and eliminate wrong sharks. Lock in your final answer.');

      var captionParts = ['Tap a card to eliminate it · reveal all 3 clues first'];
      if (target && target.credit && target.credit.source) {
        captionParts = [
          'Photo: ' + (target.credit.creator || 'Unknown'),
          target.credit.source,
          target.credit.license || 'CC BY-NC',
          target.credit.url || ''
        ].filter(Boolean);
      }
      ctx.setCaption(captionParts.join(' · '));

      var completed = false;

      // Build option pool: target + 5 decoys
      var shuffledDecoys = SHARK.shuffle(DECOY_IDS.slice()).slice(0, PICK_DECOYS);
      var optionIds = SHARK.shuffle(shuffledDecoys.concat([targetId]));
      var options = optionIds.map(function (id) {
        return SHARK.getShark(id) || { name: id, emoji: '🦈', img: null };
      });

      // State
      var clueIndex = 0;
      var eliminated = {}; // id -> true
      var wrongElimCount = 0; // count of target accidentally eliminated (or restored wrong)

      // Wrap
      var wrap = document.createElement('div');
      wrap.className = 'q-elim-wrap';

      // Clue area
      var cluesWrap = document.createElement('div');
      cluesWrap.className = 'q-elim-clues-wrap';

      var clueLabel = document.createElement('div');
      clueLabel.className = 'q-elim-clue-label';
      clueLabel.textContent = 'Clue';

      var clueText = document.createElement('div');
      clueText.className = 'q-elim-clue-text';
      clueText.textContent = CLUES[0];

      var clueIndexEl = document.createElement('div');
      clueIndexEl.className = 'q-elim-clue-index';
      clueIndexEl.textContent = '1 of ' + CLUES.length;

      cluesWrap.appendChild(clueLabel);
      cluesWrap.appendChild(clueText);
      cluesWrap.appendChild(clueIndexEl);
      wrap.appendChild(cluesWrap);

      // Hint
      var hint = document.createElement('div');
      hint.className = 'q-elim-hint';
      hint.textContent = 'Tap a card to eliminate it (tap again to restore).';
      wrap.appendChild(hint);

      // Grid of shark cards
      var grid = document.createElement('div');
      grid.className = 'q-elim-grid';

      var selectionMode = false; // flips true after all clues revealed
      var cards = [];
      options.forEach(function (opt, idx) {
        var optId = optionIds[idx];

        var card = document.createElement('div');
        card.className = 'q-elim-card';
        card._optId = optId;
        card._optName = opt.name;

        // X badge
        var xBadge = document.createElement('span');
        xBadge.className = 'q-elim-x';
        xBadge.textContent = '✕';
        card.appendChild(xBadge);

        // Image or emoji
        var nameEl; // declared early so onerror closure can reference it
        if (opt.img) {
          var img = document.createElement('img');
          img.className = 'q-elim-card-img';
          img.src = opt.img;
          img.alt = opt.name;
          img.onerror = function () {
            img.remove();
            var emojiEl = document.createElement('div');
            emojiEl.className = 'q-elim-card-emoji';
            emojiEl.textContent = opt.emoji || '🦈';
            if (nameEl && nameEl.parentNode === card) {
              card.insertBefore(emojiEl, nameEl);
            } else {
              card.appendChild(emojiEl);
            }
          };
          card.appendChild(img);
        } else {
          var emojiEl = document.createElement('div');
          emojiEl.className = 'q-elim-card-emoji';
          emojiEl.textContent = opt.emoji || '🦈';
          card.appendChild(emojiEl);
        }

        nameEl = document.createElement('div');
        nameEl.className = 'q-elim-card-name';
        nameEl.textContent = opt.name;
        card.appendChild(nameEl);

        // Single unified click handler
        card.addEventListener('click', function () {
          if (completed) return;
          if (selectionMode) {
            // Selection mode: tap to select (not eliminate)
            if (card.classList.contains('eliminated')) return; // can't select eliminated
            cards.forEach(function (c) { c.classList.remove('selected'); });
            card.classList.add('selected');
            selectedId = card._optId;
            btnLock.disabled = false;
            btnLock.style.opacity = '';
          } else {
            // Elimination mode: toggle cross-out
            var isElim = card.classList.contains('eliminated');
            if (isElim) {
              card.classList.remove('eliminated');
              delete eliminated[optId];
            } else {
              card.classList.add('eliminated');
              eliminated[optId] = true;
            }
          }
        });

        grid.appendChild(card);
        cards.push(card);
      });

      wrap.appendChild(grid);

      // Action buttons
      var actions = document.createElement('div');
      actions.className = 'q-elim-actions';

      var btnNext = document.createElement('button');
      btnNext.className = 'btn q-elim-btn-next';
      btnNext.textContent = 'Next clue →';

      var btnLock = document.createElement('button');
      btnLock.className = 'btn q-elim-btn-lock';
      btnLock.textContent = 'Lock in answer';
      btnLock.disabled = true;
      btnLock.style.opacity = '0.5';

      actions.appendChild(btnNext);
      actions.appendChild(btnLock);
      wrap.appendChild(actions);

      ctx.content.appendChild(wrap);

      // Advance clue
      btnNext.addEventListener('click', function () {
        if (completed) return;
        clueIndex++;
        if (clueIndex >= CLUES.length) {
          // All clues revealed — hide Next, enable Lock
          btnNext.style.display = 'none';
          btnLock.disabled = false;
          btnLock.style.opacity = '';
          clueLabel.textContent = 'All clues revealed — lock in your answer!';
          clueText.textContent = CLUES[CLUES.length - 1];
          clueIndexEl.textContent = CLUES.length + ' of ' + CLUES.length;
          hint.textContent = 'Click a non-eliminated card to select it, then lock in.';
          // Switch to selection mode
          enableSelectionMode();
        } else {
          clueText.className = 'q-elim-clue-text fade-in';
          clueText.textContent = CLUES[clueIndex];
          clueIndexEl.textContent = (clueIndex + 1) + ' of ' + CLUES.length;
          // Re-trigger animation
          void clueText.offsetWidth;
        }
      });

      // Switch cards from elimination mode to selection mode
      var selectedId = null;
      function enableSelectionMode() {
        selectionMode = true;
      }

      // Lock in
      btnLock.addEventListener('click', function () {
        if (completed) return;
        // If no card explicitly selected, pick the last non-eliminated
        if (!selectedId) {
          var remaining = cards.filter(function (c) { return !c.classList.contains('eliminated'); });
          if (remaining.length === 1) {
            selectedId = remaining[0]._optId;
            remaining[0].classList.add('selected');
          } else if (remaining.length === 0) {
            // All eliminated — wrong
            selectedId = null;
          } else {
            // Multiple remaining, no pick — prompt
            hint.textContent = 'Tap a card to select your final answer, then lock in.';
            return;
          }
        }

        completed = true;
        wrap.classList.add('locked');
        btnNext.disabled = true;
        btnLock.disabled = true;
        btnLock.style.opacity = '0.5';

        var correct = selectedId === targetId;

        // Count wrong eliminations (i.e., target was eliminated, or non-targets were kept and selected)
        var targetEliminated = !!eliminated[targetId];
        // Quality: start at 1.0, penalise per wrong elimination action
        // wrong eliminations = number of non-target cards NOT eliminated (still in play uninvestigated)
        // Simpler metric: count decoy cards that were never eliminated
        var decoyIds = optionIds.filter(function (id) { return id !== targetId; });
        var eliminatedDecoys = decoyIds.filter(function (id) { return !!eliminated[id]; }).length;
        // Max quality = 1 if correct and all decoys eliminated; partial if some decoys left in
        var quality;
        if (correct) {
          // Full credit plus bonus for decoys eliminated
          quality = 0.5 + 0.5 * (eliminatedDecoys / decoyIds.length);
        } else {
          // Partial credit based on how many decoys were eliminated before guessing wrong
          quality = 0.1 * (eliminatedDecoys / decoyIds.length);
          if (targetEliminated) quality = 0; // eliminated the target = no credit
        }
        quality = Math.min(1, Math.max(0, quality));

        // Visual reveal
        cards.forEach(function (card) {
          if (card._optId === targetId) {
            card.classList.remove('selected', 'eliminated');
            card.classList.add('locked-correct');
          } else if (card._optId === selectedId && !correct) {
            card.classList.add('locked-wrong');
          }
        });

        ctx.complete({ correct: correct, quality: quality });
      });

      return function () {};
    }
  });
})();
