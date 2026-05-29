# PROJECT_INSTRUCTIONS.md — Touch Typing Trainer

> **Audience:** Claude Code (the implementer). The human user is a beginner — when you produce code, write it cleanly, comment non-obvious parts, and prefer clarity over cleverness.
>
> **Read this entire file before writing any code.** It is the single source of truth for product, architecture, and workflow decisions. If anything here conflicts with `CLAUDE.md`, prefer the most recent guidance and ask the user to resolve.

---

## 0. TL;DR

Build a **gamified, evidence-based touch-typing trainer** as a React + TypeScript + Vite single-page app. Local-first (IndexedDB), no backend in v1, deployable as a static site. Three modes: **Guided Lessons**, **Free Practice (quotes)**, **Code Mode**. Tracks per-key and per-bigram weakness, generates adaptive drills, enforces accuracy gating, and gamifies progress with streaks, daily goals, and badges. Design tone is **playful/Duolingo-bright** while remaining typographically disciplined.

---

## 1. Product principles (the "why" — do not violate)

These are non-negotiable. Every UX and code decision must trace back to one of these.

1. **Accuracy before speed.** A learner advances by being clean, not fast. Practicing at the speed where you can hold 98% accuracy beats typing fast with errors, because slow accurate repetition rewires motor pathways. Lesson advancement is gated on accuracy, not WPM.
2. **Daily, small, consistent.** Daily practice in 20-minute sessions improves learners 2.7× faster than 2-hour twice-weekly sessions; skipping 2–3 days causes regression. Default daily goal: **10 minutes**. Streaks are first-class.
3. **The hands stay home.** Color-coded fingers on the on-screen keyboard, "next-key" highlight, and an onboarding lesson that explicitly coaches covering the physical keyboard with a cloth (honor system).
4. **Practice your weak spots, not your strong ones.** Per-key and per-bigram error tracking auto-generates targeted drills. Don't waste the user's time on what they already do well.
5. **Calm-but-celebratory.** Playful and bright (Duolingo energy), but never frantic. Animations are short and purposeful. No flashing, no aggressive sound by default.

---

## 2. Tech stack (locked)

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18 + TypeScript** | Component model fits lesson/keyboard/stats UI; TS catches bugs early for a beginner |
| Build | **Vite** | Zero-config, fast HMR, clean static output |
| Routing | **React Router v6** | Multiple views (dashboard, lesson, practice, code mode, stats, settings) |
| Styling | **Tailwind CSS** (PostCSS, not CDN) + CSS variables for theme tokens | Matches existing project conventions; tokens enable dark mode later |
| State | **Zustand** | Simpler than Redux, perfect for a beginner; one store per domain (session, progress, settings) |
| Persistence | **IndexedDB via `idb-keyval`** | Handles unlimited history; tiny API; trivial to wrap |
| Charts | **Recharts** | React-native, declarative, good defaults |
| Icons | **lucide-react** | Clean, consistent, tree-shakeable |
| Fonts | **`@fontsource/inter`** (UI) + **`@fontsource/jetbrains-mono`** (typing surface + code mode) | Self-hosted, offline-friendly, no FOUT |
| Testing | **Vitest** + **@testing-library/react** | Vite-native; only test the engine logic in v1 (see §10) |
| Linting | **ESLint + Prettier** with strict TS config | Beginner-friendly guardrails |
| Deploy target | **Vercel** (preferred) or Netlify | Free, zero-config for Vite, instant rollbacks |

**Do not add:** Redux, MobX, styled-components, emotion, framer-motion (use Tailwind transitions + CSS), date libraries heavier than `date-fns`, animation libraries beyond what's listed.

**Node version:** ≥ 20. Use `npm` (pnpm is not installed on this machine).

---

## 3. File & folder structure

Create exactly this structure. Every file's purpose is documented inline below.

