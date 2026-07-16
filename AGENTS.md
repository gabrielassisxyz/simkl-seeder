# simkl-seeder — agent guide

Current scope: a local, Tinder-style swipe UI over the Simkl API — swipe or hotkey to
triage movies & series into Simkl lists (right = watch-later, up = watched, left = skip,
no write). Don't expand beyond it without a present need; if a change drifts past it,
STOP and flag it.

Anti-goal: NOT a full Simkl client, NOT two-way sync, NOT a background daemon.

## Stack

- SvelteKit (Svelte 5, runes) + TypeScript, `adapter-node` — the local server hosts the
  app AND the Simkl proxy. Config lives in `vite.config.ts`: there is NO `svelte.config.js`
  in this SvelteKit version (adapter and compilerOptions are set inside the `sveltekit()`
  plugin). Don't "add it back".
- npm (pnpm is unavailable here — corepack is shimmed behind `mise`).
- Vitest: client tests run in a real browser (`vitest-browser-svelte`), server tests in node.

## Commands

- `npm run dev` — dev server at http://localhost:5173.
- `npm run build` / `npm run preview` — production build (node) / preview.
- `npm run check` — svelte-check (types).
- `npm run lint` / `npm run format` — `prettier --check` + eslint / `prettier --write`.
- `npm test` — vitest run (client + server projects).
- `./bin/ci` — the full gate; CI runs this verbatim, so green here == green in CI.
- `./bin/install-hooks` — activate the gitleaks pre-commit hook (run once per clone).
- `SIMKL_CLIENT_ID=… ./scripts/simkl-login.sh` — one-time PIN login → access_token.

## Deterministic gates (never skip)

- gitleaks pre-commit hook (`.githooks/`, installed by `bin/install-hooks`) + a gitleaks CI job.
- CI (`.github/workflows/ci.yml`) runs `./bin/ci` on push/PR to `master`.
- Secrets live in `.env` (gitignored); commit only `.env.example`.

## Simkl integration

- Auth: no OAuth flow. A pre-configured `client_id` (API key) + a per-user `access_token`
  (PIN flow, obtained once) in `.env`. Never commit them.
- Route every Simkl call through a SvelteKit **server route** (a proxy): sidesteps CORS and
  keeps the token server-side. Do not call Simkl directly from the browser.
- Endpoints: `GET /search/{type}` (discover), `POST /sync/add-to-list` (plantowatch =
  watch-later), `POST /sync/history` (watched). Headers: `client_id` API key +
  `Authorization: Bearer <access_token>`.
- **RATE LIMIT ~1000 requests/day — load-bearing.** Fetch MANY titles per request
  (paginated bulk discovery); never one request per swipe.
- **Local title DB (planned):** populate a local store of already-seen titles so the swipe
  deck is served from cache and Simkl reads stay well under the daily budget. Swipes still
  write to Simkl; reads come from the local DB where possible.

## Tests / TDD

- Bug fix → write the failing repro test first, then make it green. Feature → test the
  acceptance check.
- `./bin/ci` must be green before push. Tier 2 → one independent review before push.

## Common hurdles (append a line as you hit each)

- No `svelte.config.js` — config is in `vite.config.ts` (new sv convention). Don't re-add it.
- pnpm/corepack is blocked by `mise` on this machine — use npm.
- Component tests need a browser; CI runs `npx playwright install --with-deps chromium`.
- If `npm run dev` can't bind under ai-jail, add the dev port to `allow_tcp_ports` in `.ai-jail`.
- Simkl API base: docs live at api.simkl.org; calls default to api.simkl.com (env-configurable
  via `SIMKL_API_BASE`).

<!-- BEGIN universal-principles v3 -->

## Working principles

- **The human defines the WHAT; the agent decides the HOW.** Don't wait for line-by-line
  dictation. Plan first for non-trivial tasks: show the plan + to-do list, wait for approval.
- **Think before coding — don't assume, don't hide confusion.** State assumptions explicitly;
  if multiple interpretations exist, present them — don't pick silently. If a simpler approach
  exists, say so and push back. If a task is impossible under the stated constraints, or info
  is missing, say so — don't guess. (For trivial tasks, use judgment; this is bias, not ritual.)
- **Surgical changes — touch only what you must.** Every changed line traces to the task.
  Don't "improve" adjacent code, reformat, or refactor what isn't broken; match existing style
  even if you'd do it differently. Flag unrelated dead code — don't delete it. Remove only the
  imports / variables / functions your own change orphaned.
- **Chesterton's Fence — find the problem before undoing the decision.** A config, a flag, a
  workaround that looks arbitrary is a **fence**: someone put it there, probably to fix
  something that is invisible to you _because the fence is working_. You arrive with no
  history, so absence of a visible reason is evidence of your ignorance, not of its
  uselessness. When your fresh measurement contradicts what the human vaguely remembers
  ("I changed this once, because of some problem"), **your measurement is the suspect first**
  — it may be measuring the case that _isn't_ failing. Go find the original problem, then
  decide. _(A CIFS share was benchmarked with a big sequential `dd`, looked fast, and the
  local-disk download dir was "fixed" away — while the actual failure was random writes:
  par2, unrar, torrent piece-writes. Two wrong commits.)_
- **Goal-driven execution — define the success check, then loop to it.** Turn the task into
  something verifiable before coding: "add validation" → write tests for invalid inputs, then
  pass them; "fix the bug" → write a failing repro test, then pass it; "refactor X" → tests
  green before and after. For multi-step work, state a brief plan with a verify step each.
