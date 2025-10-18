# GameSnap X-Ray

> **One image → instant sports context → a beautiful, share-ready poster.**

## Problem
Fans share photos/screenshots of games, but posts lack context:
- Which game and exact moment is this?
- Score, period/quarter, clock?
- How likely was a win at that moment?
- A clean graphic to share instantly?

Broadcaster overlays exist but are locked to specific apps/streams.

## Solution
Upload a single image (TV photo or screenshot) and get:
1. **Smart ID** — detect the scoreboard (“scorebug”), identify the game.
2. **Instant context** — teams, score, period/clock, and a **win-probability snapshot**.
3. **Share-ready poster** — export a premium graphic (watermark in free tier).

## Who It’s For
- **Fans & creators** posting moments with context.
- **Journalists/social teams** needing consistent visuals.
- **Venues/bars** sharing highlights from their screens.

## Why It Delights
A friction-free 3-step flow (**Detect → Identify → Render**) and a premium poster in seconds.

---

## Status & Roadmap
- ✅ App scaffold (Next.js + TS + Tailwind)
- ✅ Demo image (for click-through testing)
- ✅ Upload API (POST /api/upload) saves to \`web/tmp/uploads/\`
- ✅ Serve uploads (GET /api/uploads/:filename)
- ☐ Landing page uploader + “Try demo” CTA
- ☐ Result page with poster preview
- ☐ Poster engine (templates + watermark)
- ☐ Game match (starter: NBA via BallDontLie)
- ☐ Win-probability baseline + **Model Health** (Brier score & calibration)
- ☐ Auth (magic link), share slugs, collections
- ☐ Freemium vs Pro gates (watermark, templates, limits)
- ☐ Quality gates (ESLint/Prettier, Vitest, Playwright, CI)
- ☐ Observability (OpenTelemetry, error tracking, session replay)

---

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind
- **Backend:** Next Route Handlers (Node runtime)
- **Planned Services:** OpenCV + Tesseract (OCR), ONNX (logo classifier), Postgres + Prisma, Redis + BullMQ
- **Data (free dev):** BallDontLie (NBA), TheSportsDB (logos/art), football-data.org (soccer) — staged by league.

---

## Local Development

    cd web
    npm install
    npm run dev
    # open http://localhost:3000

Upload any image or use the demo to click through the flow.  
Uploaded files are stored in \`web/tmp/uploads/\` (git-ignored).

---

## Project Conventions
- **Doc comments:** TSDoc (\`/** ... */\`) above modules/functions/handlers. Use \`@param\`, \`@returns\`, \`@remarks\`, \`@example\`. Use **\`TODO:\`** for deferred work.
- **Testing:** Unit (Vitest), API (Supertest), E2E (Playwright). Golden tests for OCR and poster outputs.
- **Commits:** Conventional commits (\`feat:\`, \`fix:\`, \`chore:\`, etc.).
- **Security:** Validate inputs (filenames, MIME). No secrets in repo. Use \`.env\` locally.

---

## License
MIT License 

## Notes
We are **not** a sportsbook; this app provides informational context and visualizations only.

---

## Docker (production build)

This repo includes a multi-stage Dockerfile that builds a **standalone** Next.js server and runs as a non-root user.

### Build
```bash
docker build -f web/Dockerfile -t gsx-web:dev ./web
Run (recommended; persists uploads to host)
bash
Copy code
docker run --rm -p 3000:3000 \
  -v "$(pwd)/web/tmp:/app/tmp" \
  --name gsx-web \
  gsx-web:dev
Why these flags?
-p 3000:3000 — expose the app on your host at http://localhost:3000

-v "$(pwd)/web/tmp:/app/tmp" — keep uploaded files in your repo folder (web/tmp/uploads)

--rm — auto-clean the container when it stops

--name gsx-web — easy to stop later: docker stop gsx-web

Minimal smoke test
bash
Copy code
docker run -p 3000:3000 gsx-web:dev
Note: the image declares VOLUME /app/tmp. If you don’t bind-mount it, Docker will create an anonymous volume that isn’t in your repo folder.


---

## Docker (production build)

This repo includes a multi-stage Dockerfile that builds a **standalone** Next.js server and runs as a non-root user.

### Build
docker build -f web/Dockerfile -t gsx-web:dev ./web

### Run (recommended; persists uploads to host)
docker run --rm -p 3000:3000 \
  -v "$(pwd)/web/tmp:/app/tmp" \
  --name gsx-web \
  gsx-web:dev

### Why these flags?
- -p 3000:3000 — expose the app on your host at http://localhost:3000
- -v "$(pwd)/web/tmp:/app/tmp" — keep uploaded files in your repo folder (web/tmp/uploads)
- --rm — auto-clean the container when it stops
- --name gsx-web — easy to stop later: docker stop gsx-web

### Minimal smoke test
docker run -p 3000:3000 gsx-web:dev

> Note: the image declares VOLUME /app/tmp. If you don’t bind-mount it, Docker will create an anonymous volume that isn’t in your repo folder.

