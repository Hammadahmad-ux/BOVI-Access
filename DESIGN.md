# BOVI ACCESS — Design System

The visual constitution of this project. Tokens are defined in
`src/app/globals.css` under `@theme`; this document explains what they are
for and how to use them.

**Positioning:** *a specialist access contractor trusted to work on
expensive commercial buildings* — not *a local rope-access guy with a
website*.

Design register: premium, architectural, industrial, technical, commercial,
editorial, minimal, high-end, confident.

Design parameters: **variance 7/10 · motion 6/10 · density 4/10.**
Recognisable authorship, without becoming an experimental portfolio.

---

## 1. Colour

### Brand palette (client-supplied)

| Token | Hex | Role |
| --- | --- | --- |
| `--color-ink` | `#101211` | Primary black. Dark section ground. |
| `--color-ink-raised` | `#161917` | Raised surfaces on dark. |
| `--color-green` | `#2A7D25` | Brand green. CTAs, fills, large type. |
| `--color-moss` | `#4B534C` | Muted green-grey. Body text **on light**. |
| `--color-bone` | `#F5F4F0` | Warm off-white. Light section ground. |
| `--color-pure` | `#FFFFFF` | White. |

### Derived, accessibility-driven

Two extra steps exist because the brand palette alone fails WCAG in
specific pairings. They are not stylistic additions.

| Token | Hex | Why it exists |
| --- | --- | --- |
| `--color-green-bright` | `#4CAF45` | Brand green is **3.64:1** on ink — valid for large text and UI, **fails** for small text. This is **6.75:1**. Use for small green text, eyebrows, indicators and focus rings on dark. |
| `--color-mist` | `#A8B0A9` | `--color-moss` is **2.37:1** on ink and would fail. This is **8.5:1**. Muted body text on dark. |

### Measured contrast

| Pairing | Ratio | Verdict |
| --- | --- | --- |
| bone on ink | 17.1:1 | Pass |
| mist on ink | 8.5:1 | Pass |
| green-bright on ink | 6.75:1 | Pass (all text) |
| **green on ink** | **3.64:1** | **Large text / UI only** |
| white on green | 5.17:1 | Pass (CTA label) |
| moss on bone | 7.2:1 | Pass |

**Rule:** never put small text in `--color-green` on a dark ground. Use
`--color-green-bright`.

### Using green

Green is **intentional**, not atmospheric. Use it for:
the primary CTA · small indicators · selected hover states · numerals ·
arrows · section accents · active nav states.

Do **not** flood large areas with bright green without a specific reason.

### Hairlines

`--color-hairline-dark` (`bone / 14%`) and `--color-hairline-light`
(`ink / 12%`). Thin rules are the primary separator language. Heavy borders
and boxes are not.

### Gradients

**No decorative gradients.** One narrow exception: the hero uses a
top-to-bottom scrim over its photograph. That is a legibility device
required for text contrast over imagery, not decoration. Do not extend
gradients to buttons, cards, backgrounds or type.

---

## 2. Typography

| Role | Family |
| --- | --- |
| Display / headings | **Archivo** (400–800) |
| Body | **Barlow** (400–600) |

Loaded via `next/font/google` and bound to `--font-display` / `--font-body`.

### Scale

Every step is `clamp()`-based, so no viewport between 375px and 1440px+ is
unhandled.

| Token | Range | Notes |
| --- | --- | --- |
| `--text-h1` | 38 → 107px | line-height `0.90`, tracking `-0.035em`, weight 800 |
| `--text-h2` | 28 → 66px | line-height `0.95`, tracking `-0.028em`, weight 800 |
| `--text-h3` | 24 → 52px | line-height `1.02`, tracking `-0.022em`, weight 700 |
| `--text-h4` | 20 → 24px | weight 600 |
| `--text-h5` | 18 → 20px | weight 600 |
| `--text-body-lg` | 17 → 18px | |
| `--text-body` | 15 → 17px | line-height `1.6` |
| `--text-small` | 13 → 14px | |
| `--text-eyebrow` | 12 → 13px | uppercase, tracking `0.14em`, weight 600 |

### Case — hard rule

**UPPERCASE is reserved for the three display statements**: the hero H1, the
coverage statement, and the closing CTA. They are short, declarative, and
carry the page.

**Every other heading is sentence case.** A section heading that reads as a
sentence ("Specialist works, delivered at height.") set in uppercase competes
with the hero instead of following it. If a heading has a full stop, it is
sentence case.

### Heading wrapping — hard rule

**One letter per line is a design failure.** Headings are set with:

```css
text-wrap: balance;
overflow-wrap: normal;
word-break: keep-all;
```

