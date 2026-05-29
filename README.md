# Typer — a touch typing trainer

A local-first, gamified, evidence-based touch typing trainer. Built with React 18,
TypeScript, Vite, Tailwind, Zustand, IndexedDB, and Recharts. No backend, no
account; everything lives in your browser.

Read [PROJECT_INSTRUCTIONS.md](./PROJECT_INSTRUCTIONS.md) for the full spec,
[CLAUDE.md](./CLAUDE.md) for the workflow rules, and [CHANGES.md](./CHANGES.md)
for the design decisions made during the build.

[`SECURITY.md`](./SECURITY.md) covers the threat model, what is hardened
today (CSP, security headers, JSON-import validation, build hygiene), and
forward-looking guidance for when LLM and account features ship.
[`PRIVACY.md`](./PRIVACY.md) covers what we collect (nothing) and what
stays in your browser.

## What it does

- **Guided lessons** — 33 lessons across 9 units, gated by accuracy (default 95%)
- **Free practice** — 60 quotes, 15/30/60/120-second timers
- **Code mode** — JavaScript, TypeScript, Python snippets; indentation auto-skipped
- **Adaptive drills** — generates a custom session targeting your weakest keys and bigrams
- **Stats** — WPM history chart, per-key heatmap, top weak letter pairs
- **Gamification** — streak flame, daily goal ring, 16 unlockable badges
- **Settings** — daily goal, accuracy gate, theme, export/import JSON, reset

## Run it locally

You need **Node ≥ 20** and **npm**.

```bash
# from the project root
npm install        # one-time
npm run dev        # http://localhost:5173  (hot reload)
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on **port 5173** (use this for daily work). |
| `npm test` | Run the engine unit tests (Vitest). 48 tests. |
| `npm run build` | TypeScript build + Vite production build into `dist/`. |
| `npm run preview` | Vite's built-in preview of `dist/` on port 4173. |
| `node serve.mjs` | Custom static server for `dist/` on **port 3000** with SPA fallback. |
| `npm run lint` | ESLint over `src/` and `tests/`. |
| `npm run security:audit` | `npm audit --audit-level=high` — fail on High/Critical findings. |
| `node screenshot.mjs http://localhost:5173 [label]` | Save a full-page screenshot. |

## Deploy to Vercel

Vercel auto-detects Vite, so the deploy is genuinely a few clicks.

### 1. Make sure it's a git repo

This project folder is not yet a git repo. Initialise it:

```bash
cd "Typer Helper App"   # if you're not already there
git init
git add .
git commit -m "chore: initial commit of Typer touch typing trainer"
```

### 2. Push to GitHub

Create an empty repo on GitHub (don't add a README or .gitignore — we already have them), then:

```bash
git remote add origin git@github.com:<your-username>/typer.git
git branch -M main
git push -u origin main
```

### 3. Deploy via Vercel

1. Open <https://vercel.com/new>.
2. Click **Import Project**, pick your `typer` repo, and click **Import**.
3. On the configuration screen Vercel should auto-detect:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   You can leave all of those alone.
4. Click **Deploy**. First build takes about a minute. You'll get a URL like
   `typer-<hash>.vercel.app`.
5. Every push to `main` from then on auto-redeploys.

If client-side routes (`/lessons`, `/stats`, etc.) ever return 404 on Vercel,
add this to `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

(Vite's static build usually doesn't need this, but it's a one-line fix if it
ever does.)

### Netlify (alternative)

Same idea — drag and drop the `dist/` folder at <https://app.netlify.com/drop>,
or connect the repo. Build command `npm run build`, publish directory `dist`.
Add a `_redirects` file containing `/* /index.html 200` if SPA routes return 404.

## Architecture at a glance

```
src/
├── engine/      pure logic — no React. Tested with Vitest.
├── store/       Zustand stores (settings, progress, in-flight session).
├── lib/         IndexedDB wrapper, export/import, date helpers, hooks.
├── components/  React components (typing, charts, gamification, ui).
├── routes/      One file per top-level URL.
├── data/        Static content (curriculum, quotes, snippets, badges).
├── types/       Shared TypeScript types.
└── styles/      tokens.css — colors, shadows, radii. Tailwind reads from here.
```

The engine never imports React. The components never reach into IndexedDB
directly — that goes through `src/lib/db.ts`. Tests live alongside the engine
in `tests/engine/`.

## Tech stack

React 18 · TypeScript (strict) · Vite 5 · Tailwind CSS · Zustand · React Router 6
· idb-keyval · Recharts · lucide-react · `@fontsource/inter` + `@fontsource/jetbrains-mono`
· Vitest · ESLint · Prettier · Puppeteer (for screenshots)

## License

Personal project. Adapt freely.
