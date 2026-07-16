---
last_reviewed: 2026-07-16
---

# Design taste — how I like UI

> On-demand context (**NOT** part of the always-loaded constitutional set). Read this whenever
> you build or review a UI for me — a tool, a dashboard, an app. It captures my visual taste as
> **reusable rules with the reason for each**, so what gets built starts from my aesthetic instead
> of a generic agent default.
>
> **Scope: product UI / tools, not landing pages.** I don't build marketing sites — there is no
> hero banner here. If a rule below sounds like it's about a landing page, it isn't for me.
>
> **How this reaches a build:** for a UI project, a repo-local `DESIGN.md` is seeded as a literal
> copy of this file for the maker to read; the reviewer reads this file directly. The accent
> travels as a *rule* (see below), so the maker resolves the concrete hue while building.
>
> Grounded in a design-taste interview (2026-07-16), Emil Kowalski's design-engineering
> principles (the motion section), and impeccable's documented ai-tell catalog. The
> `#E07850` + Space-Grotesk + terracotta "seed" from the old idea-to-planning dashboard was
> **rejected on purpose** — it is the exact AI default I most dislike (see Anti-references).

## North star, in one paragraph

Quiet, **monochromatic**, spacious product UI. Warm-neutral grounds, **one muted accent doing one
job**, strong grotesque titles, generous whitespace, a minimal top nav, crisp and restrained
motion. It should read as deliberate and calm — the opposite of the busy, terracotta-on-cream,
serif-title look that every AI tool falls into.

## Color

### Grounds (neutrals)