Where a heading must break at specific words (the hero, the final CTA, the
service-area statement), each line is its own `<span class="block">`. Do
not rely on natural wrapping for those.

---

## 3. Layout

- `Container` is the **only** horizontal-padding authority. Sections never
  set their own side padding.
- Widths: `narrow` 68ch (prose) · `page` 1440px (standard) · `wide` 1640px.
- Gutters: `--spacing-gutter` 20px mobile, `--spacing-gutter-lg` 40px from
  `md` up.
- Section rhythm: roughly `py-16` mobile / `py-24`–`py-28` desktop. Vary it
  deliberately; do not make every section identical.

### Radius

`--radius-sm` **4px** (default) · `--radius-md` **6px** (maximum).

**Anti-pattern:** pill buttons, 20–40px radii, rounded cards everywhere.

---

## 4. Section rhythm — dark / light

Alternate dark and light grounds to give the page structure:

- **Dark** (`bg-ink`): header, hero, page mastheads, final CTA, footer, 404.
- **Light** (`bg-bone`): body content, service lists, prose.

Any dark section must carry `data-ground="dark"` — the global focus-ring
colour keys off it.

---

## 5. Buttons

Three variants only, all with a 44px minimum touch target.

| Variant | Treatment |
| --- | --- |
| `primary` | Solid brand green, white label. The quote CTA. |
| `secondary` | Hairline border, inherits ground foreground. |
| `ghost` | Text only, underline on hover. |

Labels are uppercase Archivo with `0.08em` tracking. `Button` picks its
element from `href`: a real `<a>` for navigation, a real `<button>` for
actions. Never a clickable div.

---

## 6. Imagery

**Genuine BOVI photography only.** Provenance in
`client-assets/ASSET-INVENTORY.md`.

Practical constraint worth knowing: **almost all client photography is
portrait** (3024×4032 phone shots). Compositions must be designed for
portrait sources — full-bleed `object-fit: cover` with tuned
`object-position`, portrait-friendly editorial grids, and offset crops.
Do not design layouts that assume wide landscape imagery.

- Strong, decisive crops. Avoid timid centred boxes.
- Always give `width`/`height` or `fill` so aspect ratio is reserved and
  nothing shifts.
- `priority` only on the hero still. Everything below the fold lazy-loads.
- Alt text describes the actual photograph.

---

## 7. Hero visual language

- Full-viewport dark section, content bottom-aligned.
- The still image is always rendered and is the LCP element; video layers
  over it once playable.
- Readability: `bg-ink/55` flat overlay plus a vertical scrim.
- H1 set in three hard-broken lines: `ACCESS` / `WITHOUT` / `LIMITS`.
- Trust rail sits below a hairline, with small green square markers.

---

## 8. Service interaction (Phase 2)

Desktop target: **sticky image left, numbered editorial rows right.**

```
01  Commercial Window Cleaning        →
02  Brickwork & Repointing            →
03  Gutter Cleaning                   →
```

Hover/focus/scroll changes the sticky image, turns the active numeral
green, and translates the arrow.

**Mobile must not depend on hover.** It degrades to a straightforward
stacked list — which is what `/services` renders today.

Do **not** build six generic cards.

---

## 9. Project composition (Phase 3/4)

Projects are proof, not a blog. Use varied editorial composition — one
large landscape, one portrait, one offset landscape — rather than three
identical cards. Show only verified fields; render nothing for the rest.

---

## 10. Motion

Target **6/10**. See `CLAUDE.md` §11 for the library split and the hero
sequence.

Principles:

- Motion clarifies hierarchy and state. It never gates content.
- Entrances are short and once-only. No replay on every scroll.
- Nothing decorative may delay an enquiry action.
- `prefers-reduced-motion` is honoured globally; new motion must respect it.

---

## 11. Accessibility

- Visible focus on everything: 2px `--color-green-bright` outline, 3px
  offset; `--color-bone` on dark grounds.
- Semantic HTML. Correct button-vs-link semantics.
- Decorative numerals and icons are `aria-hidden` so link names stay clean
  ("About", not "02 About").
- 44px minimum touch targets.
- Skip link to `#main`.
- One `<h1>` per page; no skipped heading levels.

---

## 12. Anti-patterns — do not ship

SaaS cards · pill UI · 20–40px radii · large drop shadows · decorative
gradients · glassmorphism · generic icon grids · playful startup styling ·
cartoon graphics · floating 3D objects · endless marquees · cursor
followers · gimmicky scroll effects · a wall of identical cards ·
centre-aligned everything · hover-dependent mobile UI.

---

## 13. Reference discipline

TradeTech Rope Access may be used as a **quality benchmark only** —
hierarchy, commercial confidence, service clarity. Never copy their
sections, geometry, media, copy, branding or animation. BOVI has its own
identity.
