# Integration Contract — SharkCAPTCHA

This file is the **API contract** every subagent builds against. Follow it exactly so
independent files merge into one working app with zero coordination.

## Architecture

- No framework, no build step. Plain `index.html` loading separate `css/` and `js/` files.
- GitHub Pages serves the files directly. Keep total JS+CSS < 200KB (excluding images).
- A single global namespace: `window.SHARK`.
- `index.html` already contains `<script>`/`<link>` tags for **all** planned files (see below).
  **Do not edit `index.html`** unless you are the data/OG agent adding meta tags. Just create
  the file your tag already points to.

## File ownership (each agent owns a disjoint set — never edit another agent's file)

| File | Owner |
|---|---|
| `css/tokens.css`, `css/app.css` | scaffold (done) |
| `js/state.js`, `js/scoring.js`, `js/timer.js`, `js/reveal.js`, `js/router.js`, `js/app.js` | scaffold (done) |
| `js/mechanics/q1-tiles.js` | scaffold (reference example — copy this pattern) |
| `js/mechanics/q2-oddoneout.js`, `q3-truefalse.js`, `q4-sort.js` | Agent: mechanics-A |
| `js/mechanics/q6-spotfake.js`, `q7-shadow.js`, `q8-rank.js` | Agent: mechanics-B |
| `js/mechanics/q9-hotcold.js`, `q10-elimination.js` | Agent: mechanics-C |
| `js/mechanics/q5-minigame.js` | Agent: minigame |
| `js/screens/onboarding.js` | Agent: onboarding |
| `js/screens/score.js` | Agent: score |
| `js/data/sharks.js`, `assets/sharks/*`, `og-image.jpg`, `<head>` meta | Agent: data |

## Global state — `SHARK.state`

```js
SHARK.state = {
  points: 0,
  streak: 0,
  maxStreak: 0,
  questionIndex: 0,          // 0-based index into SHARK.arc
  onboarding: { watched: null, love: null },  // set by onboarding screen
  answers: [],               // pushed by router: { correct, points, quality }
  correctCount: 0,
}
```

## Shark data — `SHARK.sharks` (provided by data agent)

Keyed object. Mechanics reference sharks **by these exact ids**:

```
hammerhead, nurse, whale, blacktip, oceanic-whitetip, tiger, thresher,
goblin, great-white, bull, mako, lemon, reef, basking
```

Each entry:
```js
{
  name: 'Scalloped Hammerhead',
  latin: 'Sphyrna lewini',
  fact: 'One-sentence fact.',
  img: 'assets/sharks/hammerhead.jpg',
  emoji: '🦈',                 // fallback shown if img missing
  maxDepthM: 512,              // used by q9 hot-or-cold
  maxLengthM: 4.3,             // used by q8 rank-em
  habitat: 'reef',             // 'reef' | 'open-ocean' — used by q4
  credit: { creator:'', source:'iNaturalist', license:'CC BY-NC', url:'' }
}
```

**Graceful fallback:** images may not exist yet. Always render `shark.emoji` (or a CSS
gradient tile) when an `<img>` fails (`img.onerror`). Never assume the file is present.

## Registering a question mechanic

Each `js/mechanics/qN-*.js` calls:

```js
SHARK.registerMechanic('tiles', {
  fullBleed: false,        // true only for the mini-game (breaks the card frame)
  timerSeconds: 20,        // countdown length; router auto-starts it (omit/0 = no timer)
  mount(ctx) {
    // build your UI inside ctx.content, wire interactions, then call ctx.complete(...)
    // return an optional cleanup function
  }
});
```

### `ctx` passed to `mount` (card mechanics)

| Field | Description |
|---|---|
| `ctx.content` | The `.card-content` DOM element. Render your mechanic here. |
| `ctx.shark` | The primary shark data object for this question (may be undefined-safe). |
| `ctx.difficulty` | `'easy' \| 'med' \| 'hard'`. |
| `ctx.setInstruction(text)` | Sets the header instruction line. |
| `ctx.setCaption(html)` | Sets the attribution/caption line under the content. |
| `ctx.complete({ correct, quality })` | **Call once** when the question is answered. `correct` boolean. `quality` optional 0..1 for partial credit (defaults to `correct?1:0`). Router stops the timer, computes points, shows the reveal, advances. |
| `ctx.timer` | `{ succeed(), fail() }` to flip the checkbox to ✓/✗ early (router also does this on complete). |

- The router **auto-starts** the timer using `timerSeconds`. On expiry it calls
  `ctx.complete({ correct:false })` for you. You do not manage the timer yourself.
- After `ctx.complete`, your UI stays visible briefly, then the router swaps in the reveal.
  Disable further input inside your mechanic once completed.

### `ctx` for the mini-game (`fullBleed:true`)

| Field | Description |
|---|---|
| `ctx.root` | A full-bleed stage `<div>` (edge to edge). Mount your `<canvas>` + HUD here. |
| `ctx.complete({ quality })` | Call when the game ends. `quality` 0..1 maps mini-game score → quiz points. |
| `ctx.shark` | The themed shark (whale shark) for the transition caption. |

- No timer checkbox on the mini-game; enforce your own 30s cap with `setTimeout`.

## Scoring — `SHARK.scoring.computePoints(opts)`

Router calls this; mechanics never compute points. Provided by scaffold.
Base points: easy 500 / med 700 / hard 1000, plus a time bonus, scaled by `quality`.

## Registering a full screen (onboarding, score)

These are not questions. They render the whole `#app`. Register via:

```js
SHARK.registerScreen('onboarding', {
  mount(root, ctx) {
    // root = #app element (you own the full screen)
    // ctx.next() — advance to the quiz (onboarding) / restart (score "try again")
  }
});
```

- **Onboarding** writes `SHARK.state.onboarding = { watched, love }` then calls `ctx.next()`.
- **Score** reads `SHARK.state` (points, correctCount, onboarding) and renders the results.
  `ctx.restart()` resets state and reshuffles. `ctx.shareText()` returns a share string.

## Flow (handled by `router.js` + `app.js`)

1. `app.js` builds `SHARK.arc` (10 entries) and mounts the onboarding screen.
2. Onboarding → router runs questions in `arc` order, mounting each mechanic in the card shell.
3. After Q10 → mounts the score screen.

## Design tokens

Use CSS variables from `css/tokens.css` — never hardcode hex:
`--ocean-deep #003049`, `--biolum #00F5D4`, `--captcha-blue #4A90D9`, `--chrome-gray #f0f0f0`,
`--card-white #fff`, `--border-gray #c8c8c8`, `--wrong-red #E24B4A`, `--streak-amber #FFB347`,
`--muted #888`, `--attr #bbb`.
Fonts: `var(--font-ui)` (Space Grotesk), `var(--font-display)` (DM Serif Display), `var(--font-mono)`.

Each mechanic file should inject its **own scoped `<style>`** (prefix class names with the
mechanic id, e.g. `.q-tiles-grid`) to avoid CSS collisions. See `q1-tiles.js` for the pattern.
