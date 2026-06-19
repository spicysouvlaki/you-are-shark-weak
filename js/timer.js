// Timer checkbox controller. Drives --fill-pct on the checkbox + header progress bar.
// Fill grows from 0→100% as time elapses (bottom-to-top on the box, left-to-right on the bar).
SHARK.createTimer = function (checkboxEl, progressEl) {
  let interval = null;
  let totalMs = 0;
  let elapsedMs = 0;
  let onExpire = null;
  const DANGER_S = 5;

  function setPct(pct) {
    checkboxEl.style.setProperty('--fill-pct', pct);
    if (progressEl) progressEl.style.setProperty('--fill-pct', pct);
  }

  function tick() {
    elapsedMs += 100;
    const remaining = Math.max(0, totalMs - elapsedMs);
    const pct = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;
    setPct(pct);
    if (remaining / 1000 <= DANGER_S) {
      checkboxEl.classList.add('danger');
      if (progressEl) progressEl.classList.add('danger');
    }
    if (remaining <= 0) {
      stop();
      if (onExpire) onExpire();
    }
  }

  function start(seconds, expireCb) {
    stop();
    totalMs = seconds * 1000;
    elapsedMs = 0;
    onExpire = expireCb;
    checkboxEl.classList.remove('danger', 'correct', 'wrong');
    if (progressEl) progressEl.classList.remove('danger');
    setPct(0);
    interval = setInterval(tick, 100);
  }

  function stop() {
    if (interval) { clearInterval(interval); interval = null; }
  }

  function secondsRemaining() {
    return Math.max(0, (totalMs - elapsedMs) / 1000);
  }

  function succeed() {
    stop();
    checkboxEl.classList.remove('wrong', 'danger');
    checkboxEl.classList.add('correct');
  }

  function fail() {
    stop();
    checkboxEl.classList.remove('correct');
    checkboxEl.classList.add('wrong');
  }

  return { start, stop, succeed, fail, secondsRemaining };
};