```
typing-trainer/
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── src/
│   ├── main.tsx                      # Vite entry, mounts <App />
│   ├── App.tsx                       # Router shell + global providers
│   ├── index.css                     # Tailwind directives + CSS variables + base resets
│   │
│   ├── routes/                       # One file per top-level view; lazy-loaded
│   │   ├── Dashboard.tsx             # Home: streak, daily goal, "Continue" CTA, weak-key heatmap preview
│   │   ├── LessonPlayer.tsx          # The actual typing surface for a guided lesson
│   │   ├── LessonMap.tsx             # Curriculum overview, locked/unlocked lessons
│   │   ├── Practice.tsx              # Free-typing quotes mode
│   │   ├── CodeMode.tsx              # Code snippet typing
│   │   ├── Stats.tsx                 # Full history, charts, per-key heatmap, bigram weaknesses
│   │   ├── Settings.tsx              # Daily goal, sound on/off, theme, reset data, export/import
│   │   └── Onboarding.tsx            # First-run flow: home-row demo + "cover your hands" coaching
│   │
│   ├── components/
│   │   ├── typing/
│   │   │   ├── TypingSurface.tsx     # The rendered text + caret + per-char status (core component)
│   │   │   ├── Keyboard.tsx          # On-screen keyboard, finger color zones, next-key highlight
│   │   │   ├── LiveStats.tsx         # Real-time WPM, accuracy, time remaining
│   │   │   └── SessionResults.tsx    # Post-session screen: WPM, accuracy, consistency, weak keys, "next"
│   │   ├── charts/
│   │   │   ├── KeyHeatmap.tsx        # SVG heatmap of per-key accuracy/speed
│   │   │   ├── WpmHistoryChart.tsx   # Line chart of WPM over time
│   │   │   └── BigramList.tsx        # Top weak bigrams with mini-drill CTAs
│   │   ├── gamification/
│   │   │   ├── StreakFlame.tsx       # Animated streak counter
│   │   │   ├── DailyGoalRing.tsx     # Progress ring toward today's goal
│   │   │   └── BadgeToast.tsx        # Celebration toast on unlock
│   │   └── ui/                       # Generic primitives — buttons, cards, modals, etc.
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Toggle.tsx
│   │       └── Tooltip.tsx
│   │
│   ├── engine/                       # PURE LOGIC — no React, fully unit-testable
│   │   ├── session.ts                # Session state machine: start, keystroke, finish, abort
│   │   ├── metrics.ts                # WPM, accuracy, consistency math
│   │   ├── weakness.ts               # Per-key & per-bigram error tracking, decay over time
│   │   ├── drillGenerator.ts         # Generates targeted drills from weakness data
│   │   ├── progression.ts            # Lesson unlock logic, accuracy gating
│   │   ├── streaks.ts                # Daily streak calculation with timezone safety
│   │   └── fingerMap.ts              # Maps every key → which finger should press it
│   │
│   ├── data/
│   │   ├── curriculum.ts             # The full guided lesson sequence (see §6)
│   │   ├── quotes.ts                 # ~150 curated quotes for free practice
│   │   ├── codeSnippets.ts           # ~50 code snippets (JS/TS/Python) for code mode
│   │   └── badges.ts                 # Badge definitions and unlock conditions
│   │
│   ├── store/                        # Zustand stores
│   │   ├── useProgressStore.ts       # Lessons completed, weakness map, history
│   │   ├── useSessionStore.ts        # Current in-flight session state
│   │   └── useSettingsStore.ts       # User preferences
│   │
│   ├── lib/
│   │   ├── db.ts                     # idb-keyval wrapper + migration helpers
│   │   ├── exportImport.ts           # JSON export/import for backup
│   │   ├── time.ts                   # Date helpers (start-of-day, streak math)
│   │   └── hooks/
│   │       ├── useKeystrokes.ts      # Captures keystrokes, debounces, prevents focus loss
│   │       ├── useBeforeUnload.ts    # Warns before leaving mid-session
│   │       └── useTheme.ts           # Theme application
│   │
│   ├── types/
│   │   └── index.ts                  # All shared TypeScript types (see §4)
│   │
│   └── styles/
│       └── tokens.css                # CSS custom properties: colors, spacing, shadows, radii
│
├── tests/
│   └── engine/
│       ├── metrics.test.ts
│       ├── weakness.test.ts
│       ├── streaks.test.ts
│       └── progression.test.ts
│
├── temporary screenshots/            # Created by screenshot.mjs (already exists, gitignored)
├── brand_assets/                     # Already exists per CLAUDE.md
├── serve.mjs                         # Already exists per CLAUDE.md (may need port update — see §11)
├── screenshot.mjs                    # Already exists per CLAUDE.md
├── index.html                        # Vite's HTML entry — only references /src/main.tsx
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── package.json
├── README.md
└── CLAUDE.md                         # Updated workflow rules (see separate revision prompt)
```

---

