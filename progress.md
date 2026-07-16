# progress.md — simkl-seeder

> One line per completed task, appended by the loop. This is the trajectory log —
> "why did it do that on iteration 7?" is answered here.

- 2026-07-15 — Captured `GET /movies/trending` fixture (50 movies) to
  `src/lib/server/__fixtures__/discover.json` and documented the field paths in
  `findings.md`. Verified the trending response contains `title`, `ids.simkl_id`,
  `poster`, and `overview` as expected.
- 2026-07-15 — Added `src/lib/server/env.ts` typed `simklConfig()` accessor with
  `SimklEnvError`, defaulting `SIMKL_API_BASE` to `https://api.simkl.com`. Added
  `src/lib/server/env.spec.ts` node tests covering happy path, default base, and
  missing `SIMKL_CLIENT_ID` / `SIMKL_ACCESS_TOKEN`; verified with `npx vitest run
  --project server src/lib/server/env.spec.ts`.
- 2026-07-15 — Fixed Prettier formatting in `src/lib/server/env.ts` (reviewer-rejected
  lint failure). Ran `./bin/ci`; green.
- 2026-07-15 — Added `src/lib/server/simkl.ts` typed client factory `createSimklClient()` with
  `discover()`, `addToWatchlist()`, and `addToHistory()`; `fetch` + config injected. Added
  `src/lib/server/simkl.spec.ts` node tests asserting trending URL, headers, write bodies using
  `ids.simkl`, and SimklApiError on non-OK response; verified with `./bin/ci`.

- 2026-07-16 — Implemented `GET /api/deck` route at `src/routes/api/deck/+server.ts`; normalizes Simkl trending items to `{ simklId, title, poster?, overview? }` and never leaks server credentials. Added `src/routes/api/deck/deck.spec.ts` server test asserting normalization and credential absence; verified with `./bin/ci`.
