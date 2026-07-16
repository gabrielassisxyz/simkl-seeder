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

- 2026-07-16 — Implemented `POST /api/action` route at `src/routes/api/action/+server.ts`; routes `watchlater` to `addToWatchlist`, `watched` to `addToHistory`, and returns HTTP 400 for unknown actions without touching Simkl. Added `src/routes/api/action/action.spec.ts` server tests covering all three paths plus invalid `simklId`; verified with `./bin/ci`.
- 2026-07-17 — Verified `src/lib/deck.svelte.ts` already implements the Phase 3 deck state task: typed `DeckItem`/`DeckState`, `createDeckState()` with runes (`$state`, `$derived`), `current`, `empty`, and `advance()` that stops at end. The existing `src/lib/deck.svelte.spec.ts` browser/splicable tests cover initial state, advancement, and empty flag; `./bin/ci` green (6 files / 16 tests). Marked task `[x]` in `task_plan.md`.
- 2026-07-17 — Verified `Card.svelte` already renders the current title with a Simkl poster URL and a bottom title bar; `src/lib/Card.svelte.spec.ts` browser tests cover title, poster image, and placeholder. Ran `npx vitest run --project client src/lib/Card.svelte.spec.ts` (3 passed) and `./bin/ci` (green). Marked task `[x]` in `task_plan.md`.
- 2026-07-16 — Implemented touch swipe gesture support in `src/lib/swipe.ts` action
  and `src/lib/Swipeable.svelte` wrapper, mapping right→`watchlater`, left→`skip`,
  up→`watched` with an 80 px threshold. Added `src/lib/Swipeable.svelte.spec.ts`
  browser tests covering all three action directions, small-movement suppression,
  and downward-swipe ignore. Verified `./bin/ci` green (8 files / 25 tests).