## 4. Core data model (TypeScript)

Put these in `src/types/index.ts`. Treat them as the contract; never invent ad-hoc shapes elsewhere.

```ts
// Identity & layout
export type FingerId =
  | 'L_PINKY' | 'L_RING' | 'L_MIDDLE' | 'L_INDEX'
  | 'R_INDEX' | 'R_MIDDLE' | 'R_RING' | 'R_PINKY'
  | 'THUMB';

export type KeyboardLayout = 'qwerty'; // v1 only — add 'colemak' | 'dvorak' later

// Per-keystroke event captured during a session
export interface Keystroke {
  expected: string;            // The character the user should have typed
  actual: string;              // What they actually pressed
  correct: boolean;
  timestamp: number;           // performance.now() relative to session start
  msSincePrevious: number;     // For consistency calculation
}

// Completed session — what gets persisted
export interface SessionResult {
  id: string;                  // uuid
  mode: 'lesson' | 'practice' | 'code' | 'drill';
  sourceId: string;            // Lesson id, quote id, snippet id, or 'adaptive'
  startedAt: number;           // Unix ms
  durationMs: number;
  wpm: number;                 // Net WPM (errors penalized)
  rawWpm: number;              // Gross WPM
  accuracy: number;            // 0..1
  consistency: number;         // 0..1, derived from stddev of inter-key intervals
  keystrokes: Keystroke[];     // Full log — kept for weakness recomputation
  errorsByKey: Record<string, number>;
  errorsByBigram: Record<string, number>; // key e.g. "th", "ng"
}

// Aggregated per-key stats (rebuilt from history)
export interface KeyStats {
  key: string;
  attempts: number;
  errors: number;
  accuracy: number;
  avgMsBetween: number;        // Average ms from previous key (rhythm)
}

// User progress (persisted)
export interface UserProgress {
  schemaVersion: number;       // Bump on breaking changes; see lib/db.ts migrations
  lessonsCompleted: Record<string, { firstClearedAt: number; bestWpm: number; bestAccuracy: number }>;
  history: SessionResult[];    // Full session log
  streak: {
    current: number;
    longest: number;
    lastPracticedDate: string; // ISO date YYYY-MM-DD, in user's local tz
  };
  badgesEarned: string[];      // Badge ids
  weakness: {                  // Computed snapshot; rebuilt nightly or on demand
    perKey: Record<string, KeyStats>;
    perBigram: Record<string, { errors: number; attempts: number }>;
    lastComputedAt: number;
  };
}

// Settings (persisted, separate from progress)
export interface UserSettings {
  schemaVersion: number;
  dailyGoalMinutes: number;    // Default 10
  soundEnabled: boolean;       // Default false
  showKeyboard: boolean;       // Default true (can hide for hardcore mode)
  highlightNextKey: boolean;   // Default true
  showFingerColors: boolean;   // Default true
  theme: 'light' | 'dark' | 'auto'; // Default 'auto'
  accuracyGate: number;        // 0..1, default 0.95 — required to unlock next lesson
  layout: KeyboardLayout;
}

// Curriculum
export interface Lesson {
  id: string;                  // e.g. "01-home-row-fj"
  unit: number;                // 1, 2, 3...
  order: number;               // Within a unit
  title: string;
  description: string;
  introducesKeys: string[];    // New keys this lesson teaches
  drills: string[];            // Array of strings the user types in order
  prerequisites: string[];     // Lesson ids that must be cleared first
}
```

---

## 5. Engine logic — exact algorithms

These functions are pure. Test them (§10). They contain no React.

### 5.1 WPM (`engine/metrics.ts`)

Industry standard: **1 word = 5 characters including spaces.**

```
rawWpm = (totalCharsTyped / 5) / (durationMs / 60000)
netWpm = ((totalCharsTyped - uncorrectedErrors) / 5) / (durationMs / 60000)
```

- `totalCharsTyped` = count of all keystrokes (including those backspaced over — they happened).
- `uncorrectedErrors` = count of expected positions where the final committed character was wrong.
- Report **netWpm as primary**, rawWpm as secondary.
- Clamp negative WPM to 0.

### 5.2 Accuracy

```
accuracy = correctKeystrokes / totalKeystrokes
```
Where `correctKeystrokes` is the count of keystrokes where `actual === expected` on first attempt (backspace-then-retry counts the original as an error).

### 5.3 Consistency (`engine/metrics.ts`)

