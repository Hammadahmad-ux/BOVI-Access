# BOVI Access

Production website for **BOVI Access** — commercial rope access and
external building maintenance. *Access without Limits.*

Next.js 16 · TypeScript · Tailwind CSS v4 · Sanity (Phase 4) · Vercel

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in what you have; blanks are fine
npm run dev                    # http://localhost:3000
```

The site runs with **no environment variables set**. The hero falls back to
a genuine BOVI photograph, and Sanity stays inert until a project ID is
supplied.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | lint + typecheck + build |
| `npm run test:e2e` | Playwright QA across 7 viewports (build first) |
| `npm run assets:brand` | Regenerate logos and favicons |
| `npm run assets:images` | Regenerate web image derivatives |
| `npm run cms:migrate` | One-off Sanity seed (needs a write token) |

## Documentation

Read these before making significant changes.

| File | What it covers |
| --- | --- |
| **`CLAUDE.md`** | Project constitution — start here |
| **`CMS-HANDOVER.md`** | **For the client** — how to edit the website |
| `DEPLOYMENT.md` | Hosting, environment variables, going live |
| `DESIGN.md` | Colour, type, layout, motion, anti-patterns |
| `CONTENT-RULES.md` | What may and may not be written or claimed |
| `ROUTES.md` | URL contract and legacy Wix migration |
| `CMS-SCHEMA.md` | Sanity schema and the setup blocker |
| `QA-CHECKLIST.md` | Launch criteria |
| `client-assets/ASSET-INVENTORY.md` | Image provenance and gaps |

## Client media

`client-assets/raw/` and `client-assets/jpg/` hold the client's original
photography (~470MB) and are **git-ignored**. They are the working library
from which `public/` derivatives are generated; they are never modified.
Back them up separately.

## Two things to know

**The hero video is swappable from one value.** Set
`NEXT_PUBLIC_BOVI_HERO_VIDEO_URL`, or — from Phase 4 — the `heroVideoUrl`
field in Sanity. There is no hardcoded video URL in this codebase, and none
may be added. See `CLAUDE.md` §8.

**Never fabricate content.** No invented projects, clients, testimonials,
accreditations, statistics or coverage areas. If a fact is unknown, omit
the element. See `CONTENT-RULES.md`.

> This project replaces the client's live Wix site. **Never make changes to
> the live Wix site from this repository.**
