# Pantry

A personal learning project. Things you have at home, and when they expire.

It uses the same tools as Rénov — Express 5 + TypeScript + Prisma + a separate
worker process on the backend, Expo + expo-router + TanStack Query on the phone —
but a different, much smaller product, so you learn the patterns rather than
copy the code.

**Day one does almost nothing on purpose.** The API answers `GET /health`, the
app shows whether it got an answer, and the worker starts and idles. Everything
else is yours to build, in order, from [`LEARNING.md`](LEARNING.md).

## The one rule

Type it yourself. Read docs, read Rénov, ask an AI to *explain* something — but
don't paste a generated solution. If you get stuck for more than an hour on one
step, ask for a hint, not the answer.

## Layout

```
pantry/
  server/            Express API + worker (same codebase, two processes)
    src/server.ts    starts the API
    src/app.ts       middleware + routes, in order
    src/routes.ts    the routes (just /health today)
    src/config/      env, parsed with zod
    src/lib/         logger
    src/middleware/  request log, 404 + error handler
    src/worker/      the second process (idle today)
    prisma/          schema.prisma — no tables yet
  app/               Expo SDK 57
    src/app/         routes (expo-router) — screens only
    src/features/    screens + hooks, per feature
    src/api/         the only place that calls fetch
  LEARNING.md        the exercises
```

## Run it

Node 22 or newer.

```bash
# terminal 1 — API on :4000
cd server
cp .env.example .env
npm run dev

# terminal 2 — worker
cd server
npm run worker

# terminal 3 — app (press w for web)
cd app
cp .env.example .env
npm start
```

Check the API on its own: `curl localhost:4000/health` → `{"ok":true}`.

Stop the API and reload the app to see the error state.

## Checks

```bash
cd server && npm run typecheck
cd app && npm run typecheck
```
