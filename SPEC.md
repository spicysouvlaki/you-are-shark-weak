# SharkCAPTCHA — Design Spec

> "Prove you're not a robot. Prove you know sharks."

---

## Concept

A CAPTCHA-themed shark identification quiz for GitHub Pages. The visual joke: the sterile, bureaucratic reCAPTCHA chrome wraps beautiful ocean photography and real shark science. The tension between form UI and wild ocean life is the design, not just the copy.

---

## Color Tokens

| Name | Hex | Usage |
|---|---|---|
| Ocean Deep | `#003049` | Primary brand, score bar, donate button, shark name text |
| Bioluminescent | `#00F5D4` | Accent on dark backgrounds, verified state, streak color |
| CAPTCHA Blue | `#4A90D9` | Timer checkbox fill, selected tiles, links |
| Chrome Gray | `#f0f0f0` | Page background (matches real reCAPTCHA) |
| Card White | `#ffffff` | CAPTCHA card surface |
| Border Gray | `#c8c8c8` | CAPTCHA card border (matches real reCAPTCHA) |
| Wrong Red | `#E24B4A` | Wrong answer state, timer danger zone |
| Streak Amber | `#FFB347` | Streak counter fire indicator |

---

## Typography

| Role | Face | Usage |
|---|---|---|
| Display | DM Serif Display | Shark name reveals, score screen tier, italic for latin names |
| UI | Space Grotesk | All chrome, instructions, scores, labels, attribution |
| Mono | System mono | Point values, timer countdown numbers |

Load via Google Fonts:
```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap
```

Type scale:
- Display: 28px / DM Serif Display regular
- Display italic (latin name): 18px / DM Serif Display italic
- UI heading: 13px / Space Grotesk 500
- UI body: 12px / Space Grotesk 400
- Label/caption: 10px / Space Grotesk 400, color #888
- Attribution: 10px / Space Grotesk 400, color #bbb — styled exactly like reCAPTCHA's "Privacy · Terms"

---

## Signature Mechanic — The Timer Checkbox

**The reCAPTCHA checkbox IS the countdown.**

- Checkbox border fills from bottom to top as timer counts down
- Visual matches exact Google reCAPTCHA grammar — users read it as a timer with zero explanation
- At 5s remaining: fill color transitions from `#4A90D9` → `#E24B4A`
- Correct answer: snaps to blue ✓ with a short CSS scale + opacity micro-animation
- Wrong answer: snaps to red ✗
- Implementation: CSS custom property `--fill-pct` driven by a JS `setInterval` countdown

Every question is anchored by the same component. The joke lands every time.

---

## Screen Specs

### 1 — Onboarding / Landing

**Layout:** Full-width CAPTCHA card on `#f0f0f0` page background, centered, max-width 375px.

**Content (top to bottom):**
- Status bar + browser bar (sharkquiz.github.io) — purely decorative for mobile feel
- Badge: `SHARK WEEK VERIFICATION` in Ocean Deep bg / Bioluminescent text, Space Grotesk 600, letter-spaced
- Display headline: "Prove you actually know sharks." — DM Serif Display, 22px, Ocean Deep
- Question 1: "Did you watch Shark Week as a kid?" — 3 pill buttons: Yes / Every year / Never
- Question 2: "How much do you love sharks?" — 3 pill buttons: Meh / Like 'em / Obsessed
- Selected state: Ocean Deep bg / Bioluminescent text
- Footer (inside card): timer checkbox + "I'm not a robot (but I love one apex predator)" + 🦈 SharkCAPTCHA branding top-right
- CTA button below card: "Begin Verification →" in Ocean Deep, full-width, Space Grotesk 600

**Notes:**
- Onboarding answers are stored in state and affect the score screen copy ("Shark Week veteran" vs "newcomer") — no mechanical scoring impact
- No timer on this screen

---

### 2 — Question Screen (all question types share this shell)

**Shell layout (top to bottom):**

