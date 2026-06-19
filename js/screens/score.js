// Score Screen — SharkCAPTCHA
// Registered via SHARK.registerScreen('score', ...).
// Also defines SHARK.tierFor(state) used by the router's shareText().
(function () {
  var STYLE_ID = 'sc-score-style';

  var TIERS = [
    { name: 'Baby Shark',  emoji: '🐣', threshold: 0    },
    { name: 'Nurse Shark', emoji: '🦈', threshold: 1200 },
    { name: 'Bull Shark',  emoji: '🦈', threshold: 2800 },
    { name: 'Tiger Shark', emoji: '🦈', threshold: 4800 },
    { name: 'Great White', emoji: '🦷', threshold: 7000 },
    { name: 'Whale Shark', emoji: '🐳', threshold: 9000 },
  ];

  // Performance score = points + (accuracy * 2000 bonus)
  // accuracy is 0-1 (correctCount / total)
  function perfScore(state) {
    var total = state.answers ? state.answers.length : 0;
    var accuracy = total > 0 ? state.correctCount / total : 0;
    return state.points + accuracy * 2000;
  }

  // SHARK.tierFor — also called by router.js shareText()
  SHARK.tierFor = function (state) {
    var score = perfScore(state);
    var tier = TIERS[0];
    for (var i = 0; i < TIERS.length; i++) {
      if (score >= TIERS[i].threshold) tier = TIERS[i];
    }
    return tier.name;
  };

  function getTierIndex(state) {
    var score = perfScore(state);
    var idx = 0;
    for (var i = 0; i < TIERS.length; i++) {
      if (score >= TIERS[i].threshold) idx = i;
    }
    return idx;
  }

  function getTierEmoji(state) {
    return TIERS[getTierIndex(state)].emoji;
  }

  function flavorCopy(state) {
    var watched = state.onboarding && state.onboarding.watched;
    if (watched === 'every-year') return 'Shark Week veteran.';
    if (watched === 'never') return 'Newcomer to the deep — not bad.';
    return '';
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = [
      /* Score screen layout */
      '.sc-score-stage{flex:1;display:flex;align-items:flex-start;justify-content:center;',
        'padding:20px 14px;overflow-y:auto;}',
      '.sc-card{width:100%;background:var(--card-white);border:1px solid var(--border-gray);',
        'border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.08);overflow:hidden;}',

      /* Card header */
      '.sc-card-header{background:var(--ocean-deep);padding:16px 18px 14px;text-align:center;}',
      '.sc-header-title{display:block;font-family:var(--font-ui);font-size:13px;font-weight:600;',
        'color:var(--biolum);letter-spacing:.1em;text-transform:uppercase;}',
      '.sc-header-sub{display:block;font-family:var(--font-ui);font-size:10px;',
        'color:rgba(255,255,255,.5);margin-top:4px;}',

      /* Tier reveal */
      '.sc-tier-block{padding:20px 18px 10px;text-align:center;}',
      '.sc-tier-emoji{font-size:32px;display:block;line-height:1.2;}',
      '.sc-tier-name{font-family:var(--font-display);font-size:24px;color:var(--ocean-deep);',
        'display:block;margin:6px 0 4px;}',
      '.sc-tier-stats{font-family:var(--font-ui);font-size:12px;color:var(--muted);}',
      '.sc-tier-flavor{font-family:var(--font-ui);font-size:11px;color:var(--captcha-blue);',
        'margin-top:4px;display:block;}',

      /* Thermometer */
      '.sc-therm{padding:14px 18px 18px;}',
      '.sc-therm-track{position:relative;height:8px;background:#e7e7e7;border-radius:4px;',
        'width:100%;overflow:visible;}',
      '.sc-therm-fill{height:100%;border-radius:4px;',
        'background:linear-gradient(90deg,var(--ocean-deep),var(--biolum));',
        'transition:width .5s cubic-bezier(.4,0,.2,1);}',
      '.sc-therm-dot{position:absolute;top:50%;transform:translate(-50%,-50%);',
        'width:14px;height:14px;border-radius:50%;background:var(--ocean-deep);',
        'border:2px solid var(--biolum);box-shadow:0 0 6px rgba(0,245,212,.5);}',
      '.sc-therm-labels{display:flex;justify-content:space-between;margin-top:8px;}',
      '.sc-therm-label{font-family:var(--font-ui);font-size:9px;color:#aaa;text-align:center;',
        'flex:1;line-height:1.3;word-break:break-word;}',
      '.sc-therm-label.active{color:var(--ocean-deep);font-weight:600;}',

      /* Charity CTA */
      '.sc-charity{margin:0 12px 14px;padding:14px 14px 16px;background:#f0f8ff;',
        'border:1px solid #b5d4f4;border-radius:4px;}',
      '.sc-charity-eyebrow{display:block;font-family:var(--font-ui);font-size:10px;',
        'color:var(--captcha-blue);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}',
      '.sc-charity-name{display:block;font-family:var(--font-ui);font-size:13px;font-weight:600;',
        'color:var(--ocean-deep);margin-bottom:4px;}',
      '.sc-charity-desc{font-family:var(--font-ui);font-size:11px;color:#555;',
        'line-height:1.4;margin-bottom:12px;}',

      /* Actions */
      '.sc-actions{padding:0 12px 14px;display:flex;flex-direction:column;gap:10px;',
        'align-items:center;}',
      '.sc-share-confirm{font-family:var(--font-ui);font-size:11px;color:var(--captcha-blue);',
        'height:16px;text-align:center;transition:opacity .3s;}',

      /* Footer */
      '.sc-footer{padding:10px 16px 14px;border-top:1px solid #f0f0f0;text-align:center;',
        'font-family:var(--font-ui);font-size:10px;color:var(--attr);}',
    ].join('');
    document.head.appendChild(el);
  }

  SHARK.registerScreen('score', {
    mount: function (root, ctx) {
      injectStyle();

      var s = SHARK.state;
      var total = s.answers ? s.answers.length : 0;
      var tierIdx = getTierIndex(s);
      var tierName = TIERS[tierIdx].name;
      var tierEmoji = TIERS[tierIdx].emoji;
      var flavor = flavorCopy(s);

      // ---- Build DOM ----

      // Outer stage wrapper
      var stage = document.createElement('div');
      stage.className = 'sc-score-stage';

      var card = document.createElement('div');
      card.className = 'sc-card';
      stage.appendChild(card);

      // --- Card header ---
      var header = document.createElement('div');
      header.className = 'sc-card-header';
      header.innerHTML =
        '<span class="sc-header-title">✓ Verification complete</span>' +
        '<span class="sc-header-sub">SharkCAPTCHA · ' + s.correctCount + '/' + total + ' questions</span>';
      card.appendChild(header);

      // --- Tier reveal ---
      var tierBlock = document.createElement('div');
      tierBlock.className = 'sc-tier-block';

      var emojiEl = document.createElement('span');
      emojiEl.className = 'sc-tier-emoji';
      emojiEl.textContent = tierEmoji;
      tierBlock.appendChild(emojiEl);

      var nameEl = document.createElement('span');
      nameEl.className = 'sc-tier-name';
      nameEl.textContent = tierName;
      tierBlock.appendChild(nameEl);

      var statsEl = document.createElement('span');
      statsEl.className = 'sc-tier-stats';
      statsEl.textContent = s.points.toLocaleString() + ' pts · ' + s.correctCount + '/' + total + ' correct';
      tierBlock.appendChild(statsEl);

      if (flavor) {
        var flavorEl = document.createElement('span');
        flavorEl.className = 'sc-tier-flavor';
        flavorEl.textContent = flavor;
        tierBlock.appendChild(flavorEl);
      }

      card.appendChild(tierBlock);

      // --- Thermometer ---
      var therm = document.createElement('div');
      therm.className = 'sc-therm';

      var track = document.createElement('div');
      track.className = 'sc-therm-track';

      var fillPct = ((tierIdx + 1) / TIERS.length) * 100;
      // dot sits at center of the tier's segment
      var dotPct = ((tierIdx + 0.5) / TIERS.length) * 100;

      var fill = document.createElement('div');
      fill.className = 'sc-therm-fill';
      fill.style.width = '0%';
      track.appendChild(fill);

      var dot = document.createElement('div');
      dot.className = 'sc-therm-dot';
      dot.style.left = '0%';
      track.appendChild(dot);

      therm.appendChild(track);

      // Tier labels
      var labels = document.createElement('div');
      labels.className = 'sc-therm-labels';
      TIERS.forEach(function (t, i) {
        var lbl = document.createElement('span');
        lbl.className = 'sc-therm-label' + (i === tierIdx ? ' active' : '');
        lbl.textContent = t.name;
        labels.appendChild(lbl);
      });
      therm.appendChild(labels);
      card.appendChild(therm);

      // Animate the fill + dot after paint
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = fillPct + '%';
          dot.style.left = dotPct + '%';
        });
      });

      // --- Charity CTA ---
      var charity = document.createElement('div');
      charity.className = 'sc-charity';

      var eyebrow = document.createElement('span');
      eyebrow.className = 'sc-charity-eyebrow';
      eyebrow.textContent = 'You can ID a shark — now protect them';
      charity.appendChild(eyebrow);

      var charityName = document.createElement('span');
      charityName.className = 'sc-charity-name';
      charityName.textContent = 'Marine Megafauna Foundation';
      charity.appendChild(charityName);

      var charityDesc = document.createElement('p');
      charityDesc.className = 'sc-charity-desc';
      charityDesc.textContent = 'Satellite-tagging whale sharks & manta rays to shape ocean policy.';
      charity.appendChild(charityDesc);

      var donateBtn = document.createElement('a');
      donateBtn.className = 'btn';
      donateBtn.href = 'https://marinemegafauna.org';
      donateBtn.target = '_blank';
      donateBtn.rel = 'noopener noreferrer';
      donateBtn.textContent = 'Donate';
      charity.appendChild(donateBtn);

      card.appendChild(charity);

      // --- Secondary actions ---
      var actions = document.createElement('div');
      actions.className = 'sc-actions';

      var shareBtn = document.createElement('button');
      shareBtn.className = 'btn btn-ghost';
      shareBtn.textContent = 'Share your shark tier 🦈';
      actions.appendChild(shareBtn);

      var shareConfirm = document.createElement('div');
      shareConfirm.className = 'sc-share-confirm';
      shareConfirm.style.opacity = '0';
      actions.appendChild(shareConfirm);

      shareBtn.addEventListener('click', function () {
        var text = ctx.shareText ? ctx.shareText() : (tierName + ' 🦈');
        if (navigator.share) {
          navigator.share({ text: text }).catch(function () {});
        } else {
          navigator.clipboard.writeText(text).then(function () {
            shareConfirm.textContent = 'Copied!';
            shareConfirm.style.opacity = '1';
            setTimeout(function () { shareConfirm.style.opacity = '0'; }, 2000);
          }).catch(function () {
            shareConfirm.textContent = 'Unable to copy.';
            shareConfirm.style.opacity = '1';
            setTimeout(function () { shareConfirm.style.opacity = '0'; }, 2000);
          });
        }
      });

      var tryAgainBtn = document.createElement('button');
      tryAgainBtn.className = 'btn-link';
      tryAgainBtn.textContent = 'Try again';
      tryAgainBtn.addEventListener('click', function () {
        if (ctx.restart) ctx.restart();
      });
      actions.appendChild(tryAgainBtn);

      card.appendChild(actions);

      // --- Card footer ---
      var footer = document.createElement('div');
      footer.className = 'sc-footer';
      footer.textContent = 'SharkCAPTCHA · Privacy · Terms · Photo credits on file';
      card.appendChild(footer);

      // Mount into root
      root.innerHTML = '';
      root.appendChild(stage);
    },
  });
})();
