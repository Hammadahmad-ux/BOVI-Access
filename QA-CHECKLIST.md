# BOVI ACCESS — QA Checklist

Hard completion criteria. The site does not launch until every item passes.

```bash
npm run check      # lint + typecheck + production build
npm run test:e2e   # Playwright across all seven viewports (build first)
```

`e2e/foundation.spec.ts` encodes many of these as executable guards, so
they cannot silently regress. **Add every new route to its `ROUTES`
array.**

Legend: **Automated** = enforced by a test · **Manual** = human check.

---

## 1. The twenty hard checks

| # | Requirement | Enforcement | Phase 1 |
| --- | --- | --- | --- |
| 1 | Zero accidental horizontal scrolling | Automated — `scrollWidth - clientWidth <= 1` on every route × 7 viewports | **Pass** |
| 2 | No broken links | Automated (no `#`/empty hrefs) + `typedRoutes` compile check | **Pass** |
| 3 | Functional mobile menu | Automated — opens, lists all 6 pages, Escape closes, navigates, releases scroll lock | **Pass** |
| 4 | Proper favicon | `src/app/icon.png` (512) + `apple-icon.png` (180), from the real BOVI mark | **Pass** |
| 5 | Correct page titles | Automated — every route matches `/BOVI Access/` | **Pass** |
| 6 | Meaningful meta descriptions | Automated — present and > 50 chars on every route | **Pass** |
| 7 | Correct footer links | Generated from `footerNav` + `services`; `typedRoutes` verifies | **Pass** |
| 8 | Useful custom 404 | Automated — returns 404, renders H1, lists all pages and services | **Pass** |
| 9 | Dynamic copyright year | `new Date().getFullYear()` in `Footer.tsx` | **Pass** |
| 10 | Compressed / optimised images | `next/image` + AVIF/WebP; derivatives via `npm run assets:images` | **Pass** (revisit per-image in Phase 5) |
| 11 | No broken buttons or CTAs | `Button` requires a `Route`; broken CTA = compile error | **Pass** |
| 12 | Form success messages | — | **Phase 4** |
| 13 | Form error messages | — | **Phase 4** |
| 14 | Zero visible placeholder text | Manual + `CONTENT-RULES.md` §3 | **Pass** |
| 15 | Zero unused / dead nav items | Every `primaryNav` entry resolves; `typedRoutes` enforces | **Pass** |
| 16 | No mobile overflow | Automated — same guard as #1 at 430/390/375 | **Pass** |
| 17 | Logo clickable, links to `/` | Automated — `href="/"`, plus a no-clipping height assertion | **Pass** |
| 18 | Phone clickable — `tel:+447990377780` | Automated | **Pass** |
| 19 | Email clickable — `mailto:info@boviaccess.co.uk` | Automated | **Pass** |
| 20 | Full mobile optimisation | Manual, ongoing | **Phase 5** |

---

## 2. Additional hard QA

| Requirement | Enforcement | Phase 1 |
| --- | --- | --- |
| No console errors | Automated — console + `pageerror` on every route | **Pass** |
| No hydration errors | Covered by the console guard | **Pass** |
| No TypeScript errors | `npm run typecheck` | **Pass** |
| No lint failures | `npm run lint` | **Pass** |
| No dead `#` links | Automated | **Pass** |
| Exactly one `<h1>` per page | Automated | **Pass** |
| Meaningful heading hierarchy | Manual — no skipped levels | **Pass** |
| Keyboard focus states | Global `:focus-visible`, ground-aware | **Pass** |
| Sufficient contrast | Measured — `DESIGN.md` §1 | **Pass** |
| Alt text on images | Required at component and schema level | **Pass** |
| Reduced motion respected | Global `@media` block | **Pass** |
| Touch targets ≥ 44px | `min-h-11` on buttons; 44px icon buttons | **Pass** |
| Form labels | — | **Phase 4** |
| Image aspect-ratio stability | Explicit `width`/`height` or `fill` everywhere | **Pass** |
| No dead components | Manual | **Pass** |
| No obvious a11y violations | Manual + axe pass in Phase 5 | Phase 5 |

---

## 3. Responsive viewports — mandatory

Every one must be clean. All seven are Playwright projects.

`1440` · `1280` · `1024` · `768` · `430` · `390` · `375`

Mobile is designed intentionally, not shrunk from desktop:

- 20px side gutters (`--spacing-gutter`), 40px from `md` up
- Clean type at every step — no one-letter-per-line heading wrapping
- Proper section spacing, logical stacking
- Usable controls, no hover-dependent UI
- Appropriate media crops for **portrait-source** photography