A typist with smooth rhythm beats a typist with bursts. Compute:

```
intervals = keystrokes.map(k => k.msSincePrevious).filter(ms => ms > 0)
mean = average(intervals)
stdDev = sqrt(average(intervals.map(x => (x - mean)^2)))
coefficientOfVariation = stdDev / mean
consistency = max(0, 1 - coefficientOfVariation)   // Clamped to [0,1]
```

Display as a 0–100% score.

### 5.4 Weakness tracking (`engine/weakness.ts`)

After every session, update weakness with **exponential decay** so recent performance matters more:

```
DECAY = 0.85   // Tunable — old data fades to 85% before merging new

for each key k in newSession:
  perKey[k].attempts = perKey[k].attempts * DECAY + newAttempts[k]
  perKey[k].errors   = perKey[k].errors   * DECAY + newErrors[k]
  perKey[k].accuracy = 1 - (perKey[k].errors / max(1, perKey[k].attempts))
```

Same shape for bigrams. Bigram key = `expected[i] + expected[i+1]` (only when both are letters, lowercase).

### 5.5 Drill generator (`engine/drillGenerator.ts`)

When the user clicks "Practice my weak spots":

1. Rank keys by `errors / attempts` (require `attempts >= 20` to avoid noise).
2. Pick top 3 weak keys.
3. Rank bigrams the same way; pick top 5.
4. Generate a drill string by:
   - Pulling words from a dictionary that contain those keys/bigrams (bundle a 5k common-words list).
   - Interleaving so no single key dominates.
   - Length: ~200 characters per drill.
5. If user has < 3 sessions of history, fall back to a balanced default drill.

### 5.6 Progression / accuracy gating (`engine/progression.ts`)

A lesson is "cleared" when the user finishes it with `accuracy >= settings.accuracyGate` (default 0.95).
A lesson is "unlocked" when all its `prerequisites` are cleared.
Users can replay any unlocked lesson freely.
Never auto-advance — the user clicks "Next lesson."

### 5.7 Streaks (`engine/streaks.ts`)

- A day "counts" if the user accumulates ≥ `dailyGoalMinutes / 2` minutes of typing across any mode (half the goal is the minimum bar — research says any practice beats none).
- Use the user's **local timezone** for day boundaries. Compute via `Intl.DateTimeFormat`.
- If `lastPracticedDate` is yesterday → increment. If today → no change. If older → reset to 1.
- Show a warning toast on app open if today's streak is at risk (it's after 8pm local and today hasn't counted yet).

---

## 6. Curriculum (`data/curriculum.ts`)

Build a progressive sequence. Minimum for v1:

| Unit | Lessons | Introduces |
|---|---|---|
| 1: Home Row | 4 lessons | F J, D K, S L, A ; |
| 2: Home Row Words | 2 lessons | combinations of unit 1 |
| 3: Top Row | 5 lessons | E I, R U, T Y, W O, Q P |
| 4: Bottom Row | 5 lessons | V M, C ,, X ., Z /, B N |
| 5: Common Words | 4 lessons | the, and, ing, ion, etc. |
| 6: Capitalization | 3 lessons | left shift, right shift, mixed |
| 7: Numbers | 4 lessons | 1-5, 6-0, mixed, money/dates |
| 8: Punctuation | 3 lessons | basic, advanced, symbols |
| 9: Fluency | 3 lessons | full sentences, paragraphs, mixed real text |

Each lesson has 3–5 drills, ~80–200 characters each, progressing from raw key repetition → words → sentences.

**Lesson authoring rules:**
- Never introduce a key the user hasn't met.
- Drill 1 of each lesson is pure repetition of new keys (`fff jjj fjf jfj fff jjj`).
- Drill 2 mixes new with previously learned.
- Drill 3+ uses real words.
- No nonsense after unit 5 — only real English words.

---

## 7. UI specification (per route)

The aesthetic is **playful/Duolingo-bright** but typographically clean. See §8 for the design system.

### 7.1 Onboarding (`/onboarding`) — first run only
- Step 1: Welcome + 1-paragraph explanation of touch typing.
- Step 2: "**The single most effective trick**" — a card explaining the cloth-over-hands technique. Show an illustration. Covering your keyboard with a light cloth or using a blank keyboard skin forces you to rely on touch alone.
- Step 3: Set daily goal (default 10 min, options 5/10/15/30).
- Step 4: Mini diagnostic typing test (30 seconds) to seed initial WPM and weakness data.
- Stores `onboardingCompleted: true` and routes to `/dashboard`.

