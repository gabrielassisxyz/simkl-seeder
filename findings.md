# findings.md — simkl-seeder

> Durable memory across loop iterations. Each fresh agent reads this first.
> Start with the load-bearing decisions; iterations append discoveries below.

## Decisions (from IDEA.md / SCOPE.md)

- **WHAT:** a local, Tinder-style swipe deck over the Simkl API — swipe/hotkey to triage
  movies & series into Simkl lists. Right = watch-later (`plantowatch`), up = already watched
  (`history`), left = skip (no write, advance only).
- **Anti-goal:** NOT a full Simkl client, NOT two-way sync, NOT a background daemon. One
  direction: swipes write to Simkl.
- **Stack:** SvelteKit (Svelte 5, runes) + TypeScript, `adapter-node`. Config in
  `vite.config.ts` — there is NO `svelte.config.js` (do not add it). npm (pnpm blocked by
  mise). Vitest: client tests in a real browser (`vitest-browser-svelte`,
  `*.svelte.{test,spec}.ts`), server tests in node (`src/lib/server/**` excluded from client).
- **Storage (v1):** NONE. One bulk discovery fetch → in-memory queue. No SQLite, no cache,
  no local title DB — that is v2 (its value is the READ/dedup path, not the insert).
- **Done-check:** run `npm run dev`, perform watch-later + watched + skip + see-more, and
  confirm the two writes land in the real Simkl account.

## Simkl API facts (verified live via `./scripts/simkl-smoke.sh`)

- Base host `https://api.simkl.com` (env: `SIMKL_API_BASE`; docs are at api.simkl.org).
- Auth: API key in header `simkl-api-key: <SIMKL_CLIENT_ID>`; user token in
  `Authorization: Bearer <SIMKL_ACCESS_TOKEN>`. Both from `.env` (gitignored). No OAuth flow.
- **Route every Simkl call through a SvelteKit server route** — token stays server-side,
  sidesteps CORS. The browser calls only our own `/api/*` routes.
- **Discover (chosen for v1, verified live): `GET /movies/trending`** → large array of
  `{title, poster, overview, ids:{simkl_id}}`. Needs ONLY the `simkl-api-key` header (no
  token). `limit` appears ignored — the endpoint already returns a big batch, ideal for the
  one bulk fetch. `poster` is a path fragment (e.g. `54/5456742c…`), not a full URL — the
  Card task must resolve it to an image URL (verify Simkl's image CDN base then).
- Discover (also verified, not used): `GET /search/movie?q=…&limit=…` → array; id at
  `ids.simkl_id`. Kept as reference; trending is the v1 deck source.
- Watch-later: `POST /sync/add-to-list`, body `{movies:[{to:"plantowatch",ids:{simkl:ID}}]}`
  → 201 with `added`/`not_found`.
- Watched: `POST /sync/history` (same id shape).
- Verify a list: `GET /sync/all-items/movies/plantowatch`.
- **ID ASYMMETRY (load-bearing):** search RETURNS `ids.simkl_id`, but writes WANT `ids.simkl`.
- **RATE LIMIT ~1000 req/day (load-bearing):** ONE bulk fetch per deck load — never one
  request per swipe. Writes are one request per right/up swipe (skip writes nothing).

## Open decisions

- **Discovery source — RESOLVED:** `GET /movies/trending` (verified live 2026-07-15, chosen
  by Gabriel). See the API section above. Poster→URL resolution is the one detail left, owned
  by the Card task.

## Discoveries (appended by the loop)

- **Trending fixture captured (2026-07-15):** `GET /movies/trending` returned 50 movies
  with the documented shape. Saved to `src/lib/server/__fixtures__/discover.json`.
  The first item is *Harry Potter and the Chamber of Secrets* (`simkl_id: 54114`).
- **Config accessor added (2026-07-15):** `src/lib/server/env.ts` exposes typed
  `simklConfig(env?)` and `SimklEnvError`. Missing `SIMKL_CLIENT_ID` or
  `SIMKL_ACCESS_TOKEN` throws a named error; `SIMKL_API_BASE` defaults to
  `https://api.simkl.com`.
- **`.env` reaches the server routes via `$env/dynamic/private` (2026-07-16).** Vite does
  NOT copy `.env` into `process.env`, so `simklConfig()`'s `process.env` default is empty in
  the running app. Fix: the server routes import `{ env } from '$env/dynamic/private'` and
  call `simklConfig(env)` — that module loads `.env` in dev and reads the process env in
  prod. `simklConfig` stays pure (default `process.env`) so node tests are unchanged.
- **Use global `fetch`, NOT `event.fetch`, for Simkl calls (2026-07-16, load-bearing).**
  SvelteKit's `event.fetch` injects `Origin: http://localhost:5173` + `Sec-Fetch-Mode: cors`
  when it proxies to a third party. Simkl's `GET /movies/trending` then returns a **degraded
  payload with no `title`/`overview`** (only `ids`, `poster`, ratings). A plain server-to-
  server `fetch` sends no `Origin` and gets the full records. Both `/api/*` routes now inject
  the global `fetch`. This was latent because the route tests inject `event.locals.simklClient`
  and never hit the real fetch.
- **v1 done-check PASSED end-to-end (2026-07-16).** `./bin/ci` green (37 tests). Against the
  live API via `npm run dev`: `/api/deck` returned 50 titles with overviews and no credential
  leak; `POST /api/action` `watchlater`→200 and `watched`→200, `skip`→400 (no write). Both
  writes confirmed present in the real Simkl account: *Chamber of Secrets* (`54114`) in
  `plantowatch`, *Philosopher's Stone* (`54112`) in `completed`.