- **Dark ground: neutral charcoal `#17171A`.** Not pure black, not the bluish "developer dark".
  *(I reacted to a warm-vs-neutral spectrum and picked the neutral — my stated lean toward warm
  didn't survive seeing it.)*
- **Light ground: soft off-white `#FAF9F7`.** Barely warm — like my blog. **Not cream**: pushed
  further into beige it becomes a tell.
- **Never pure white** (`#FFFFFF` is harsh on a full surface) **or pure black.**
- **Both themes always exist** (CSS custom properties; light and dark get equal care).
  **Default-theme rule (keep it simple):** app for **mobile / PWA / phone** (e.g. simkl-seeder)
  → default **dark**; app for **desktop** → default **light**. *Why: I prefer light for dense
  desktop work, and on my laptop's poor screen dark is hard to read; phones lean dark.*

### The accent — a rule, not a fixed color

I don't want one accent for everything; the right hue depends on the tool. So I lock the *feel*
and leave the hue free.

- **Exactly ONE accent hue per tool.** It is the *only* chromatic color on the page — everything
  else is neutral. This is the whole point of "monochromatic" for me.
- **Locked (the muted-but-alive band):** saturation **S ≈ 30–45%**; lightness **L ≈ 52–60% on
  dark**, **≈ 42–50% on light** (so it holds contrast on the ground). Below ~30% S it goes dead;
  above ~45% it shouts. Both are wrong.
- **Free: the hue (H).** The builder picks it to fit the tool, from muted cool/earthy families —
  **teal, sage, dusty violet** are my confirmed likes. **Never orange / terracotta** — that warm
  accent is my #1 AI tell.
- **Intensity scales with purpose.** A tool that should *not* grab attention (a monitor like
  hardware-usage) sits at the **low** end of the band; something meant to feel livelier climbs
  toward the top. The band is the range; purpose picks the point.

### Monochromatic — one color, one job

- **Few colors, each mapped to a *thing*, never to a *magnitude*.** A percentage bar is the
  **same color at 12% and at 94%** — magnitude is read from the bar's length and the number, not
  from hue.
- **No severity traffic-lights** (green/amber/red by value). That specific busyness is what bugs
  me most; avoid it.
- **The rare exception:** a genuine error that truly must shout gets a *single* muted warning hue,
  used almost never (like impeccable's sparing vermilion) — not a gradient of status colors.
- Any semantic color is separate from the accent and stays minimal.

## Typography

- **Headings + UI: a grotesque / geometric sans with character.** **Not serif** — a serif title is
  my top AI tell. **Not Space Grotesk** either — it's the over-used "safe" AI face. Faces to
  explore: **Geist, Hanken Grotesk, Schibsted Grotesk, General Sans.**
- **Body: a clean neutral sans.** Keep running text near **65ch** and give it room to breathe.
- **Mono: only in technical apps, used sparingly** — for data, metrics, code. **Tabular numerals**
  wherever digits line up in columns. Installed & liked: **Cascadia, Iosevka**; also Commit Mono.
- **Titles carry the page** (the one thing my references — Attio, Sana — share): strong, large,
  with generous space around them. Since there's no hero, the *title* is the focal moment.

## Layout

- **Airy.** Generous whitespace; sit between "cockpit" (dense) and "zen" (empty), **leaning
  spacious**. One focus per glance.
- **Minimal, simple top nav.** The other thing my references share — an uncluttered header with
  lots of breathing room.
- **No hero banner.** These are tools, not landing pages.
- **Small radii, restrained borders.** Depth comes from material and hairlines, not big shadows or
  glow. Flat, sharply bounded — no nested cards, no wide rounded card-in-card.
- **It's a UI, scanned not read:** surface the summary before the detail; make what's interactive
  look interactive.

## Motion — crisp, small, alive, never too much

My taste is "a little life, nothing gratuitous". Emil Kowalski's rules match it, so I adopt them:

- **Under 300ms for UI**; 150–250ms typical; micro-interactions 100–160ms. Faster reads as more
  responsive.
- **`ease-out` for enter/exit; never `ease-in` on UI** (it feels sluggish). **No bounce** on tool
  UIs.
- **Animate only `transform` and `opacity`** (GPU; no layout thrash). Enter from `scale(0.95)` +
  opacity, **never from `scale(0)`** — nothing in reality vanishes to a point.
- **Every animation needs a purpose** (feedback, spatial continuity, state change). If it's only
  "looks cool" and I'll see it often, cut it. **Never animate keyboard-repeated actions.**
- **Respect `prefers-reduced-motion`:** keep opacity/color, drop movement.

## Anti-references — the AI tells I actively avoid

**My own top three tells** (I notice these instantly on an AI-made site):

1. **Serif fonts in titles.**
2. **Warm accents — especially orange / terracotta** (`#E07850` and family).
3. **Light backgrounds pushed too far into cream.**

**Plus the general ai-slop catalog** (impeccable's detector rules + frontend-design), all to avoid:

- cream/beige page ground; the `#F4F1EA` "tasteful AI" surface
- italic serif display; purple→blue gradient hero; gradient text
- the **icon-tile-stack** (a rounded-square icon tile above every heading); **hero eyebrow chip**;
  **repeated section kickers/eyebrows** on every section
- **nested cards**; wide rounded cards everywhere; **accent rail/border on rounded cards**
- the GPT tell: **hairline border + wide diffuse shadow**; **dark-glow**; glassmorphism / decorative blur
- **gray text on colored backgrounds**; low contrast; the default multi-hue **ai-color-palette**
- **bounce easing**; layout-transition jank; **cramped padding**; monotonous uniform spacing
- Bootstrap-generic, Material-heavy, **shadcn-defaults-on-everything** — the "every site is the
  same site" look

## How to apply (for whoever builds or reviews)

- Start from the grounds above + the accent **rule** (pick one hue inside the band; keep it the
  only color).
- **Hold the whole screen and ask: is this calm, spacious, one-accent, and free of the tells
  above?** The anti-references are a literal checklist.
- `impeccable detect` is a **free floor** — it catches the *presence* of slop, not the *absence*
  of taste. Passing it is necessary, never sufficient. Real quality is this whole document.