### 7.2 Dashboard (`/dashboard`)
- **Hero card**: large streak flame + current streak count + daily goal ring + "Continue Lesson X" primary CTA.
- **Quick-start chips**: "Free Practice," "Code Mode," "Drill Weak Spots."
- **Mini weak-key heatmap** (5x QWERTY rows, color = accuracy) with "View full stats →" link.
- **Recent sessions**: last 3 with WPM/accuracy badges.

### 7.3 Lesson Map (`/lessons`)
- Vertical scroll of units, each unit a card with its lessons as pill nodes (locked = greyscale + lock icon; unlocked = colored; cleared = colored + checkmark + best WPM).
- Click a node → `/lesson/:id`.

### 7.4 Lesson Player (`/lesson/:id`)
- **Top bar**: lesson title, progress (drill 2 of 4), exit button (confirms abandon).
- **Typing surface**: large monospace text. Color states per char:
  - Untyped: low contrast (text-zinc-400 or token equivalent).
  - Correct: full contrast.
  - Incorrect: red background highlight + the user's wrong char shown faintly above (optional, configurable).
  - Caret: animated blinking bar between chars, NOT a block over the next char.
- **Live stats bar**: WPM, accuracy, time elapsed (or remaining for timed).
- **On-screen keyboard** (toggleable): finger color zones; next expected key glows.
- **Pause behavior**: blur the page → auto-pause; resume on focus.
- **End-of-drill**: animate the SessionResults overlay.

### 7.5 Practice (`/practice`)
- Quote selector or "random." Same typing surface as lessons.
- No accuracy gate, no progression — just a free typing test, default 60 seconds (toggle: 15/30/60/120s).

### 7.6 Code Mode (`/code`)
- Language picker (JS, TS, Python in v1).
- Code snippet rendered with syntax highlighting on the *display* layer; the user types raw characters.
- **Special rules**: indentation auto-skipped (user types the first non-whitespace char of each line; the surface advances past leading spaces). This is how Monkeytype and TypingClub handle code.
- No autocomplete, no editor behavior. Pure typing.

### 7.7 Stats (`/stats`)
- WPM history line chart (last 30 days; toggle 7/30/90/all).
- Accuracy history line chart, same toggles.
- Full per-key heatmap (color = accuracy, size badge = volume).
- Top 10 weak bigrams with a "Drill these" button per row.
- Session list (paginated, 20 per page) — click expands to show that session's metrics.

### 7.8 Settings (`/settings`)
Group by:
- **Practice**: daily goal, accuracy gate, default test length.
- **Display**: show keyboard, highlight next key, show finger colors, theme.
- **Audio**: sound effects on/off (default off).
- **Data**: export JSON, import JSON, **reset all progress** (require typing "RESET" to confirm).

---

## 8. Design system

### 8.1 Color tokens

Define in `src/styles/tokens.css`. Reference everywhere via CSS variables or Tailwind theme extensions — **never hardcode hex.**

```css
:root {
  /* Brand — playful but not neon. Warm orange anchors the "energy" feel without being childish. */
  --color-brand-50:  #FFF4ED;
  --color-brand-100: #FFE5D3;
  --color-brand-200: #FFC7A6;
  --color-brand-300: #FFA372;
  --color-brand-400: #FF7E3E;
  --color-brand-500: #F25C16;  /* primary */
  --color-brand-600: #D44509;
  --color-brand-700: #AF3508;
  --color-brand-800: #8B2A09;
  --color-brand-900: #6E230C;

  /* Accent — cool teal for "correct/success" contrast against brand orange */
  --color-accent-400: #2DD4BF;
  --color-accent-500: #14B8A6;
  --color-accent-600: #0D9488;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #EAB308;
  --color-error:   #EF4444;

  /* Neutral surfaces */
  --color-bg:       #FFFBF7;        /* warm off-white base */
  --color-surface:  #FFFFFF;
  --color-elevated: #FFF8F1;
  --color-border:   #F0E5D8;
  --color-text:     #1C1917;
  --color-text-muted: #78716C;
  --color-text-dim:   #A8A29E;

  /* Finger zones — color-coded per finger (used on keyboard) */
  --finger-L-pinky:  #EC4899;
  --finger-L-ring:   #A855F7;
  --finger-L-middle: #3B82F6;
  --finger-L-index:  #06B6D4;
  --finger-R-index:  #14B8A6;
  --finger-R-middle: #22C55E;
  --finger-R-ring:   #EAB308;
  --finger-R-pinky:  #F97316;
  --finger-thumb:    #94A3B8;
}

/* Dark mode — defer to v1.1, but reserve the structure */
[data-theme='dark'] {
  --color-bg:       #1C1917;
  --color-surface:  #292524;
  --color-elevated: #44403C;
  --color-border:   #57534E;
  --color-text:     #FAFAF9;
  --color-text-muted: #A8A29E;
  --color-text-dim:   #78716C;
}
```

