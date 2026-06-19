// Q5 — Miami Shark Dash: 30-second side-scrolling mini-game.
// Self-contained IIFE. Registers mechanic id 'minigame' with fullBleed:true.
// Mounts into ctx.root (a full-bleed flex-column div).
//
// Score → quality curve:
//   CEILING = 1500 points (generous; ~10 fish collected at increasing speed bonuses).
//   FLOOR   = 0.15 (players who survived any portion get partial credit).
//   quality = FLOOR + (1 - FLOOR) * min(1, score / CEILING)
//   So 0 score → 0.15, 1500+ score → 1.0, partial scores interpolate linearly.
//   This means even a player who dodged nothing but survived earns ≥0.15 quality.
(function () {
  const STYLE_ID = 'q-dash-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-dash-wrap {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        flex: 1;
        min-height: 0;
        position: relative;
        overflow: hidden;
        background: #001f33;
      }
      .q-dash-titlebar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 14px;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        flex-shrink: 0;
        z-index: 10;
      }
      .q-dash-title {
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        font-size: 13px;
        font-weight: 600;
        color: var(--biolum, #00F5D4);
        letter-spacing: 0.08em;
      }
      .q-dash-countdown {
        font-family: var(--font-mono, monospace);
        font-size: 13px;
        color: #ffffff;
      }
      .q-dash-canvas-wrap {
        flex: 1;
        min-height: 0;
        position: relative;
        overflow: hidden;
      }
      .q-dash-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
      .q-dash-hint {
        flex-shrink: 0;
        text-align: center;
        padding: 5px 0 6px;
        font-family: var(--font-ui, 'Space Grotesk', sans-serif);
        font-size: 10px;
        color: rgba(255,255,255,0.5);
        background: rgba(0,0,0,0.35);
        z-index: 10;
      }
    `;
    document.head.appendChild(el);
  }

  SHARK.registerMechanic('minigame', {
    fullBleed: true,
    mount: function (ctx) {
      injectStyle();

      // ── DOM structure ───────────────────────────────────────────────
      const wrap = document.createElement('div');
      wrap.className = 'q-dash-wrap';

      const titlebar = document.createElement('div');
      titlebar.className = 'q-dash-titlebar';

      const titleEl = document.createElement('span');
      titleEl.className = 'q-dash-title';
      titleEl.textContent = 'MIAMI SHARK DASH';

      const countdownEl = document.createElement('span');
      countdownEl.className = 'q-dash-countdown';
      countdownEl.textContent = '⏱ 00:30';

      titlebar.appendChild(titleEl);
      titlebar.appendChild(countdownEl);

      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'q-dash-canvas-wrap';

      const canvas = document.createElement('canvas');
      canvas.className = 'q-dash-canvas';

      canvasWrap.appendChild(canvas);

      const hint = document.createElement('div');
      hint.className = 'q-dash-hint';
      hint.textContent = 'Tap & hold to dive · release rise';

      wrap.appendChild(titlebar);
      wrap.appendChild(canvasWrap);
      wrap.appendChild(hint);
      ctx.root.appendChild(wrap);

      // ── Canvas + DPR setup ──────────────────────────────────────────
      const c = canvas;
      const dpr = window.devicePixelRatio || 1;
      let W = 0, H = 0;

      function resizeCanvas() {
        W = canvasWrap.clientWidth  || 375;
        H = canvasWrap.clientHeight || 300;
        c.width  = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
        c.style.width  = W + 'px';
        c.style.height = H + 'px';
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const ctx2d = c.getContext('2d');
      resizeCanvas();

      // ── Game state ──────────────────────────────────────────────────
      const GAME_DURATION = 30;        // seconds
      const CEILING = 1500;            // score ceiling for quality=1
      const FLOOR   = 0.15;            // quality floor for any survivor
      const FISH_EMOJIS = ['🐟', '🐠', '🐡'];
      const FISH_SCORE = 50;
      const HAZARD_EMOJIS = ['🪝', '🕸'];
      const BASE_SPEED = 120;          // px/s at t=0
      const SPEED_GROWTH = 3.5;        // extra px/s per second elapsed

      let score = 0;
      let gameOver = false;
      let completed = false;
      let diving = false;              // true while held
      let startTime = null;
      let lastTime = null;
      let rafId = null;

      // Player
      const SHARK_SIZE = 32;
      const playerX = 80;
      let playerY = 0;                 // set after resize
      let playerVY = 0;
      const DIVE_ACCEL  =  420;        // px/s² downward while held
      const RISE_ACCEL  = -340;        // px/s² upward when released (gravity-like)
      const MAX_VY      =  340;

      // Score pop particles
      const pops = [];

      // Objects (fish and hazards)
      const objects = [];
      let spawnTimer = 0;
      const SPAWN_INTERVAL_MIN = 0.55; // seconds
      const SPAWN_INTERVAL_MAX = 1.1;
      let nextSpawn = randomBetween(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX);

      // Countdown
      let timeLeft = GAME_DURATION;

      function randomBetween(a, b) {
        return a + Math.random() * (b - a);
      }

      function surfaceY() { return H * 0.12; }
      function seabedY()  { return H * 0.90; }

      function initPlayer() {
        playerY = H * 0.45;
        playerVY = 0;
      }

      // ── Input ───────────────────────────────────────────────────────
      function onDiveStart(e) {
        if (gameOver) return;
        if (e.cancelable) e.preventDefault();
        diving = true;
      }
      function onDiveEnd(e) {
        if (e && e.cancelable) e.preventDefault();
        diving = false;
      }
      function onKeyDown(e) {
        if (e.code === 'Space' && !e.repeat) { diving = true; e.preventDefault(); }
      }
      function onKeyUp(e) {
        if (e.code === 'Space') { diving = false; }
      }

      c.addEventListener('touchstart',  onDiveStart, { passive: false });
      c.addEventListener('touchend',    onDiveEnd,   { passive: false });
      c.addEventListener('touchcancel', onDiveEnd,   { passive: false });
      c.addEventListener('mousedown',   onDiveStart);
      c.addEventListener('mouseup',     onDiveEnd);
      c.addEventListener('mouseleave',  onDiveEnd);
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup',   onKeyUp);

      // ── Cleanup ─────────────────────────────────────────────────────
      function cleanup() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        clearTimeout(hardCapTimer);
        c.removeEventListener('touchstart',  onDiveStart);
        c.removeEventListener('touchend',    onDiveEnd);
        c.removeEventListener('touchcancel', onDiveEnd);
        c.removeEventListener('mousedown',   onDiveStart);
        c.removeEventListener('mouseup',     onDiveEnd);
        c.removeEventListener('mouseleave',  onDiveEnd);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup',   onKeyUp);
      }

      // ── Complete (guard: once only) ──────────────────────────────────
      function finish() {
        if (completed) return;
        completed = true;
        gameOver = true;
        cleanup();
        const quality = FLOOR + (1 - FLOOR) * Math.min(1, score / CEILING);
        ctx.complete({ quality: quality });
      }

      // Hard 30s cap
      const hardCapTimer = setTimeout(finish, GAME_DURATION * 1000 + 200);

      // ── Spawn objects ────────────────────────────────────────────────
      function spawnObject(speed) {
        const isHazard = Math.random() < 0.30;  // 30% chance hazard
        const emoji = isHazard
          ? HAZARD_EMOJIS[Math.floor(Math.random() * HAZARD_EMOJIS.length)]
          : FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)];
        // Y: fish anywhere in swim zone; hazards cluster near mid / surface
        const yMin = surfaceY() + 10;
        const yMax = seabedY() - 10;
        objects.push({
          x: W + 30,
          y: randomBetween(yMin, yMax),
          emoji: emoji,
          isHazard: isHazard,
          size: isHazard ? 24 : 20,
          alive: true,
        });
      }

      // ── Collision ─────────────────────────────────────────────────────
      function checkCollision(obj) {
        const hitR = obj.size * 0.45;
        const dx = playerX - obj.x;
        const dy = (playerY + SHARK_SIZE * 0.1) - obj.y;
        return Math.sqrt(dx * dx + dy * dy) < (SHARK_SIZE * 0.38 + hitR);
      }

      // ── Draw helpers ──────────────────────────────────────────────────
      function drawOceanBg(t) {
        // Gradient: #003a5c (top) → #001f33 (bottom) per SPEC
        const grad = ctx2d.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#003a5c');
        grad.addColorStop(1, '#001f33');
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(0, 0, W, H);

        // Wave shimmer near surface
        const sy = surfaceY();
        ctx2d.save();
        ctx2d.globalAlpha = 0.18;
        for (let i = 0; i < 4; i++) {
          const waveY = sy + i * 3.5;
          const phase = t * 1.2 + i * 0.8;
          ctx2d.beginPath();
          ctx2d.strokeStyle = '#7ecfee';
          ctx2d.lineWidth = 1.5;
          for (let x = 0; x <= W; x += 2) {
            const y = waveY + Math.sin((x / W) * Math.PI * 6 + phase) * 2.5;
            x === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
          }
          ctx2d.stroke();
        }
        ctx2d.restore();

        // Sunlight caustic rays from surface
        ctx2d.save();
        ctx2d.globalAlpha = 0.04;
        ctx2d.fillStyle = '#a0dff8';
        for (let r = 0; r < 5; r++) {
          const rx = (W * 0.15) + r * (W * 0.17) + Math.sin(t * 0.3 + r) * 10;
          ctx2d.beginPath();
          ctx2d.moveTo(rx, sy);
          ctx2d.lineTo(rx - 18, H);
          ctx2d.lineTo(rx + 18, H);
          ctx2d.closePath();
          ctx2d.fill();
        }
        ctx2d.restore();
      }

      function drawDepthBar() {
        // Right edge depth bar
        const barW = 6;
        const barX = W - barW - 4;
        const barTop = surfaceY();
        const barH = seabedY() - barTop;

        ctx2d.save();
        const grad = ctx2d.createLinearGradient(0, barTop, 0, barTop + barH);
        grad.addColorStop(0, '#7ecfee');
        grad.addColorStop(1, '#001020');
        ctx2d.fillStyle = grad;
        ctx2d.globalAlpha = 0.55;
        // Use fillRect for broad browser compat (roundRect not universal on older iOS WebKit)
        ctx2d.fillRect(barX, barTop, barW, barH);

        // Indicator dot
        const pct = Math.max(0, Math.min(1, (playerY - barTop) / barH));
        const dotY = barTop + pct * barH;
        ctx2d.globalAlpha = 0.9;
        ctx2d.fillStyle = '#00F5D4';
        ctx2d.beginPath();
        ctx2d.arc(barX + barW / 2, dotY, 4, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }

      function drawPlayer() {
        ctx2d.font = SHARK_SIZE + 'px serif';
        ctx2d.textAlign = 'left';
        ctx2d.textBaseline = 'middle';
        // Flip: shark faces right (default emoji direction is right, so no flip needed)
        ctx2d.fillText('🦈', playerX - SHARK_SIZE / 2, playerY);
      }

      function drawObjects() {
        objects.forEach(function (obj) {
          if (!obj.alive) return;
          ctx2d.font = obj.size + 'px serif';
          ctx2d.textAlign = 'center';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText(obj.emoji, obj.x, obj.y);
        });
      }

      function drawPops(dt) {
        ctx2d.font = '13px var(--font-mono, monospace)';
        ctx2d.textAlign = 'center';
        ctx2d.textBaseline = 'middle';
        for (let i = pops.length - 1; i >= 0; i--) {
          const p = pops[i];
          p.life -= dt;
          p.y -= 38 * dt;
          if (p.life <= 0) { pops.splice(i, 1); continue; }
          const alpha = Math.min(1, p.life / 0.5);
          ctx2d.globalAlpha = alpha;
          ctx2d.fillStyle = '#00F5D4';
          ctx2d.fillText(p.text, p.x, p.y);
        }
        ctx2d.globalAlpha = 1;
      }

      function drawScore() {
        ctx2d.font = '600 14px var(--font-mono, monospace)';
        ctx2d.fillStyle = '#00F5D4';
        ctx2d.textAlign = 'left';
        ctx2d.textBaseline = 'top';
        ctx2d.fillText(score + ' pts', 10, surfaceY() + 6);
      }

      function drawGameOver() {
        ctx2d.save();
        ctx2d.fillStyle = 'rgba(0,0,0,0.55)';
        ctx2d.fillRect(0, 0, W, H);
        ctx2d.font = '600 22px var(--font-ui, sans-serif)';
        ctx2d.fillStyle = '#ffffff';
        ctx2d.textAlign = 'center';
        ctx2d.textBaseline = 'middle';
        ctx2d.fillText('🦈 WIPEOUT', W / 2, H / 2 - 16);
        ctx2d.font = '14px var(--font-mono, monospace)';
        ctx2d.fillStyle = '#00F5D4';
        ctx2d.fillText(score + ' pts', W / 2, H / 2 + 16);
        ctx2d.restore();
      }

      // ── Main loop ─────────────────────────────────────────────────────
      function loop(ts) {
        if (!startTime) startTime = ts;
        const elapsed = (ts - startTime) / 1000;
        const dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.05) : 0.016;
        lastTime = ts;

        // Update countdown display
        timeLeft = Math.max(0, GAME_DURATION - elapsed);
        const mins = Math.floor(timeLeft / 60);
        const secs = Math.floor(timeLeft % 60);
        countdownEl.textContent = '⏱ ' +
          String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

        if (timeLeft <= 0 && !gameOver) {
          gameOver = true;
          // Draw one last frame then finish
          drawFrame(elapsed, dt);
          // Small delay to show final frame before advancing
          setTimeout(finish, 600);
          rafId = null;
          return;
        }

        if (!gameOver) {
          // Speed increases over time
          const speed = BASE_SPEED + SPEED_GROWTH * elapsed;

          // Player physics
          const accel = diving ? DIVE_ACCEL : RISE_ACCEL;
          playerVY = Math.max(-MAX_VY, Math.min(MAX_VY, playerVY + accel * dt));
          playerY += playerVY * dt;

          // Clamp to swim zone
          const top = surfaceY() + 4;
          const bot = seabedY() - 4;
          if (playerY < top) { playerY = top; playerVY = Math.max(0, playerVY); }
          if (playerY > bot) { playerY = bot; playerVY = Math.min(0, playerVY); }

          // Spawn objects
          spawnTimer += dt;
          if (spawnTimer >= nextSpawn) {
            spawnTimer = 0;
            nextSpawn = randomBetween(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX);
            spawnObject(speed);
          }

          // Move + check objects
          for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (!obj.alive) { objects.splice(i, 1); continue; }
            obj.x -= speed * dt;
            if (obj.x < -40) { objects.splice(i, 1); continue; }

            if (checkCollision(obj)) {
              obj.alive = false;
              if (obj.isHazard) {
                // Hazard hit: game over
                gameOver = true;
                drawFrame(elapsed, dt);
                setTimeout(finish, 900);
                rafId = null;
                return;
              } else {
                // Collectible: add score + pop
                score += FISH_SCORE;
                pops.push({ x: obj.x, y: obj.y, text: '+' + FISH_SCORE, life: 0.85 });
              }
            }
          }
        }

        drawFrame(elapsed, dt);
        rafId = requestAnimationFrame(loop);
      }

      function drawFrame(t, dt) {
        ctx2d.clearRect(0, 0, W, H);
        drawOceanBg(t);
        drawDepthBar();
        drawObjects();
        drawPlayer();
        drawPops(dt);
        drawScore();
        if (gameOver) drawGameOver();
      }

      // ── Start ─────────────────────────────────────────────────────────
      initPlayer();
      rafId = requestAnimationFrame(loop);
    },
  });
})();
