# SCOPE — simkl-seeder

## Vision

A single-screen swipe deck over the Simkl API. You open the app (desktop or phone on your own network), a card shows one movie or series, and you flick through them: right to save it for later, up to mark it already watched, left to dismiss and move on. Tap the card to see its description before deciding. Each right/up flick writes straight to your real Simkl lists; each left just advances the deck. It feels less like managing a catalog and more like clearing a pile — fast, one title at a time, no menus, no sync settings, no login.

## v1 must-haves

The shortest list that makes the done-check pass ("run the project, perform each action — watch later / skip / watched, plus see-more — and confirm every write lands in my real Simkl account").

- **Swipe deck fed by ONE bulk discovery fetch.** A single Simkl request populates a queue of many titles at startup; the deck is served from that queue. One card at a time. (One request — not one per swipe. This is the rate-limit fence from AGENTS.md, load-bearing.)
- **Three swipe actions with the correct writes:**
  - right → `POST /sync/add-to-list` `plantowatch` (watch later).
  - up → `POST /sync/history` (already watched).
  - left → advance the deck only, **no Simkl write**.
- **See-more / description view** — tap (mobile) or a hotkey (desktop) reveals the card's title + synopsis before deciding. Explicitly listed in the done-check.
- **Two input modes:** touch swipe on mobile, keyboard hotkeys on desktop (both map to the same three actions + see-more).
- **Server-side Simkl proxy.** Every Simkl call goes through a SvelteKit server route so the `access_token` and `client_id` stay server-side (the asymmetry rule too: search returns `ids.simkl_id`, writes want `ids.simkl`).
- **Credentials from `.env`**, configured once — no OAuth, no login screen (already the project's auth model).

That's it. If a feature is not on this list, it is not required to pass the done-check, so it is not in v1.

## Explicitly out of scope (v1)

Named so the loop does not wander into them:

- **Local title DB / seen-titles cache.** AGENTS.md marks it _planned_; it is a make-it-fast optimization, not needed to pass the done-check. The insert side is trivial (`INSERT OR IGNORE` on the content id) — but a write-only table buys nothing; its value is the READ side (serve the deck from cache, skip already-swiped cards to stay under the read budget), which needs a read+filter path. That read path is the v2 work. → v2.
- **Full PWA** — installable manifest, service worker, offline support. Mobile just needs to work in the browser with touch. Installability/offline → v2.
- **Undo / re-queue a swipe.** Once you flick, it's gone from the deck.
- **Custom / arbitrary Simkl lists** beyond `plantowatch` + `history`. The IDEA's "custom lists" live in the card's description/about tab (not a swipe gesture), so they don't touch the three-gesture input — the write is the same POST with a different `to`. Deferred to v2; before building it, verify what Simkl actually calls a "list" (fixed statuses vs arbitrary named lists — only `plantowatch`/`history` are verified live so far).
- **Filtering, sorting, or choosing the discovery source** (genre, year, trending vs search toggle). v1 ships one fixed bulk source.
- **Multiple discovery pages / infinite deck refill.** One fetch, one queue; when it's empty, it's empty. Pagination → v2.
- **Configurable hotkey bindings** — hardcode sensible defaults.
- **Any read-back / two-way sync UI** (showing what's already on your lists, dedup against existing lists). Anti-goal territory.
- **Accounts, auth flows, multi-user.** Solo, local, pre-configured token. Permanent.

## Milestones

Two only. v2 improves v1 **in place** — never a rebuild.

- **v1 — works.** The must-haves above. Done when the done-check passes: run it, do each of the four actions, and see the two writes land in your real Simkl account.
- **v2 — right / fast.** Improvements layered onto v1, pulled by real use once v1 works:
  - Local title DB so the deck is served from cache and Simkl reads stay under the daily budget; deck refill / pagination on top of it.
  - Full PWA (manifest, offline, install prompt).
  - Refactor pass: whatever v1 proved needs seams (see AGENTS.md "Refactoring is not automatic" — list candidates, human decides).
