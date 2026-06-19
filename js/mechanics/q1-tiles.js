// Q1 — Tile Tap: "Select all images with a hammerhead." (REFERENCE MECHANIC)
// This is the canonical example for all other mechanics. Note:
//   - self-contained: injects its own scoped CSS (.q-tiles-*)
//   - renders into ctx.content, never touches the shell/footer
//   - image fallback to shark.emoji via onerror
//   - calls ctx.complete({correct}) exactly once, then locks input
(function () {
  const STYLE_ID = 'q-tiles-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-tiles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:6px; }
      .q-tiles-cell { position:relative; aspect-ratio:1; border:2px solid transparent; border-radius:3px;
        overflow:hidden; cursor:pointer; background:#e8eef2; }
      .q-tiles-cell img { width:100%; height:100%; object-fit:cover; display:block; }
      .q-tiles-cell.sel { border-color: var(--captcha-blue); }
      .q-tiles-cell.sel::after { content:"✓"; position:absolute; top:3px; left:3px; width:18px; height:18px;
        background:var(--captcha-blue); color:#fff; border-radius:50%; font-size:12px; display:flex;
        align-items:center; justify-content:center; }
      .q-tiles-verify { margin-top:10px; }
      .q-tiles-grid.locked .q-tiles-cell { pointer-events:none; }
    `;
    document.head.appendChild(el);
  }

  SHARK.registerMechanic('tiles', {
    fullBleed: false,
    timerSeconds: 20,
    mount: function (ctx) {
      injectStyle();
      ctx.setInstruction('Select all images with a ' + (ctx.shark.name || 'hammerhead') + '.');
      ctx.setCaption('Tip: hammerheads have the wide, mallet-shaped head (cephalofoil).');

      // 9 tiles: some are the target shark, the rest are decoys.
      const target = ctx.shark;
      const decoyIds = ['nurse', 'reef', 'lemon', 'blacktip', 'mako', 'bull'];
      const cells = [];
      const targetCount = 4;
      for (let i = 0; i < targetCount; i++) cells.push({ shark: target, isTarget: true });
      const decoys = SHARK.shuffle(decoyIds).slice(0, 9 - targetCount);
      decoys.forEach(function (id) { cells.push({ shark: SHARK.getShark(id), isTarget: false }); });
      const tiles = SHARK.shuffle(cells);

      const grid = document.createElement('div');
      grid.className = 'q-tiles-grid';
      tiles.forEach(function (t, i) {
        const cell = document.createElement('div');
        cell.className = 'q-tiles-cell';
        if (t.shark.img) {
          const img = document.createElement('img');
          img.src = t.shark.img;
          img.alt = t.shark.name;
          img.onerror = function () {
            cell.classList.add('shark-tile-fallback');
            cell.textContent = t.shark.emoji || '🦈';
            img.remove();
          };
          cell.appendChild(img);
        } else {
          cell.classList.add('shark-tile-fallback');
          cell.textContent = t.shark.emoji || '🦈';
        }
        cell.addEventListener('click', function () { cell.classList.toggle('sel'); });
        cell._isTarget = t.isTarget;
        grid.appendChild(cell);
      });
      ctx.content.appendChild(grid);

      const verify = document.createElement('button');
      verify.className = 'btn q-tiles-verify';
      verify.textContent = 'Verify';
      verify.addEventListener('click', function () {
        grid.classList.add('locked');
        let correct = true;
        Array.prototype.forEach.call(grid.children, function (cell) {
          const sel = cell.classList.contains('sel');
          if (sel !== !!cell._isTarget) correct = false;
        });
        ctx.complete({ correct: correct });
      });
      ctx.content.appendChild(verify);
    },
  });
})();