---

## 4. Accessibility

- [x] Semantic HTML and landmarks
- [x] Skip link to `#main`
- [x] Visible focus on every interactive element
- [x] Correct button-vs-link semantics
- [x] Decorative numerals/icons `aria-hidden` (link names stay clean)
- [x] Mobile menu: `role="dialog"`, `aria-modal`, focus trap, Escape, scroll lock, focus returns to trigger
- [x] `aria-expanded` / `aria-controls` on the menu trigger
- [x] `aria-current="page"` on active nav
- [x] `lang="en-GB"`
- [ ] Full axe/Lighthouse a11y sweep — **Phase 5**
- [ ] Screen-reader pass on the enquiry form — **Phase 4**

---

## 5. SEO

Per page: title · meta description · canonical · Open Graph ·
Twitter card · one logical `<h1>` · heading hierarchy · internal links ·
image alt text.

- [x] `sitemap.xml` — explicit route list, service URLs generated
- [x] `robots.txt` — `/studio` disallowed
- [x] Organization JSON-LD (no fake ratings, reviews or awards)
- [x] Service JSON-LD on service pages
- [x] BreadcrumbList on service pages
- [ ] FAQPage — only when genuine visible FAQs exist
- [ ] Legacy URL audit complete — **`ROUTES.md` §3**

Natural topic areas: commercial rope access · rope access London ·
commercial building maintenance · external building maintenance ·
commercial window cleaning · repointing · gutter cleaning · external pipe
repairs · DOFF cleaning · commercial property maintenance.
**Do not keyword-stuff.**

---

## 6. Performance targets

| Metric | Target |
| --- | --- |
| Lighthouse Performance | 90+ realistically |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 95+ |
| LCP | ≤ 2.5s |
| CLS | ≤ 0.1 |
| INP | ≤ 200ms |

Do not sacrifice real visual UX chasing synthetic 100s.

Image rules: correct dimensions · responsive `sizes` · lazy-load below the
fold · `priority` **only** on the hero still · no layout shift. Hero video
never blocks LCP — the still is the LCP element, video layers over it once
playable, and is suppressed below 768px and for reduced-motion users.

- [ ] Lighthouse run on the production deployment — **Phase 5**

---

## 7. Forms — Phase 4

- [ ] Fields: Name · Company · Email · Phone · Project Location · Service Required · Project Details · Preferred Contact Method · Photo/File Upload
- [ ] React Hook Form + Zod (`src/lib/forms/quote-schema.ts` — already written)
- [ ] Client-side validation
- [ ] Server-side validation against the **same** schema
- [ ] Loading state
- [ ] Success message
- [ ] Error message
- [ ] Honeypot (`website` field — already in the schema)
- [ ] Rate limiting / spam protection
- [ ] MIME validation (`validateUpload` — already written)
- [ ] File-size validation (8MB per file, max 5)
- [ ] Accessible labels, focus and error handling
- [ ] Real delivery via Resend — **no fake submission**

---

## 8. Pre-launch — client actions outstanding

1. **Confirm trust claims in writing** — IRATA Level 3, Fully Insured, 18+ Years at Height, RAMS-led. Then set `verified: true`, or remove.
2. **Complete the legacy URL audit** — `ROUTES.md` §3.
3. **Supply the hero video URL** — or confirm the photograph ships.
4. **Create the Sanity project** — `CMS-SCHEMA.md` §1.
5. **Supply company registration details** — footer and privacy policy.
6. **Legal review of `/privacy`.**
7. **Supply verified project content** — 3–6 projects minimum.
8. **Clarify the Liverpool photography** against the stated coverage.
9. Configure `RESEND_API_KEY` and verify the sending domain.
10. Set `NEXT_PUBLIC_SITE_URL` per environment on Vercel.
11. Keep Wix live until DNS propagates; monitor Search Console for 404 spikes.

---

## 9. Phase results

### Phase 1 (foundation)

```
Lint PASS · Typecheck PASS · Build PASS (21 pages) · E2E 271 passed
```

Two defects were caught by these gates: the homepage shipped without the
brand in its `<title>` (Next's `title.template` does not apply to the root
`page.tsx`), and the stacked logo was clipped by the 64px mobile header.

### Phase 2 (homepage)

```
Lint PASS · Typecheck PASS · Build PASS (21 pages)
E2E 327 passed, 0 failed, 16 skipped (viewport-gated by design)
Visual review at 1440 / 1280 / 1024 / 768 / 390
```

