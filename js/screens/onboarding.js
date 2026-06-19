// Onboarding / Landing screen — SharkCAPTCHA
// Renders the full #app with a centered CAPTCHA card, two pill-select questions,
// and a "Begin Verification →" CTA.  Writes SHARK.state.onboarding then calls ctx.next().
(function () {
  var STYLE_ID = 'ob-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = [
      /* browser / status bar strip at top */
      '.ob-statusbar { height:6px; background:var(--ocean-deep); }',

      /* pill groups */
      '.ob-pill-group { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }',

      /* question block */
      '.ob-question { margin-top:18px; }',
      '.ob-question-label {',
      '  font-family:var(--font-ui); font-size:12px; font-weight:500;',
      '  color:#333; line-height:1.4;',
      '}',

      /* display headline */
      '.ob-headline {',
      '  font-family:var(--font-display); font-size:22px;',
      '  color:var(--ocean-deep); line-height:1.25; margin:12px 0 4px;',
      '}',

      /* footer label tweak for this screen */
      '.ob-footer-label {',
      '  font-family:var(--font-ui); font-size:11px; color:#555;',
      '  line-height:1.35; max-width:200px;',
      '}',

      /* static checkbox: lightly filled to 30% */
      '.ob-checkbox { --fill-pct:30; }',

      /* CTA area below card */
      '.ob-cta-wrap { padding:16px 0 0; }',

      /* disabled CTA */
      '.btn[disabled] { opacity:0.45; cursor:not-allowed; pointer-events:none; }',
    ].join('\n');
    document.head.appendChild(el);
  }

  SHARK.registerScreen('onboarding', {
    mount: function (root, ctx) {
      injectStyle();

      /* ── clear whatever was in #app ── */
      root.innerHTML = '';

      /* ══ STATUS BAR (decorative) ══ */
      var statusBar = document.createElement('div');
      statusBar.className = 'ob-statusbar';
      root.appendChild(statusBar);

      /* ══ BROWSER BAR (decorative) ══ */
      var browserBar = document.createElement('div');
      browserBar.className = 'browserbar';
      browserBar.textContent = 'sharkquiz.github.io';
      root.appendChild(browserBar);

      /* ══ STAGE (centers the card) ══ */
      var stage = document.createElement('div');
      stage.className = 'stage';
      root.appendChild(stage);

      /* ══ CAPTCHA CARD ══ */
      var card = document.createElement('div');
      card.className = 'captcha-card';
      stage.appendChild(card);

      /* — card header — */
      var cardHeader = document.createElement('div');
      cardHeader.className = 'card-header';
      card.appendChild(cardHeader);

      /* badge */
      var badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'Shark Week Verification';
      cardHeader.appendChild(badge);

      /* headline */
      var headline = document.createElement('p');
      headline.className = 'ob-headline';
      headline.textContent = 'Prove you actually know sharks.';
      cardHeader.appendChild(headline);

      /* — card content — */
      var cardContent = document.createElement('div');
      cardContent.className = 'card-content';
      card.appendChild(cardContent);

      /* state: track selections */
      var watchedValue = null;  // 'never' | 'yes' | 'every-year'
      var loveValue = null;     // 'meh' | 'like' | 'obsessed'

      /* ── Question 1 ── */
      var q1 = document.createElement('div');
      q1.className = 'ob-question';

      var q1Label = document.createElement('p');
      q1Label.className = 'ob-question-label';
      q1Label.textContent = 'Did you watch Shark Week as a kid?';
      q1.appendChild(q1Label);

      var q1Pills = document.createElement('div');
      q1Pills.className = 'ob-pill-group';

      var watchedOptions = [
        { label: 'Yes',        value: 'yes'        },
        { label: 'Every year', value: 'every-year' },
        { label: 'Never',      value: 'never'       },
      ];

      watchedOptions.forEach(function (opt) {
        var pill = document.createElement('button');
        pill.className = 'pill';
        pill.textContent = opt.label;
        pill.setAttribute('type', 'button');
        pill.addEventListener('click', function () {
          watchedValue = opt.value;
          Array.prototype.forEach.call(q1Pills.children, function (p) {
            p.classList.remove('selected');
          });
          pill.classList.add('selected');
          syncCTA();
        });
        q1Pills.appendChild(pill);
      });

      q1.appendChild(q1Pills);
      cardContent.appendChild(q1);

      /* ── Question 2 ── */
      var q2 = document.createElement('div');
      q2.className = 'ob-question';

      var q2Label = document.createElement('p');
      q2Label.className = 'ob-question-label';
      q2Label.textContent = 'How much do you love sharks?';
      q2.appendChild(q2Label);

      var q2Pills = document.createElement('div');
      q2Pills.className = 'ob-pill-group';

      var loveOptions = [
        { label: 'Meh',      value: 'meh'      },
        { label: "Like 'em", value: 'like'      },
        { label: 'Obsessed', value: 'obsessed'  },
      ];

      loveOptions.forEach(function (opt) {
        var pill = document.createElement('button');
        pill.className = 'pill';
        pill.textContent = opt.label;
        pill.setAttribute('type', 'button');
        pill.addEventListener('click', function () {
          loveValue = opt.value;
          Array.prototype.forEach.call(q2Pills.children, function (p) {
            p.classList.remove('selected');
          });
          pill.classList.add('selected');
          syncCTA();
        });
        q2Pills.appendChild(pill);
      });

      q2.appendChild(q2Pills);
      cardContent.appendChild(q2);

      /* — card footer — */
      var cardFooter = document.createElement('div');
      cardFooter.className = 'card-footer';
      card.appendChild(cardFooter);

      /* left side: static timer-checkbox + label */
      var footerLeft = document.createElement('div');
      footerLeft.className = 'footer-left';
      cardFooter.appendChild(footerLeft);

      var checkbox = document.createElement('div');
      checkbox.className = 'timer-checkbox ob-checkbox';
      var fill = document.createElement('div');
      fill.className = 'fill';
      var mark = document.createElement('div');
      mark.className = 'mark';
      checkbox.appendChild(fill);
      checkbox.appendChild(mark);
      footerLeft.appendChild(checkbox);

      var footerLabel = document.createElement('span');
      footerLabel.className = 'ob-footer-label';
      footerLabel.textContent = "I'm not a robot (but I love one apex predator)";
      footerLeft.appendChild(footerLabel);

      /* right side: brand mark */
      var brand = document.createElement('span');
      brand.className = 'brand';
      brand.textContent = '🦈 SharkCAPTCHA';
      cardFooter.appendChild(brand);

      /* ══ CTA BUTTON (below the card, inside stage wrapper) ══ */
      var ctaWrap = document.createElement('div');
      ctaWrap.className = 'ob-cta-wrap';
      stage.appendChild(ctaWrap);

      var cta = document.createElement('button');
      cta.className = 'btn';
      cta.setAttribute('type', 'button');
      cta.setAttribute('disabled', 'disabled');
      cta.textContent = 'Begin Verification →';
      ctaWrap.appendChild(cta);

      /* enable CTA only once both questions answered */
      function syncCTA() {
        if (watchedValue !== null && loveValue !== null) {
          cta.removeAttribute('disabled');
        } else {
          cta.setAttribute('disabled', 'disabled');
        }
      }

      /* on click: store state + advance */
      cta.addEventListener('click', function () {
        SHARK.state.onboarding = {
          watched: watchedValue,
          love: loveValue,
        };
        ctx.next();
      });
    },
  });
})();