- **"Flaky" is not a diagnosis — test in the environment the thing actually runs in.** A
  component that fails _consistently_ under automation is being **mis-invoked**, not being
  unreliable; "it works when I run it by hand" is not evidence that it works. The shell you
  test in has a TTY, a `$HOME`, an `ssh-agent`, an interactive stdin — the systemd unit, the
  CI job and the scripted harness have none of those, so a passing manual run can be testing
  a different program. Reproduce it _there_ (start the unit, `env -u SSH_AUTH_SOCK`,
  `</dev/null`, `--dry-run` to print the real command line) before accepting "unstable" as a
  cause. **When a fix doesn't change the symptom, stop fixing and go look at what is actually
  being executed.** _(An interactive-mode flag with no TTY made one harness fail every review
  panel for weeks, written off as "flaky"; it was the wrong flag.)_
- **KISS — don't solve a problem you don't have yet.** Simplicity isn't "write less code";
  it's not building for a need that doesn't exist. Let structure emerge from the code.
- **YAGNI & flat.** No preventive abstractions, no single-use interfaces. Interfaces for
  real boundaries only. Architecture is _extracted_ once a pattern proves itself in real
  use — never designed up front for a user who doesn't exist yet. Need pulls architecture.
- **Order: make it work → make it right → make it fast** (Kent Beck), in that order. Most
  over-engineering is doing "right"/"fast" before a working thing exists to justify it.
- **Flag scope creep — a standing duty, not a suggestion.** When a solo tool starts being
  framed as a public / multi-user / multi-tenant / plugin-system / configurable-N-backends
  platform before a real, present need exists, STOP and ask: "Is this needed now?" Justify
  future-proofing against a need that exists _today_.
- **No silent decisions (comprehension debt).** Never make a silent architectural or
  design call — state it and record the rationale, so the reasoning is recoverable later.
- **Real decisions are presented in the chat, in isolation — never via popup.** When a
  design/architecture/scope/trade-off decision arises, surface it on its own: the options,
  what each means, pros/cons/trade-offs, and a recommendation — then decide together.
  Don't bury it mid-text or bundle it with other topics, and don't compress it into a
  quick-pick widget (e.g. AskUserQuestion) — the widget skips the reasoning and overlays
  the explanation. Widgets are for trivial short-answer picks only.
- **Long answers are written to be scanned, not read twice.** For recaps, status reports,
  batch reviews, plans, and any comparison of options: lead with the outcome in one line,
  then break the body into bullets and **bold** the load-bearing terms. Options are always
  a list — one bullet per option, the recommended one marked — never a paragraph the reader
  has to parse to find the choices. Reserve unbroken prose for short arguments; a wall of
  paragraphs costs more in re-reading than the structure would have cost in words.

## Git: branches, commits, PRs, comments

- **Ask the repo for its default branch; never assume one.** Most of mine are `master`, some
  are `main`, and a wrong guess sends a PR to a branch that does not exist — or, worse, has
  you "fixing" a URL that was right all along.
  `git symbolic-ref --short refs/remotes/origin/HEAD | sed 's|^origin/||'`, or
  `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`.
  Never commit directly to it: branch, then PR.
- **Branches** — Conventional Branch (conventionalbranch.org): `<type>/<kebab-description>`,
  types `feature/`, `bugfix/`, `hotfix/`, `chore/`, `release/`, `docs/`.
- **Commits** — Conventional Commits (conventionalcommits.org): `<type>(scope): <description>`,
  types `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `style`.
  Breaking change → `!` after the type or a `BREAKING CHANGE:` footer.
- **Atomic commits** — one logical change per commit, each independently green and
  revertible. Never `git add .` blind; split unrelated changes.
- **Always work in your own worktree — mandatory, not conditional.** Parallel sessions
  are opened freely and nothing signals their existence to you, so a "check whether another
  session is here first" step can never be reliable — the honest answer is always "maybe".
  The only collision-proof arrangement is structural: keep the main working tree on the
  default branch as a clean reference and **never work in it** — before your first write
  (commit, branch, rebase, stash; read-only exploration is exempt), create your own worktree
  and do everything there:
  `git worktree add ../<repo>-<task> -b <your-branch> <origin>/<default-branch>`. Do this
  **whether or not** you believe another agent is running — that belief is exactly what you
  cannot verify. Report which worktree/branch you used; remove it once merged. Only the human
  can see all the open sessions.
- **Pull requests** — describe **what + why**. _What_: a 1–3 line summary. _Why_ (the bulk):
  decisions, trade-offs, rejected alternatives. The diff shows the what; the PR explains why.
- **Comments** — always **WHY, not WHAT**: explain intent, never restate the obvious
  mechanics. Keep existing comments; they carry intent.

## Code style (baseline)

- Functions: 4–40 lines, one thing each (SRP). Files: under ~500 lines, split by responsibility.
- Names specific and unique — avoid `data`, `handler`, `Manager`, `util`.
- Explicit types. Early returns over nested ifs; max ~2 levels of indentation.
- Inject dependencies; wrap third-party libs behind a thin interface this project owns.
- No duplication — but don't extract _too early_. Tolerate duplication while the pattern is
  still forming; extract the abstraction _from_ proven, repeated code, never ahead of it.
- **Refactoring is not automatic.** After a large feature, list refactoring candidates
  (files > ~500 lines, duplicated logic, long functions, hardcoded config) and ask before
  pruning — the human decides, the tests are the safety net. Consolidate when the thing
  works and the seams are obvious, not before.

<!-- END universal-principles v3 -->