A six-dimension review (design, accessibility, responsive, content, code,
performance) produced 71 findings; each was independently re-verified by an
adversarial pass that rejected roughly half. **35 were confirmed.** Fixed in
this phase:

| Severity | Defect | Fix |
| --- | --- | --- |
| High | `font-600` / `font-700` / `font-800` are not real Tailwind v4 utilities — they emit **no CSS**, so 7 display headings silently rendered at weight 400 | Replaced with `font-semibold` / `font-bold` / `font-extrabold` |
| High | Motion server-renders entrance states as inline `opacity:0`, so with JS disabled the page shipped visually blank | Every animated element carries `data-reveal`; a `<noscript>` rule restores it |
| High | Hero eyebrow and body text failed AA over the photograph (4.08:1) — the measured 8.5:1 assumed flat ink, not a scrimmed image | Hero now uses the `strong` scrim |
| High | Desktop header broke between 1024–1077px: nav labels split mid-word and the CTA wrapped | Desktop nav moved to `xl`; the full-screen menu now serves up to 1280 |
| High | Mobile menu's scroll lock outlived the panel if the viewport crossed the breakpoint while open, leaving the page unscrollable | Panel closes on the media-query change; lock lifetime tied to the panel |
| Medium | Project card link names were polluted by image alt text | Card images are `alt=""`; the link's category label carries the name |
| Medium | "Photos can be attached to your enquiry" promised a capability the site does not yet have | Replaced until the Phase 4 form accepts uploads |
| Medium | `Logo` hardcoded `priority`, so the footer logo preloaded ahead of the hero LCP image | `priority` is now opt-in; only the header sets it |
| Medium | Section eyebrows announced as "01 BOVI Access" | Numeral group is `aria-hidden` |
| Medium | Footer links were 18px tap targets | `min-h-11` |
| Medium | `quality={72}` was silently discarded — Next 16 validates against `images.qualities` | Declared in `next.config.ts` |
| Medium | Introduction left a ~500px void between heading and link | Link moved under the heading |

**Deferred, tracked, not lost** (low severity or Phase 3+ scope): heading-case
consistency across sections; `AudienceSection` column dead space and baseline
drift below 1440; footer single-column range at 640–1023; mobile-menu gutter
at 768–1023; skip-link focus-ring clipping and `<main>` not being focusable;
hero CTA widths at 390; "EAST" orphaning onto its own line at 390; the unused
`gsap` / `lenis` dependencies.

### Phase 3 (secondary site)

```
Lint PASS · Typecheck PASS · Build PASS (21 static pages + 8 service pages)
E2E 524 passed, 0 failed, 22 skipped (viewport-gated)
Internal link crawl: 15 routes reached, 0 broken links, 0 redirect loops
Visual review: About, Services, 3 service pages, Projects, Contact @ 1440/768/390
```

**The five deferred Homepage issues are closed:**

| Issue | Root cause | Fix |
| --- | --- | --- |
| Heading case | No stated rule, so sections drifted | UPPERCASE reserved for the three display statements (hero, coverage, closing CTA); everything else sentence case. Rule written into DESIGN.md §2 and the Services heading corrected. |
| AudienceSection baseline drift | A two-line title pushed its column off the shared baseline | Two lines reserved on the `h3` from `sm` up |
| Footer single column 640–1023 | Grid went straight from 1 to 3 columns at `lg` | `sm:grid-cols-2` added |
| Skip-link focus ring clipped | `margin:0` on focus put it flush in the viewport corner | Offset by `0.75rem`; `<main>` also given `tabIndex={-1}` so the skip link actually moves focus |
| "EAST" orphaning at 390px | 14 characters cannot fit one line at the `h1` step on a 390px screen | Coverage statement steps down to `h2` below `sm` |

Also fixed while in the same code: `Route` without a type parameter silently
excludes dynamic routes, so `ArrowLink` was rejecting every
`/services/<slug>` link — it is now generic over the route, as `next/link`
is, and service slugs stay literal via `satisfies`.

Phase 3 additions to the QA suite: all eight service routes are in the
sweep (including the two longest titles, which is where responsive
typography breaks first), plus a bounded internal-link crawl.

**Playwright worker count is capped at 3.** Seven viewport projects at full
parallelism saturate `next start`'s single-process image optimiser, which
then returns 5xx and trips the console-error guard — a harness artefact,
not a site defect. Capping keeps the suite deterministic without weakening
any assertion.
