# Roadmap

A local, Tinder-style swipe UI over the Simkl API: triage movies & series into Simkl
lists by swipe or hotkey. This file is the public map — what exists, what is next,
what is deliberately not coming.

## What exists today (v1 — complete, done-check passed)

- **Swipe deck fed by one bulk discovery fetch** (`GET /movies/trending`) into an
  in-memory queue — one Simkl read per deck load, respecting the ~1000 req/day limit.
- **Three actions with the correct writes:** right → `plantowatch` (watch later),
  up → `history` (watched), left → skip (advances the deck, writes nothing).
- **See-more toggle** revealing the title's overview before deciding.
- **Two input modes:** touch swipes on mobile, keyboard hotkeys on desktop.
- **Server-side Simkl proxy** (SvelteKit server routes) — credentials stay
  server-side; the browser only calls local `/api/*` routes.
- **Credentials from `.env`**, obtained once via a PIN-flow script — no OAuth,
  no login screen.
- **Deterministic gates:** gitleaks pre-commit hook, `bin/ci` (lint, types,
  tests, audit) run verbatim by CI.

## Missing / natural next steps (v2 — layered onto v1, never a rebuild)

- **Local title DB:** serve the deck from cache and skip already-swiped titles,
  keeping Simkl reads well under the daily budget; deck refill / pagination on top.
- **Full PWA:** installable manifest, service worker, offline support.
- **Custom Simkl lists** from the card's description tab (after verifying what
  Simkl actually treats as a "list" beyond `plantowatch` / `history`).
- **Refactor pass:** list candidates once real use shows where the seams are.

## Deliberately out of scope

- A full Simkl client, two-way sync, or any background daemon — one direction only:
  swipes write to Simkl.
- Accounts, auth flows, multi-user. Solo, local, pre-configured token. Permanent.
- Read-back / dedup UI against existing lists.
- Undo / re-queue of a swipe; configurable hotkey bindings; filtering, sorting, or
  choosing the discovery source.
