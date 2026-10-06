# Learning path

Do these in order. Each one is small, and each one is a pattern Rénov uses.

Every step has:

- **Goal** — what should work when you are done.
- **Touch** — the files you will create or change.
- **Done when** — how you prove it, by hand.
- **Then read** — the Rénov file that does the same job. Read it *after* you
  have a working version, and compare. (Paths are relative to `renov-new/`.)

No solutions are written down here. That is the point.

---

## 1. Follow one request

**Goal:** understand exactly what happens between `curl` and the JSON.

**Touch:** nothing new. Add one `logger.info` of your own somewhere on the path.

**Done when:** you can say, without looking, in what order `cors`,
`express.json`, `requestLog`, the route, `notFoundHandler` and `errorHandler`
run — and why the error handler must come last. Try `curl localhost:4000/nope`
and predict the response before you run it.

**Then read:** `server/src/app.ts`, `server/src/middleware/requestLog.ts`.

---

## 2. Refuse to start without a database

**Goal:** a missing `DATABASE_URL` is a loud failure at boot, not a confusing
crash on the first request.

**Touch:** `server/src/config/index.ts`, `server/src/server.ts`.

**Done when:** with `DATABASE_URL` empty, `npm run dev` exits with a message
naming the missing key. With it set, it boots.

**Hint:** you need a Postgres. A free Supabase project works; so does
`docker run postgres`.

**Then read:** `server/src/config/index.ts` (`requireEnv`, `missingRequiredEnv`).

---

## 3. The first table

**Goal:** an `items` table: `id`, `name`, `quantity`, `expires_on` (a date),
`created_at`.

**Touch:** `server/prisma/schema.prisma`, a migration, `server/src/lib/prisma.ts`
(a client singleton).

**Done when:** `npx prisma migrate dev --name items` creates the table and
`npx prisma studio` shows it. Field names are snake_case, same as the columns.

**Then read:** `server/src/lib/prisma.ts`, the CLAUDE.md rule about snake_case
Prisma fields, and why there is no DTO layer.

---

## 4. List and create items

**Goal:** `GET /api/items` and `POST /api/items`.

**Touch:** `server/src/modules/items/` — `items.routes.ts`, `items.service.ts`,
`items.schemas.ts`. Mount the router in `routes.ts`.

**Done when:**
- a valid POST returns 201 with the row;
- a POST with no `name`, or a `quantity` of `-1`, returns 400
  `{ error, code: "VALIDATION_FAILED" }` — and the database was never touched;
- an unknown body field is stripped, not stored.

**Rule to hold yourself to:** the route parses with zod, the service talks to
Prisma, and neither does the other's job.

**Then read:** any `*.schemas.ts` + `*.routes.ts` pair in Rénov, and
`server/src/lib/errors.ts` (typed errors + `asyncHandler`).

---

## 5. Auth by default (the simple version)

**Goal:** every route except `/health` requires a header. Start with a dev
shared secret (`x-dev-key`), so you learn the middleware before Supabase.

**Touch:** `server/src/middleware/auth.ts`, `app.ts`.

**Done when:** `/health` works with no header; `/api/items` without it is 401
with a clear message; with it, 200. A NEW route you add later is protected
without you remembering to protect it.

**Then read:** `server/src/middleware/auth.ts` — `authGate`, `PUBLIC_ROUTES`.
Notice that public is an allowlist, not an opt-out.

---

## 6. Real auth with Supabase

**Goal:** replace the dev key with a Supabase access token. Items belong to a
user; you only see your own.

**Touch:** `auth.ts`, the `items` model (`owner_id`), the service queries.

**Done when:** two users each see only their own items, and a user asking for
someone else's item by id gets 404 (not 403, not someone else's data — think
about why).

**Then read:** `server/src/lib/jwt.ts`, `server/src/middleware/auth.ts`.

---

## 7. The list on the phone

**Goal:** the app shows your items.

**Touch:** `app/src/api/client.ts` (`getItems`), a `useItems` hook, an
`ItemsScreen`, a route in `app/src/app/`.

**Done when:** the screen has four real states — loading, empty ("nothing in
your pantry"), error (with a retry), and the list. No `fetch` inside a
component. Pull-to-refresh works.

**Then read:** `apps/customer/src/features/*/hooks/` and how screens use them;
`packages/api` for how Rénov's client attaches headers.

---

## 8. One status column, one writer

**Goal:** an item is `in_pantry`, `used`, or `discarded`. Only legal moves are
allowed (`in_pantry → used`, `in_pantry → discarded`, nothing back).

**Touch:** the model (`status`), `items.state.ts` with a `LEGAL_TRANSITIONS`
map and one `transitionItem()` function, a `PATCH /api/items/:id/status`.

**Done when:**
- an illegal move is 409, named;
- `transitionItem` is the ONLY code anywhere that writes `status` (grep for it);
- two requests racing to mark the same item cannot both win — use a
  conditional update (`updateMany` where `status = expectedFrom`) and check the
  count.

**Then read:** `server/src/modules/jobs/jobs.state.ts` — `transitionJobState`
and its `expectedFrom` guard. This is the most important pattern in Rénov.

---

## 9. The worker reminds you

**Goal:** the day before `expires_on`, you get a reminder. The API never sends
it; it only puts a delayed job on a queue. The worker sends it.

**Touch:** `server/src/queues/connection.ts`, `reminder.queue.ts`,
`server/src/worker/reminder.processor.ts`, `worker/index.ts`. Needs Redis
(`docker run redis` or a hosted one) and `bullmq` + `ioredis`.

**Done when:**
- creating an item schedules exactly one delayed job, keyed by item id (so
  re-scheduling is a no-op — and note BullMQ ids may not contain `:`);
- when it fires, the processor re-reads the item and does nothing if it is no
  longer `in_pantry`;
- for now "send" means: write a `reminders` row and log it;
- a missing `REDIS_URL` is an error in the log, never a silent skip.

**Then read:** `server/src/queues/expiry.queue.ts`,
`server/src/worker/expiry.processor.ts`, and the "golden rules" about the
server owning background work.

---

## After that (only if you want to)

- A sweep: a repeating job that finds reminders the delayed job missed.
- Expo push notifications instead of a log line.
- Realtime: the list updates when another device changes it.
- Deploy both processes to Railway.

Each of these exists in Rénov. Build yours first, then compare.
