# IDEA — simkl-seeder

## WHAT (one line)
A tool that lets ME triage movies & series Tinder-style — swipe right = watch later, left = skip, up = already watched — so that I can seed my Simkl lists fast, backed entirely by the Simkl API.

## Anti-goal (one line)
NOT a full Simkl client, NOT a two-way sync, NOT a background/daemon process — it is a one-direction swipe front-end whose actions write to Simkl.

## Done-check (one concrete verification)
Run the project, perform each action (watch later / skip / watched, plus "see more"), and confirm every action is reflected in my real Simkl account.

## Constraints
- Discovery data is fetched from the Simkl API; swipe actions are written back to Simkl. API docs: https://api.simkl.org/all-endpoints
- NO auth flow. Runs locally on my own network; access uses a Simkl API key/token that is configured once (no interactive OAuth, no login screen).
- Must be lightweight and work well on mobile as a PWA.
- Desktop is driven by keyboard hotkeys (e.g. w = watch later, s = skip, d = watched, m = see more — illustrative, not final bindings).
- Stack: anything light that works well enough — framework/backend choice left open for vision-scope.

## UI shape (from the interview, for context — not final spec)
- Card-based swipe deck: right = watch later, left = skip, up = already watched.
- Bottom of the card shows the title; a "description" tab holds the movie/show info plus custom lists.
- Desktop: hotkeys mirror the swipes. Mobile: touch swipes via PWA.

## Notes / reframe
- **Reframe (accepted):** this is NOT a data importer/seeder — it is a fast triage & discovery front-end for Simkl. The "seeder" effect is a consequence of swiping quickly populating your Simkl watch-later / watched lists.
- **Resolved:** swipe left (skip) writes NOTHING to Simkl — it only advances the deck. Only watch-later (right) and watched (up) produce Simkl writes.
- **Resolved:** no auth flow at all — the app runs locally on my network and uses a pre-configured Simkl API key/token; there is no OAuth screen or login.