```
┌─────────────────────────────────────┐
│  Score bar: pts | Q# of 10 | streak │  ← Ocean Deep bg, full-width
├─────────────────────────────────────┤
│  Browser bar: sharkquiz.github.io   │  ← white, 1px border-bottom
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────────┐   │
│   │ CAPTCHA CARD                │   │
│   │  ┌─ instruction + timer ──┐ │   │
│   │  │  [mechanic content]    │ │   │
│   │  └────────────────────────┘ │   │
│   │  caption / attribution line │   │
│   │  [checkbox timer] [brand]   │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Score bar:**
- Left: points total (Space Grotesk 600, Bioluminescent on Ocean Deep)
- Center: "Q4 of 10" (Space Grotesk 400, white 50% opacity)
- Right: 🔥 ×N streak (Streak Amber)

**CAPTCHA card:**
- White bg, `1px solid #c8c8c8` border, `4px` border-radius, subtle box-shadow
- Header: instruction text + timer progress bar (2px, full-width, fills left-to-right as time counts down)
- Footer: checkbox timer (left) + "🦈 SharkCAPTCHA · Privacy · Terms" (right, 10px, #bbb)

**Correct answer reveal (shown for 2.5s before next question):**
- Card background goes Ocean Deep
- DM Serif Display shark name (white)
- DM Serif Display italic latin name (Bioluminescent, 60% opacity)
- One-sentence shark fact (Space Grotesk, white 70%)
- Points awarded badge: "+850 pts" in Streak Amber
- Attribution line: photo credit + license + iNaturalist URL (10px, Bioluminescent 40%)

---

### 3 — Mini-game: Miami Shark Dash

**This screen breaks the CAPTCHA card frame entirely.** Full-bleed edge-to-edge, signals a complete mode shift.

**Layout:**
```
┌─────────────────────────────────────┐
│  Score bar (same as question shell) │
├─────────────────────────────────────┤
│  MIAMI SHARK DASH        ⏱ 00:23   │  ← dark translucent bar
├─────────────────────────────────────┤
│                                     │
│   [Full-bleed ocean canvas]         │
│   gradient: #003a5c → #001f33       │
│   Wave shimmer at surface           │
│   🦈 player shark                   │
│   🐟🐠🐡 collectible fish           │
│   🪝 hooks (avoid)                  │
│   🕸 nets (avoid)                   │
│   +50 score pops (Bioluminescent)   │
│   Depth bar on right edge           │
│                                     │
├─────────────────────────────────────┤
│  Tap & hold to dive · release rise  │  ← 10px, white 50%
└─────────────────────────────────────┘
```

**Mechanics:**
- `requestAnimationFrame` canvas loop, no external library
- One-touch: `touchstart` = dive, `touchend` = rise; spacebar fallback
- Objects scroll right-to-left at increasing speed
- Hard 30s cap — auto-advances to next question on timeout
- Mini-game score converts to quiz points on a curve (partial credit floor, generous ceiling)

**Note at transition:** Brief caption card: *"Whale sharks don't actually eat people — but you're not a whale shark."*

---

### 4 — Score Screen

**Layout:** Returns to CAPTCHA card frame. Card is taller, scrollable if needed.

**Card header:**
- Ocean Deep background
- "✓ Verification complete" — Bioluminescent, Space Grotesk 600, letter-spaced
- "SharkCAPTCHA · 10/10 questions" — white 50%, 10px

**Card body (top to bottom):**

**Shark tier reveal:**
- Large shark emoji (32px)
- DM Serif Display 24px: assigned tier name (e.g. "Tiger Shark")
- Score and accuracy: "7,840 pts · 8/10 correct" — Space Grotesk, #888

**Thermometer:**
- Full-width horizontal track
- Shark tiers left-to-right: Baby Shark → Nurse → Bull → Tiger → Great White → Whale Shark
- Filled portion in Ocean Deep → Bioluminescent gradient
- Dot indicator at player's tier
- Tier labels: 10px Space Grotesk, inactive = #aaa, active = Ocean Deep 600

**Charity CTA:**
- Light blue tinted card (`#f0f8ff` bg, `#b5d4f4` border)
- Eyebrow: "You can ID a shark — now protect them" (CAPTCHA Blue, 10px uppercase)
- Name: "Marine Megafauna Foundation" (Ocean Deep, Space Grotesk 600)
- One-line descriptor: satellite-tagging whale sharks & manta rays to shape ocean policy
- Donate button: Ocean Deep bg / Bioluminescent text, full-width, links to `marinemegafauna.org`

**Secondary actions:**
- "Share your shark tier 🦈" — ghost button, full-width, generates share text + link
- "Try again" — text link, restarts with reshuffled question pool

**Card footer:**
- "SharkCAPTCHA · Privacy · Terms · Photo credits on file" — 10px, #bbb

---

## Attribution Pattern

Every photo screen shows a caption line styled exactly like reCAPTCHA's "Privacy · Terms" footer:

```
Photo: [Creator] · [Source] · [License] · [URL]
```

Example:
```
Photo: J. Randall · iNaturalist · CC BY-NC · inaturalist.org/observations/12345
```

Font: 10px Space Grotesk, color `#bbb`. Attribution is ambient — designed in, not bolted on.

---

## Open Graph / iMessage Preview

Add to `<head>` — required for iMessage link previews:

```html
<meta property="og:title" content="SharkCAPTCHA — Prove you actually know sharks" />
<meta property="og:description" content="A CAPTCHA-themed shark ID quiz. Select all images containing a nurse shark." />
<meta property="og:image" content="https://[username].github.io/[repo]/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://[username].github.io/[repo]/" />
<meta name="twitter:card" content="summary_large_image" />
```

OG image spec: 1200×630px JPEG. Design: Ocean Deep background, large 🦈 emoji, "SharkCAPTCHA" in DM Serif Display white, "Can you tell a nurse shark from a bull shark?" subline in Space Grotesk Bioluminescent. Bake as a static asset — do not generate dynamically.

---

## Question Arc (10 questions)

| Q# | Mechanic | Shark content | Difficulty |
|---|---|---|---|
| 1 | Tile Tap — select all hammerheads | Great/Scalloped hammerhead | Easy |
| 2 | Odd One Out — 3×3 grid | Nurse shark impostor | Easy–Med |
| 3 | True/False Streak — 5 rapid facts | Whale shark | Med |
| 4 | Sort & Classify — reef vs. open ocean | Blacktip vs. Oceanic whitetip | Med |
| 5 | 🦈 Miami Shark Dash (30s mini-game) | — | N/A |
| 6 | Spot the Fake — 3 facts, 1 lie | Tiger shark | Med |
| 7 | Match the Shadow — silhouette ID | Thresher shark | Med–Hard |
| 8 | Rank 'Em — size order | 4 species | Med |
| 9 | Hot or Cold — guess max depth | Goblin shark | Hard |
| 10 | Elimination Round — 6 options, narrow down | Great white | Hard |

Shuffle non-mini-game questions for replay variety. Never repeat the same mechanic back-to-back.

---

## Key Implementation Notes for Claude Code

- Single `index.html`, no build step, GitHub Pages deployment
- Google Fonts loaded via `<link>` in `<head>`
- Shark data: hardcoded JSON array in a `<script>` tag — species name, latin name, one fact, image path, iNaturalist attribution, license
- Images: downloaded to `/assets/sharks/` at build time, not hotlinked at runtime
- Mini-game: self-contained JS module, own `<canvas>`, exits via `setTimeout(30000)`
- Timer checkbox: CSS custom property `--fill-pct` updated by `setInterval(100ms)`
- Correct answer animation: CSS class swap with `transition` on transform + opacity
- Score persists in JS state object — no localStorage needed (single session)
- No framework. Vanilla JS + CSS. Target bundle: < 200KB excluding images.
