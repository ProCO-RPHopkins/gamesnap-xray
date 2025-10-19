# GameSnap X-Ray

> **One image → instant sports context → a beautiful, share-ready poster.**

## Overview

**GameSnap X-Ray** turns a single TV photo or screenshot into instant sports context and a clean poster you can share. Upload a frame; we detect the scorebug, identify the game, attach context (score, period/clock, win probability snapshot), and render a premium export. Free adds a small watermark; Pro removes it and unlocks templates.

## Problem

Fans constantly post game photos/screenshots, but the post usually lacks context:

* Which game and exact moment is this?
* Score, quarter/period, time remaining?
* How likely was a win at that moment?
* Can I share a clean graphic, instantly?

Broadcast overlays exist, but they’re locked to specific apps/streams. There’s no **web-first, bring-your-own-image** flow.

## Solution

1. **Detect scorebug** – localize the scoreboard region and extract digits/clock/team IDs.
2. **Identify game** – map the frame to a real game using free dev data sources.
3. **Render poster** – output clean, on-brand templates with optional watermark.

## Who It’s For

* **Fans & creators** posting moments with context.
* **Journalists/social teams** needing consistent visuals.
* **Venues/bars** sharing highlights from screens.

## Why It Delights

A friction-free 3-step flow (**Detect → Identify → Render**) that gets first-time users to “wow” in seconds and produces a premium poster.

---

## Status & Roadmap

* ✅ App scaffold (Next.js + TS + Tailwind)
* ✅ Upload API (`POST /api/upload`) saves to `web/tmp/uploads/`
* ✅ Serve uploads (`GET /api/uploads/:filename`)
* ✅ Polished landing (hero, theme, motion)
* ✅ Demo Gallery (`/public/demo` + `/api/demos`)
* ✅ Docker (production image)
* ☐ Result page: poster preview stub (ready for engine)
* ☐ Poster engine (templates + watermark)
* ☐ Game match (starter: NBA via BallDontLie)
* ☐ Win-probability baseline + **Model Health** (Brier score & calibration)
* ☐ Auth (magic link), share slugs, collections
* ☐ Freemium vs Pro gates (watermark, templates, limits)
* ☐ Quality gates (ESLint/Prettier, Vitest, Playwright, CI)
* ☐ Observability (OpenTelemetry, error tracking, session replay)

---

## Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, Tailwind, Framer Motion
* **Backend:** Next Route Handlers (Node runtime)
* **Planned Services:** OpenCV + Tesseract (OCR), ONNX (logo classifier), Postgres + Prisma, Redis + BullMQ
* **Free dev data (by league):** BallDontLie (NBA), TheSportsDB (logos/art), football-data.org (soccer)

---

## Local Development

```bash
cd web
npm install
npm run dev

```
open [http://localhost:3000](http://localhost:3000)

* Upload an image on the landing page, or click **Try a demo** to load a static sample.
* Uploaded files are stored at `web/tmp/uploads/` (git-ignored).

### Demo Gallery

Place screenshots in `web/public/demo/` (e.g., `nba_01.jpg`). They’ll auto-appear in **Demo Moments** on the home page via `/api/demos`. Clicking one opens the Result view using `?src=/demo/<file>`.

---

## Docker (production build)

This repo includes a multi-stage Dockerfile that builds a **standalone** Next.js server and runs as a non-root user.

### Build

```bash
docker build -f web/Dockerfile -t gsx-web:dev ./web
```

### Run (recommended; persists uploads to host)

```bash
docker run --rm -p 3000:3000 \
  -v "$(pwd)/web/tmp:/app/tmp" \
  --name gsx-web \
  gsx-web:dev
```

### Why these flags?

* `-p 3000:3000` — expose the app on your host at [http://localhost:3000](http://localhost:3000)
* `-v "$(pwd)/web/tmp:/app/tmp"` — keep uploaded files in your repo folder (`web/tmp/uploads`)
* `--rm` — auto-clean the container when it stops
* `--name gsx-web` — easy to stop later: `docker stop gsx-web`

### Minimal smoke test

```bash
docker run -p 3000:3000 gsx-web:dev
```

> Note: the image declares `VOLUME /app/tmp`. If you don’t bind-mount it, Docker will create an anonymous volume that isn’t in your repo folder.
---

## Docker (dev, hot reload)

Run the Next.js dev server **inside a container** with live reload.

**Requirements:** Docker + Docker Compose  
**Compose file:** `web/docker-compose.dev.yml`

### Start (hot reload)
```bash
docker compose -f web/docker-compose.dev.yml up
````

### Stop

```bash
docker compose -f web/docker-compose.dev.yml down
```

**What this does**

* Mounts your source (`./web` → `/app`) so edits hot-reload.
* Keeps `node_modules` managed in the container (no host conflicts).
* Persists uploads by mounting `./web/tmp` → `/app/tmp`.
* Exposes the app on `http://localhost:3000`.

**Troubleshooting**

* If edits aren’t detected on some Docker/WSL setups, uncomment the `sysctls` lines in `web/docker-compose.dev.yml` to increase inotify watches.
* Ensure any local `npm run dev` isn’t already holding port 3000.
---

## Project Conventions

* **Doc comments:** TSDoc (`/** ... */`) above modules/functions/handlers. Use `@param`, `@returns`, `@remarks`, `@example`. Use `TODO:` for deferred work.
* **Testing (incoming):** Unit (Vitest), API (Supertest), E2E (Playwright). Golden tests for OCR regions and poster outputs.
* **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, etc.).
* **Security:** Validate inputs (filenames, MIME). No secrets in repo. Use `.env` locally.

---

## License

MIT — see [`LICENSE`](./LICENSE).

---

## Notes

This app provides informational context and visualizations only; it is **not** a sportsbook.
