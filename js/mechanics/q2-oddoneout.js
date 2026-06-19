// Q2 — Odd One Out: 3×3 grid; one cell is a different species (the impostor).
// Themed around the nurse shark. User taps the one cell that does NOT belong.
// Calls ctx.complete({correct}) exactly once, then locks input.
(function () {
  const STYLE_ID = 'q-odd-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      .q-odd-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        margin-top: 6px;
      }
      .q-odd-cell {
        position: relative;
        aspect-ratio: 1;
        border: 2px solid transparent;
        border-radius: 3px;
        overflow: hidden;
        cursor: pointer;
        background: #e8eef2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        transition: border-color 0.15s;
      }
      .q-odd-cell img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .q-odd-cell:hover:not(.q-odd-locked) {
        border-color: var(--captcha-blue);
      }
      .q-odd-cell.q-odd-selected {
        border-color: var(--captcha-blue);
      }
      .q-odd-cell.q-odd-correct {
        border-color: var(--biolum);
      }
      .q-odd-cell.q-odd-wrong {
        border-color: var(--wrong-red);
      }
      .q-odd-grid.q-odd-locked .q-odd-cell {
        pointer-events: none;
      }
      .q-odd-label {
        position: absolute;
        bottom: 2px;
        left: 0;
        right: 0;
        text-align: center;
        font: 9px var(--font-ui, 'Space Grotesk', sans-serif);
        color: #fff;
        background: rgba(0, 0, 0, 0.45);
        padding: 1px 2px;
      }
    `;
    document.head.appendChild(el);
  }

  SHARK.registerMechanic('oddoneout', {
    fullBleed: false,
    timerSeconds: 18,
    mount: function (ctx) {
      injectStyle();

      // Primary theme shark is nurse (ctx.shark), the impostor is a different species.
      const primary = ctx.shark || SHARK.getShark('nurse');
      // Pick one impostor from a different-looking set.
      const impostorPool = ['hammerhead', 'whale', 'tiger', 'mako', 'thresher', 'goblin', 'great-white'];
      const impostorId = SHARK.shuffle(impostorPool)[0];
      const impostor = SHARK.getShark(impostorId);

      ctx.setInstruction('Which one does NOT belong? Tap the odd shark out.');
      ctx.setCaption(
        'Spot the impostor — 8 cells share the same species; one is a stranger.'
      );

      // Build 8 primary + 1 impostor cells, shuffle.
      const cellData = [];
      for (let i = 0; i < 8; i++) cellData.push({ shark: primary, isImpostor: false });
      cellData.push({ shark: impostor, isImpostor: true });
      const shuffled = SHARK.shuffle(cellData);

      const grid = document.createElement('div');
      grid.className = 'q-odd-grid';

      let completed = false;

      shuffled.forEach(function (data) {
        const cell = document.createElement('div');
        cell.className = 'q-odd-cell';
        cell._isImpostor = data.isImpostor;

        if (data.shark && data.shark.img) {
          const img = document.createElement('img');
          img.src = data.shark.img;
          img.alt = data.shark.name;
          img.onerror = function () {
            cell.classList.add('shark-tile-fallback');
            cell.textContent = (data.shark.emoji || '🦈');
            img.remove();
          };
          cell.appendChild(img);
        } else {
          cell.classList.add('shark-tile-fallback');
          cell.textContent = (data.shark && data.shark.emoji) || '🦈';
        }

        // Small species label for accessibility / fun.
        const label = document.createElement('span');
        label.className = 'q-odd-label';
        label.textContent = data.shark ? data.shark.name : '';
        cell.appendChild(label);

        cell.addEventListener('click', function () {
          if (completed) return;
          completed = true;
          grid.classList.add('q-odd-locked');

          const correct = !!cell._isImpostor;

          // Visual feedback on all cells.
          Array.prototype.forEach.call(grid.children, function (c) {
            if (c._isImpostor) {
              c.classList.add('q-odd-correct');
            }
          });
          if (!correct) {
            cell.classList.add('q-odd-wrong');
          }

          ctx.complete({ correct: correct });
        });

        grid.appendChild(cell);
      });

      ctx.content.appendChild(grid);
    },
  });
})();
