// Q9 — Hot or Cold: "Guess how deep the goblin shark dives (in metres)."
// Mechanic id: 'hotcold'
// Truth: ctx.shark.maxDepthM (goblin shark = 1300m)
// quality = 1 - min(1, abs(guess-truth)/truth)
// correct = within 25% of truth
(function () {
  var STYLE_ID = 'q-hot-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = [
      '.q-hot-wrap { display:flex; flex-direction:column; align-items:center; gap:10px; padding:8px 0; }',

      '.q-hot-shark-icon { font-size:40px; line-height:1; margin-bottom:2px; }',

      '.q-hot-depth-display {',
      '  font-family: var(--font-mono);',
      '  font-size: 28px;',
      '  color: var(--ocean-deep);',
      '  font-weight: 700;',
      '  letter-spacing: -0.5px;',
      '  min-width: 100px;',
      '  text-align: center;',
      '}',

      '.q-hot-depth-label {',
      '  font-family: var(--font-ui);',
      '  font-size: 10px;',
      '  color: var(--muted);',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.08em;',
      '  margin-top: -6px;',
      '}',

      '.q-hot-slider-wrap { width: 100%; padding: 0 4px; box-sizing:border-box; }',

      '.q-hot-slider {',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  width: 100%;',
      '  height: 6px;',
      '  border-radius: 3px;',
      '  background: var(--chrome-gray);',
      '  outline: none;',
      '  cursor: pointer;',
      '}',

      '.q-hot-slider::-webkit-slider-thumb {',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  width: 22px;',
      '  height: 22px;',
      '  border-radius: 50%;',
      '  background: var(--captcha-blue);',
      '  cursor: pointer;',
      '  border: 3px solid var(--card-white);',
      '  box-shadow: 0 1px 4px rgba(0,0,0,0.25);',
      '}',

      '.q-hot-slider::-moz-range-thumb {',
      '  width: 22px;',
      '  height: 22px;',
      '  border-radius: 50%;',
      '  background: var(--captcha-blue);',
      '  cursor: pointer;',
      '  border: 3px solid var(--card-white);',
      '  box-shadow: 0 1px 4px rgba(0,0,0,0.25);',
      '}',

      '.q-hot-range-labels {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  width: 100%;',
      '  padding: 0 4px;',
      '  box-sizing: border-box;',
      '  margin-top: -4px;',
      '}',

      '.q-hot-range-labels span {',
      '  font-family: var(--font-ui);',
      '  font-size: 10px;',
      '  color: var(--muted);',
      '}',

      '.q-hot-feedback {',
      '  font-family: var(--font-ui);',
      '  font-size: 15px;',
      '  font-weight: 600;',
      '  text-align: center;',
      '  min-height: 22px;',
      '  transition: color 0.2s;',
      '}',

      '.q-hot-feedback.hot { color: var(--wrong-red); }',
      '.q-hot-feedback.warm { color: var(--streak-amber); }',
      '.q-hot-feedback.cold { color: var(--captcha-blue); }',
      '.q-hot-feedback.ice { color: var(--ocean-deep); }',

      '.q-hot-submit {',
      '  width: 100%;',
      '  margin-top: 4px;',
      '}',

      '.q-hot-result-wrap {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 4px;',
      '  width: 100%;',
      '}',

      '.q-hot-result-label {',
      '  font-family: var(--font-ui);',
      '  font-size: 12px;',
      '  color: var(--muted);',
      '}',

      '.q-hot-result-truth {',
      '  font-family: var(--font-mono);',
      '  font-size: 22px;',
      '  color: var(--biolum);',
      '  background: var(--ocean-deep);',
      '  padding: 4px 16px;',
      '  border-radius: 4px;',
      '  font-weight: 700;',
      '}',

      '.q-hot-result-verdict {',
      '  font-family: var(--font-ui);',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  margin-top: 2px;',
      '}',

      '.q-hot-result-verdict.correct { color: var(--captcha-blue); }',
      '.q-hot-result-verdict.wrong { color: var(--wrong-red); }',
    ].join('\n');
    document.head.appendChild(el);
  }

  SHARK.registerMechanic('hotcold', {
    fullBleed: false,
    timerSeconds: 30,
    mount: function (ctx) {
      injectStyle();

      var shark = ctx.shark;
      var truth = (shark && typeof shark.maxDepthM === 'number') ? shark.maxDepthM : 1300;
      var sharkName = (shark && shark.name) ? shark.name : 'Goblin Shark';
      var sharkEmoji = (shark && shark.emoji) ? shark.emoji : '🦈';

      ctx.setInstruction('How deep does the ' + sharkName + ' dive? Drag to your best guess.');

      // Caption with photo credit if available
      var captionParts = ['Depths in metres · goblin sharks are rarely photographed alive'];
      if (shark && shark.credit && shark.credit.source) {
        captionParts = [
          'Photo: ' + (shark.credit.creator || 'Unknown'),
          shark.credit.source,
          shark.credit.license || 'CC BY-NC',
          shark.credit.url || ''
        ].filter(Boolean);
      }
      ctx.setCaption(captionParts.join(' · '));

      // Slider min/max
      var MIN = 0;
      var MAX = 2000;
      var startValue = Math.round(MAX / 2); // start at 1000m

      var completed = false;

      // Build DOM
      var wrap = document.createElement('div');
      wrap.className = 'q-hot-wrap';

      // Shark image or emoji
      var iconWrap = document.createElement('div');
      iconWrap.className = 'q-hot-shark-icon';
      if (shark && shark.img) {
        var img = document.createElement('img');
        img.src = shark.img;
        img.alt = sharkName;
        img.style.cssText = 'width:56px;height:56px;object-fit:cover;border-radius:50%;display:block;';
        img.onerror = function () {
          img.remove();
          iconWrap.textContent = sharkEmoji;
        };
        iconWrap.appendChild(img);
      } else {
        iconWrap.textContent = sharkEmoji;
      }
      wrap.appendChild(iconWrap);

      // Live depth display
      var depthDisplay = document.createElement('div');
      depthDisplay.className = 'q-hot-depth-display';
      depthDisplay.textContent = startValue + ' m';

      var depthLabel = document.createElement('div');
      depthLabel.className = 'q-hot-depth-label';
      depthLabel.textContent = 'your guess';

      wrap.appendChild(depthDisplay);
      wrap.appendChild(depthLabel);

      // Feedback line (shown while dragging)
      var feedback = document.createElement('div');
      feedback.className = 'q-hot-feedback';
      feedback.textContent = '';
      wrap.appendChild(feedback);

      // Slider
      var sliderWrap = document.createElement('div');
      sliderWrap.className = 'q-hot-slider-wrap';
      var slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'q-hot-slider';
      slider.min = MIN;
      slider.max = MAX;
      slider.step = 10;
      slider.value = startValue;
      sliderWrap.appendChild(slider);
      wrap.appendChild(sliderWrap);

      // Range edge labels
      var rangeLabels = document.createElement('div');
      rangeLabels.className = 'q-hot-range-labels';
      var labelLeft = document.createElement('span');
      labelLeft.textContent = '0 m';
      var labelRight = document.createElement('span');
      labelRight.textContent = '2000 m';
      rangeLabels.appendChild(labelLeft);
      rangeLabels.appendChild(labelRight);
      wrap.appendChild(rangeLabels);

      // Submit button
      var submit = document.createElement('button');
      submit.className = 'btn q-hot-submit';
      submit.textContent = 'Lock in my guess';
      wrap.appendChild(submit);

      ctx.content.appendChild(wrap);

      // Helper: get feedback text + class from error ratio
      function getFeedback(guess) {
        var err = Math.abs(guess - truth) / truth;
        if (err <= 0.05) return { text: 'Scalding hot! 🔥', cls: 'hot' };
        if (err <= 0.15) return { text: 'Very warm 🌡️', cls: 'warm' };
        if (err <= 0.25) return { text: 'Getting warm...', cls: 'warm' };
        if (err <= 0.5)  return { text: 'Cold 💧', cls: 'cold' };
        return { text: 'Ice cold 🧊', cls: 'ice' };
      }

      // Slider input: update display + feedback
      slider.addEventListener('input', function () {
        if (completed) return;
        var guess = parseInt(slider.value, 10);
        depthDisplay.textContent = guess + ' m';
        var fb = getFeedback(guess);
        feedback.textContent = fb.text;
        feedback.className = 'q-hot-feedback ' + fb.cls;
      });

      // Submit
      submit.addEventListener('click', function () {
        if (completed) return;
        completed = true;

        // Lock input
        slider.disabled = true;
        submit.disabled = true;
        submit.style.opacity = '0.5';

        var guess = parseInt(slider.value, 10);
        var err = Math.abs(guess - truth) / truth;
        var quality = Math.max(0, 1 - Math.min(1, err));
        var correct = err <= 0.25;

        // Replace feedback with result reveal
        feedback.style.display = 'none';
        submit.style.display = 'none';
        depthLabel.textContent = 'your guess';

        var resultWrap = document.createElement('div');
        resultWrap.className = 'q-hot-result-wrap';

        var resultLabel = document.createElement('div');
        resultLabel.className = 'q-hot-result-label';
        resultLabel.textContent = 'Actual max depth:';

        var resultTruth = document.createElement('div');
        resultTruth.className = 'q-hot-result-truth';
        resultTruth.textContent = truth + ' m';

        var resultVerdict = document.createElement('div');
        resultVerdict.className = 'q-hot-result-verdict ' + (correct ? 'correct' : 'wrong');
        if (correct) {
          resultVerdict.textContent = 'Within 25% — correct! (' + guess + ' m)';
        } else {
          var diffM = guess - truth;
          var dir = diffM > 0 ? 'too shallow' : 'too deep';
          resultVerdict.textContent = Math.abs(diffM) + ' m off — ' + dir;
        }

        resultWrap.appendChild(resultLabel);
        resultWrap.appendChild(resultTruth);
        resultWrap.appendChild(resultVerdict);
        wrap.appendChild(resultWrap);

        ctx.complete({ correct: correct, quality: quality });
      });

      // Return cleanup (nothing to tear down since we hold no global state)
      return function () {};
    }
  });
})();
