// Q7 — Match the Shadow: "Which shark does this silhouette belong to?"
// Shows an inline SVG silhouette of the thresher shark (distinctive long upper tail lobe).
// User picks from 4 name options. ctx.shark = thresher; 3 distractors from other sharks.
// Correct = user picks ctx.shark's name.
(function () {
  var STYLE_ID = 'q-shadow-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-shadow-stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        margin-top: 6px;
      }
      .q-shadow-svg-wrap {
        width: 100%;
        max-width: 280px;
        background: linear-gradient(160deg, #011d2e 0%, #003a5c 100%);
        border-radius: 8px;
        padding: 18px 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: inset 0 0 20px rgba(0,240,212,0.07);
      }
      .q-shadow-svg-wrap svg {
        width: 100%;
        height: auto;
        max-width: 260px;
        display: block;
        filter: drop-shadow(0 0 8px rgba(0,245,212,0.25));
      }
      .q-shadow-choices {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7px;
        width: 100%;
      }
      .q-shadow-btn {
        padding: 10px 6px;
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        font-size: 12px;
        font-weight: 500;
        color: var(--ocean-deep, #003049);
        background: var(--chrome-gray, #f0f0f0);
        border: 1.5px solid var(--border-gray, #c8c8c8);
        border-radius: 6px;
        cursor: pointer;
        text-align: center;
        transition: border-color 0.13s, background 0.13s;
        line-height: 1.3;
        user-select: none;
        -webkit-user-select: none;
      }
      .q-shadow-btn:hover:not(.q-shadow-locked-btn) {
        border-color: var(--captcha-blue, #4A90D9);
        background: #e6f0fb;
      }
      .q-shadow-btn.q-shadow-correct {
        border-color: var(--biolum, #00F5D4);
        background: var(--ocean-deep, #003049);
        color: var(--biolum, #00F5D4);
        font-weight: 600;
      }
      .q-shadow-btn.q-shadow-wrong {
        border-color: var(--wrong-red, #E24B4A);
        background: #fdf0f0;
        color: var(--wrong-red, #E24B4A);
      }
      .q-shadow-btn.q-shadow-locked-btn {
        cursor: default;
        pointer-events: none;
      }
      .q-shadow-hint {
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        font-size: 10px;
        color: var(--biolum, #00F5D4);
        opacity: 0.55;
        letter-spacing: 0.03em;
        text-align: center;
      }
    `;
    document.head.appendChild(el);
  }

  // ---------- SVG silhouettes ----------
  // Each silhouette is a pure inline SVG path rendered as a dark shape.
  // viewBox coordinate space: 0 0 300 120
  // Thresher shark: compact torpedo body + dramatically elongated upper tail lobe (caudal fin).
  // Distractors: generic elongated body, rounded nose (whale), stocky body (bull), scalloped head (hammerhead).
  var SILHOUETTES = {
    // Thresher: compact body, very long upper tail whip pointing back-and-up
    thresher: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" aria-label="Shark silhouette">
      <title>Shark silhouette</title>
      <!-- Body -->
      <ellipse cx="120" cy="70" rx="75" ry="22" fill="#00F5D4" opacity="0.15"/>
      <path d="
        M 55 70
        C 60 52, 90 44, 140 50
        C 170 52, 195 58, 195 70
        C 195 82, 170 88, 140 90
        C 90 96, 60 88, 55 70 Z
      " fill="#00F5D4" opacity="0.9"/>
      <!-- Dorsal fin -->
      <path d="M 130 50 L 148 24 L 162 50 Z" fill="#00F5D4" opacity="0.9"/>
      <!-- Pectoral fin (lower) -->
      <path d="M 155 72 L 175 94 L 188 75 Z" fill="#00F5D4" opacity="0.85"/>
      <!-- Tail: short lower lobe -->
      <path d="M 192 70 L 210 82 L 198 70 Z" fill="#00F5D4" opacity="0.9"/>
      <!-- Tail: very long upper lobe — the defining thresher feature -->
      <path d="M 194 68 Q 230 40 285 10 Q 270 30 218 70 Z" fill="#00F5D4" opacity="0.9"/>
      <!-- Snout -->
      <path d="M 55 70 L 38 66 L 38 74 Z" fill="#00F5D4" opacity="0.9"/>
    </svg>`,

    // Hammerhead: wide T-shaped head
    hammerhead: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" aria-label="Shark silhouette">
      <title>Shark silhouette</title>
      <path d="
        M 80 70
        C 85 55, 110 48, 160 52
        C 190 54, 215 60, 215 70
        C 215 80, 190 86, 160 88
        C 110 92, 85 85, 80 70 Z
      " fill="#00F5D4" opacity="0.9"/>
      <!-- Cephalofoil (wide hammer head) -->
      <rect x="55" y="62" width="36" height="16" rx="4" fill="#00F5D4" opacity="0.9"/>
      <!-- Dorsal fin -->
      <path d="M 148 52 L 162 28 L 175 52 Z" fill="#00F5D4" opacity="0.9"/>
      <!-- Pectoral fin -->
      <path d="M 175 74 L 195 96 L 208 76 Z" fill="#00F5D4" opacity="0.85"/>
      <!-- Tail lobes (balanced) -->
      <path d="M 212 65 Q 240 50 255 42 Q 242 62 218 70 Z" fill="#00F5D4" opacity="0.9"/>
      <path d="M 212 75 L 248 90 L 220 72 Z" fill="#00F5D4" opacity="0.9"/>
    </svg>`,

    // Whale shark: massive blunt head, huge body, flat broad tail
    whale: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" aria-label="Shark silhouette">
      <title>Shark silhouette</title>
      <!-- Massive body -->
      <path d="
        M 50 65
        C 50 45, 75 38, 155 40
        C 220 42, 250 52, 252 65
        C 252 78, 220 88, 155 90
        C 75 92, 50 85, 50 65 Z
      " fill="#00F5D4" opacity="0.9"/>
      <!-- Very blunt square snout -->
      <rect x="28" y="58" width="26" height="14" rx="3" fill="#00F5D4" opacity="0.9"/>
      <!-- Low dorsal fin -->
      <path d="M 170 42 L 182 22 L 196 42 Z" fill="#00F5D4" opacity="0.9"/>
      <!-- Large pectoral fin -->
      <path d="M 190 70 L 218 100 L 232 74 Z" fill="#00F5D4" opacity="0.85"/>
      <!-- Broad crescent tail -->
      <path d="M 248 58 Q 272 40 285 32 Q 270 55 256 65 Z" fill="#00F5D4" opacity="0.9"/>
      <path d="M 248 72 Q 270 90 282 98 Q 268 80 255 67 Z" fill="#00F5D4" opacity="0.9"/>
    </svg>`,

    // Bull shark: stocky, broad snout, no-nonsense profile
    bull: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" aria-label="Shark silhouette">
      <title>Shark silhouette</title>
      <path d="
        M 70 68
        C 72 52, 100 45, 160 48
        C 200 50, 225 58, 225 68
        C 225 78, 200 86, 160 88
        C 100 91, 72 84, 70 68 Z
      " fill="#00F5D4" opacity="0.9"/>
      <!-- Blunt broad snout -->
      <path d="M 70 68 L 44 62 L 44 74 Z" fill="#00F5D4" opacity="0.9"/>
      <path d="M 60 64 L 44 60 L 44 76 L 62 73 Z" fill="#00F5D4" opacity="0.9"/>
      <!-- Tall dorsal fin -->
      <path d="M 145 49 L 158 22 L 172 49 Z" fill="#00F5D4" opacity="0.9"/>
      <!-- Pectoral fin -->
      <path d="M 180 72 L 200 96 L 214 74 Z" fill="#00F5D4" opacity="0.85"/>
      <!-- Tail (balanced lobes) -->
      <path d="M 222 62 Q 248 48 262 40 Q 248 60 226 68 Z" fill="#00F5D4" opacity="0.9"/>
      <path d="M 222 74 L 255 90 L 228 72 Z" fill="#00F5D4" opacity="0.9"/>
    </svg>`
  };

  // Distractor shark ids to pick names from (exclude thresher)
  var DISTRACTOR_IDS = ['hammerhead', 'whale', 'bull', 'mako', 'great-white', 'nurse', 'tiger'];

  SHARK.registerMechanic('shadow', {
    fullBleed: false,
    timerSeconds: 20,
    mount: function (ctx) {
      injectStyle();

      var target = ctx.shark; // should be thresher
      ctx.setInstruction('Which shark does this silhouette belong to?');
      ctx.setCaption('Look closely at the body shape and fin proportions.');

      var stage = document.createElement('div');
      stage.className = 'q-shadow-stage';

      // SVG silhouette display
      var svgWrap = document.createElement('div');
      svgWrap.className = 'q-shadow-svg-wrap';
      // Pick the correct silhouette by matching shark id
      var sharkId = target && target.id ? target.id : 'thresher';
      var svgMarkup = SILHOUETTES[sharkId] || SILHOUETTES['thresher'];
      svgWrap.innerHTML = svgMarkup;
      stage.appendChild(svgWrap);

      // Hint label
      var hint = document.createElement('div');
      hint.className = 'q-shadow-hint';
      hint.textContent = 'Tap a name to guess';
      stage.appendChild(hint);

      // Build 4 options: the correct shark + 3 distractors
      var distractorPool = SHARK.shuffle(DISTRACTOR_IDS.slice());
      // Filter out the target's id in case it appears
      var targetId = sharkId;
      distractorPool = distractorPool.filter(function (id) { return id !== targetId; });
      var distractorIds = distractorPool.slice(0, 3);

      var options = [{ shark: target, isCorrect: true }];
      distractorIds.forEach(function (id) {
        var s = SHARK.getShark(id);
        if (s) options.push({ shark: s, isCorrect: false });
      });
      options = SHARK.shuffle(options);

      var choices = document.createElement('div');
      choices.className = 'q-shadow-choices';

      var done = false;
      options.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.className = 'q-shadow-btn';
        btn.textContent = (opt.shark && opt.shark.name) || 'Unknown';
        btn.addEventListener('click', function () {
          if (done) return;
          done = true;

          // Lock all buttons
          Array.prototype.forEach.call(choices.children, function (b) {
            b.classList.add('q-shadow-locked-btn');
          });

          // Reveal correct/wrong
          Array.prototype.forEach.call(choices.children, function (b) {
            if (b._isCorrect) {
              b.classList.add('q-shadow-correct');
            } else if (b === btn && !opt.isCorrect) {
              b.classList.add('q-shadow-wrong');
            }
          });

          ctx.complete({ correct: opt.isCorrect });
        });
        btn._isCorrect = opt.isCorrect;
        choices.appendChild(btn);
      });

      stage.appendChild(choices);
      ctx.content.appendChild(stage);
    }
  });
})();