### 8.2 Typography

- UI: **Inter** (variable). Weights used: 400, 500, 600, 700.
- Typing surface + code: **JetBrains Mono** (variable). Weights: 400, 500, 700.
- Display headings: Inter at 600/700 with **letter-spacing -0.03em** for sizes ≥ 32px.
- Body line-height: **1.6**. Typing surface line-height: **1.75** (legibility while scanning).

### 8.3 Spacing & radii

Tailwind defaults are fine. Use a consistent rhythm: 4, 8, 12, 16, 24, 32, 48, 64. Avoid arbitrary values.

Radii:
- `sm`: 6px (chips, badges)
- `md`: 12px (buttons, inputs)
- `lg`: 16px (cards)
- `xl`: 24px (hero surfaces, modals)
- `full`: pills, avatars, the daily goal ring

### 8.4 Shadows

Tinted with brand color at low opacity, layered for depth. Never use `shadow-md` flat.

```css
--shadow-card:     0 1px 2px rgba(242, 92, 22, 0.06), 0 4px 12px rgba(242, 92, 22, 0.08);
--shadow-elevated: 0 2px 4px rgba(242, 92, 22, 0.08), 0 12px 32px rgba(242, 92, 22, 0.12);
--shadow-glow:     0 0 0 4px rgba(242, 92, 22, 0.15);
```

### 8.5 Motion

- **Only animate `transform` and `opacity`.** Never `transition-all`.
- Durations: 150ms (hover), 250ms (state change), 400ms (route enter), 600ms (celebration burst).
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for "pop" moments (badges, streak flame); `cubic-bezier(0.4, 0, 0.2, 1)` for everything else.
- **Respect `prefers-reduced-motion`** — disable celebration animations, keep state changes instant.

### 8.6 Interactive states

Every clickable element MUST have:
- `hover:` — subtle transform (e.g., `-translate-y-0.5`) + shadow lift
- `focus-visible:` — 3px brand-tinted ring with 2px offset
- `active:` — `translate-y-0` + reduced shadow (press-down feel)
- `disabled:` — 40% opacity, no hover, cursor not-allowed

### 8.7 Accessibility

- All interactive elements reachable by Tab in logical order.
- `aria-live="polite"` region for "Lesson complete!" toasts.
- The typing surface uses a hidden `<input>` for keystroke capture so screen readers still announce position.
- Color is never the only signal — error states pair red with an icon.
- Minimum contrast WCAG AA on all text (4.5:1 body, 3:1 large).
- Don't trap focus during typing — Esc always pauses and exits the surface.

---

## 9. Build phases (sequential — don't skip ahead)

Each phase ends with a **checkpoint**: run the dev server, screenshot, compare against this spec, fix mismatches before proceeding.

### Phase 0: Scaffolding (½ day)
- Scaffold with Vite + React + TS template (see Phase 0 notes in CHANGES.md for the in-place install used here)
- Install all deps from §2.
- Configure Tailwind, PostCSS, ESLint, Prettier.
- Set up `src/styles/tokens.css`, import into `index.css`.
- Verify `node serve.mjs` still works after running `npm run build` (it should serve `dist/`).
- Commit. **Checkpoint: blank page renders with brand background color.**

### Phase 1: Engine (1–2 days)
- Implement `engine/metrics.ts`, `engine/weakness.ts`, `engine/streaks.ts`, `engine/progression.ts`, `engine/drillGenerator.ts`, `engine/session.ts`, `engine/fingerMap.ts`.
- Write Vitest tests for each (§10).
- No UI yet. **Checkpoint: `npm test` passes.**

