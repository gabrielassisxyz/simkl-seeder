# task_plan.md — simkl-seeder v1

Executable checklist for the forge loop. Each task is one atomic change: one logical
diff, reviewable on its own, with a `done when:` acceptance check the agent and the
verifier both test against. Do tasks in order — dependencies come first.

Scope is v1 from `SCOPE.md`: a swipe deck fed by ONE bulk fetch, three actions
(right→plantowatch, up→history, left→advance only), see-more description, touch + hotkey
input, all Simkl calls through a server proxy, creds from `.env`. No local DB, no PWA —
those are v2. Key facts live in `findings.md`; read it first every iteration.

## Phase 1 — Server foundation (proxy + config)

- [x] **Capture the discovery fixture.** Source is `GET /movies/trending` (verified live —
  returns a large array of `{title, poster, overview, ids.simkl_id}` with only the api-key
  header, no token). — done when: a real trending response is saved to
  `src/lib/server/__fixtures__/discover.json` for tests to load, and `findings.md`'s API
  section notes the field paths (title, `ids.simkl_id`, poster, overview).

- [x] **Config accessor `src/lib/server/env.ts`.** Read `SIMKL_CLIENT_ID`,
  `SIMKL_ACCESS_TOKEN`, `SIMKL_API_BASE` (default `https://api.simkl.com`) from the server
  environment; explicit types. — done when: a node test asserts it returns the values when
  set and throws a clear, named error when `SIMKL_CLIENT_ID` or `SIMKL_ACCESS_TOKEN` is
  missing.

- [x] **Simkl server client `src/lib/server/simkl.ts`** with `discover()`,
  `addToWatchlist(simklId)`, `addToHistory(simklId)`; `fetch` injected as a dependency; sends
  `simkl-api-key: <client_id>` + `Authorization: Bearer <token>` headers. — done when: node
  tests with a mock fetch assert each method hits the right URL/method, sends both headers,
  and the two write bodies use `ids.simkl` (NOT `simkl_id`) in the
  `{movies:[{to:…,ids:{simkl:ID}}]}` shape.

## Phase 2 — API routes (the proxy surface the browser calls)

- [x] **`GET /api/deck` route** (`src/routes/api/deck/+server.ts`) → one `discover()` call,
  returns a normalized array `{ simklId, title, poster?, overview? }`. — done when: a node
  test invokes the handler with a stubbed client and gets the normalized array back; the
  response never contains the token or client_id.

- [ ] **`POST /api/action` route** (`src/routes/api/action/+server.ts`), body
  `{ simklId, action }` where `action ∈ {'watchlater','watched'}` → routes to
  `addToWatchlist` / `addToHistory`. — done when: a node test asserts `watchlater` calls
  add-to-list, `watched` calls history, and an unknown/`skip` action returns HTTP 400 without
  any Simkl write (left/skip never reaches this route — it advances client-side only).

## Phase 3 — Client deck UI

- [ ] **Deck state `src/lib/deck.svelte.ts`** (runes): fetch `/api/deck` once, expose
  `current`, `advance()`, and an `empty` flag. — done when: a test seeds a queue and asserts
  `advance()` moves to the next item and flips `empty` when the queue is exhausted.

- [ ] **`Card.svelte`** — renders the current title (poster if present) with the title
  visible at the bottom of the card. — done when: a browser test renders the component with a
  title prop and asserts the title text is on screen.

- [ ] **See-more / description toggle on the card** — a tap target (mobile) / control that
  reveals the overview text. — done when: a browser test toggles it and asserts the overview
  text appears, then hides.

- [ ] **Touch swipe gestures** wired to actions: right→`watchlater`, up→`watched`,
  left→`skip`. — done when: a browser test simulating each swipe direction fires the matching
  action callback with the correct action name.

- [ ] **Keyboard hotkeys** mapped to the same three actions + see-more (hardcoded default
  bindings). — done when: a browser test dispatching each keydown fires the matching action
  callback.

## Phase 4 — Wiring + done-check

- [ ] **Wire the page** (`src/routes/+page.svelte`): mount deck + Card + touch + hotkeys;
  on `watchlater`/`watched` POST `/api/action` then `advance()`; on `skip` just `advance()`;
  show the empty state when the deck runs out. — done when: a browser test asserts a
  right-swipe POSTs `{action:'watchlater'}` then advances, and a left-swipe advances WITHOUT
  any network call.

- [ ] **Full-gate + manual done-check.** — done when: `./bin/ci` is green AND, running
  `npm run dev`, performing watch-later + watched + skip + see-more against the real API, the
  two writes are confirmed present in the real Simkl account (via the app or
  `./scripts/simkl-smoke.sh` read); the result is recorded in `findings.md`.