### Phase 2: Persistence (½ day)
- `lib/db.ts` wraps idb-keyval with typed get/set + schema migrations.
- `lib/exportImport.ts` — JSON download + upload + validation.
- Zustand stores (`useProgressStore`, `useSessionStore`, `useSettingsStore`) wired to db. **Checkpoint: refresh the page, state persists.**

### Phase 3: Core typing surface (1–2 days)
- `components/typing/TypingSurface.tsx` — render text with per-char status, animated caret, captures keystrokes.
- `components/typing/Keyboard.tsx` — finger colors, next-key highlight.
- `components/typing/LiveStats.tsx` — real-time WPM/accuracy/timer.
- `components/typing/SessionResults.tsx` — end-of-session screen.
- **Checkpoint: open a hardcoded test route, type, see real-time stats, finish, see results.** Screenshot, validate against §7.4.

### Phase 4: Routes & navigation (1 day)
- React Router setup in `App.tsx`.
- Stub all routes from §7 with placeholder content.
- App shell: persistent top nav (logo, dashboard, lessons, practice, code, stats, settings).
- **Checkpoint: navigate to every route without errors.**

### Phase 5: Curriculum + Lesson Player (1 day)
- Author `data/curriculum.ts` per §6.
- Implement `LessonMap.tsx` and `LessonPlayer.tsx`.
- Hook accuracy gating into completion. **Checkpoint: complete lesson 1, lesson 2 unlocks.**

### Phase 6: Practice + Code Mode (1 day)
- `data/quotes.ts` (~150 quotes; can seed from public-domain sources like Project Gutenberg snippets).
- `data/codeSnippets.ts` (~50 snippets, idiomatic in each language).
- `Practice.tsx` and `CodeMode.tsx` reusing TypingSurface.
- **Checkpoint: all three modes functional.**

### Phase 7: Stats + Charts (1 day)
- `Stats.tsx` with Recharts.
- `KeyHeatmap.tsx`, `WpmHistoryChart.tsx`, `BigramList.tsx`.
- "Drill these" buttons that route to a generated adaptive drill session.
- **Checkpoint: after 5+ sessions, charts render meaningful data.**

### Phase 8: Gamification (½ day)
- `StreakFlame`, `DailyGoalRing`, `BadgeToast`.
- `data/badges.ts` with ~15 starter badges (first lesson, 3-day streak, 7-day streak, 50 WPM, 90% accuracy, etc.).
- Unlock-on-condition logic hooked into session completion.

### Phase 9: Onboarding + Settings + polish (1 day)
- `Onboarding.tsx` flow per §7.1.
- `Settings.tsx` per §7.8.
- Final screenshot pass over every route — fix any spacing/typography drift.

### Phase 10: Deploy (½ day)
- `npm run build` produces `dist/`.
- Push to GitHub.
- Connect to Vercel — auto-deploys on push.
- Verify deployed app works.
- Add `README.md` with setup, scripts, and architecture notes.

---

## 10. Testing (minimum bar)

v1 only requires **unit tests on the engine.** UI tests are out of scope.

Write tests for:
- `metrics.ts`: known input keystrokes → known WPM, accuracy, consistency.
- `weakness.ts`: decay math, bigram extraction (ignores spaces/punct correctly).
- `streaks.ts`: timezone edge cases (user in UTC-8 typing at 11:59pm should count for today).
- `progression.ts`: accuracy gate, prerequisite logic.
- `drillGenerator.ts`: with mock weakness, output contains the targeted keys.

Run `npm test` before every commit. Phase 1 cannot end with a failing test suite.

---

## 11. Workflow rules (in addition to CLAUDE.md)

1. **Read CLAUDE.md every session before writing frontend code.** Invoke the `frontend-design` skill.
2. **Dev server**: `npm run dev` (Vite, default port 5173). `serve.mjs` serves the built `dist/` on port 3000 for production QA. Screenshots during development point at **`http://localhost:5173`**, not 3000.
3. **Screenshot workflow per CLAUDE.md still applies** — at least 2 comparison rounds at every UI checkpoint.
4. **Brand assets**: check `brand_assets/` before designing. Honor any logos or palettes found there. The orange-anchored palette in §8.1 is a default — replace if `brand_assets/` defines its own.
5. **Anti-generic guardrails from CLAUDE.md apply** — no `transition-all`, no default Tailwind indigo/blue, layered shadows, paired typography, etc.
6. **Don't add features not in this spec.** If you think something is missing, ask the user first.
7. **Beginner-friendly code**: comment non-obvious lines, prefer named functions over inline anonymous ones in critical paths, use TypeScript strictly (no `any` without a comment explaining why).
8. **Commit often** with conventional commit messages (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).

---

## 12. Acceptance criteria (the "is it done" checklist for v1)

- [ ] User can complete onboarding on first visit; never sees it again.
- [ ] User can start and complete a lesson; results are persisted.
- [ ] Real-time WPM, accuracy, and timer update during a session.
- [ ] On-screen keyboard shows finger colors and highlights the next expected key.
- [ ] Lesson 2 is locked until lesson 1 is cleared at ≥ 95% accuracy.
- [ ] User can practice with random quotes (15/30/60/120s tests).
- [ ] User can practice code in JS, TS, and Python with indentation auto-skipped.
- [ ] Stats page shows: WPM history chart, accuracy chart, per-key heatmap, top 10 weak bigrams.
- [ ] "Drill weak spots" generates a session targeting the user's worst keys/bigrams.
- [ ] Streak increments correctly across day boundaries in the user's local timezone.
- [ ] Daily goal ring fills as the user practices today.
- [ ] At least 5 badges can be unlocked through normal use.
- [ ] Settings: change goal, toggle keyboard/colors/sound, change accuracy gate, export/import JSON, reset all data.
- [ ] All routes are keyboard-accessible; Esc exits the typing surface.
- [ ] `prefers-reduced-motion` is respected.
- [ ] App works offline after first load (Vite PWA optional, but cache-first static assets is required).
- [ ] Deployed to Vercel/Netlify with a working public URL.
- [ ] Engine tests pass: `npm test` green.
- [ ] Lighthouse score ≥ 90 on Performance, Accessibility, Best Practices.

---

## 13. Edge cases & gotchas

- **Tab key in code mode**: prevent default browser focus-shift.
- **Composition events** (IME for non-Latin languages): ignore in v1; document as "English layouts only."
- **Backspace**: allow it; correcting an error mid-word still counts the original as an error (don't reward wipe-and-retry).
- **Very fast typists**: `msSincePrevious` can be 0 or 1ms; clamp to 1 to avoid divide-by-zero in consistency math.
- **Multi-character paste**: detect `e.inputType === 'insertFromPaste'` and reject — this is anti-cheat.
- **Caret position when lines wrap**: scroll the typing surface to keep current word centered, don't let it drift off-screen.
- **Window blur mid-session**: auto-pause the timer (don't penalize the user for life happening).
- **Long sessions overflowing history**: when `history.length > 1000`, archive oldest 200 to a separate IndexedDB key so the active object stays fast.
- **Schema migrations**: every store object has `schemaVersion`. On load, if version is lower than current, run the migration in `lib/db.ts`; never silently overwrite.
- **Daylight saving**: streak date math uses local `YYYY-MM-DD` strings, not Unix offsets. This avoids the "lost an hour" bug.
- **Empty state**: stats page before any sessions exist must show a friendly "Complete your first lesson to see stats" card, not a broken chart.

---

## 14. Out of scope for v1 (do not build)

- User accounts / cloud sync (planned v2)
- Multiplayer / typing races
- Custom keyboard layouts (Colemak, Dvorak) — leave the `KeyboardLayout` type extensible
- Languages other than English
- Mobile typing surface (desktop-first; mobile shows a "use a real keyboard" message on the typing routes, but dashboard/stats remain mobile-responsive)
- Webcam-based "looking down" detection
- Sound packs / music
- AI-generated custom lessons
- Native desktop app

---

## 15. References (the research this is built on)

- Daily practice in 20-minute sessions improves learners 2.7× faster than infrequent long sessions; skipping 2–3 days causes regression.
- Practice at the speed where you can hold 98% accuracy. Slow accurate repetition rewires motor pathways; speed follows accuracy.
- Adaptive lessons that adjust based on speed and accuracy, identifying weak keys and creating custom review exercises, accelerate progress.
- Each finger has its own area on the keyboard; color-coding finger zones helps users learn placement without looking.
- Covering the keyboard with a light cloth forces reliance on touch alone and is one of the most effective offline techniques.

---

**End of PROJECT_INSTRUCTIONS.md.** Claude Code: when in doubt, re-read this file and the latest CLAUDE.md before deciding. Never invent features not specified here without asking.
