# BOVI ACCESS — CMS Schema (Sanity)

Schema design in `sanity/schemaTypes/index.ts`.

---

## 1. Status

**CONNECTED.** Project `4x76hdgl`, dataset `production`.

The eight service documents and the six project documents are migrated and
the frontend renders from Sanity. Ownership still sits with a developer
account and must be transferred — see DEPLOYMENT.md §6.

| Piece | State |
| --- | --- |
| Schemas | Registered in `sanity.config.ts` |
| Studio | Mounted at `/studio`, with client-facing structure and singletons |
| Content provider | `src/lib/content/provider.ts` — every page reads through it |
| Image pipeline | `src/lib/sanity/image.ts`, hotspot-aware, CLS-safe |
| Publish → live | `/api/revalidate`, signature-verified |
| Seed scripts | `npm run cms:migrate` (8 services) and `npm run cms:seed-projects` (6 projects + images), both idempotent |

Until a project ID is set, `/studio` shows setup instructions and every
page serves its verified local content. See DEPLOYMENT.md §2.

**GROQ queries are now verified against the real dataset.** The Portable
Text extraction was the one that needed correcting: `pt::text(@)` per block
returns one string per paragraph, which is what the template renders.
Confirmed live — 2 overview paragraphs and 3 delivery items on
`drainage-external-pipe-repairs`.

### What is needed from the client

1. Renan creates a Sanity account at https://sanity.io (free tier is
   sufficient for this site).
2. He creates a project — suggested name **BOVI Access** — with dataset
   `production`.
3. He supplies the **Project ID** (visible in the Sanity dashboard).
4. Optionally, a read token for draft previews.

Then set in `.env.local` and on Vercel:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<project id>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=<server-only token>
```

**Do not invent a project ID.** `sanityConfig.isConfigured` returns `false`
until one is supplied, and the Sanity client must not be imported into a
rendering path before then.

### What is already built

| Item | Location | State |
| --- | --- | --- |
| Schema design | `sanity/schemaTypes/index.ts` | Complete |
| Read client | `src/lib/sanity/client.ts` | Written, inert |
| Image URL builder | `src/lib/sanity/image.ts` | Written |
| CDN image host allowlisted | `next.config.ts` | Done |
| `/studio` route | — | Not mounted |

Schemas are written as **plain schema objects**, not `defineType(...)`
calls, so the repository does not carry the heavy `sanity` Studio
dependency before it can be used. The object shape *is* the Sanity schema —
`defineType`/`defineField` are type helpers only.

### Phase 4 wiring steps

1. `npm install sanity @sanity/vision`
2. Wrap the exports in `defineType` / `defineField`.
3. Add `sanity.config.ts` at the root, importing `schemaTypes`.
4. Mount `src/app/studio/[[...tool]]/page.tsx`.
5. Restrict `siteSettings` and `homepage` to singletons in Studio structure.
6. Seed content with Renan.

No field has to be redesigned.

---

## 2. Editing philosophy

**Content freedom, not design freedom.**

| Renan controls | Code controls |
| --- | --- |
| Projects, photos, galleries | Page structure and section order |
| Project summaries | Typography and the type scale |
| Service copy and imagery | Spacing, grids, layout |
| FAQs | Colour system |
| Selected homepage copy and images | Animation and motion |
| Contact details | Responsive behaviour |
| SEO fields | Visual styling |

There is deliberately **no** `sections[]` array, no colour picker, no
spacing control and no layout selector. Section order is fixed in code.

Every field `description` is written for a non-technical editor, because it
is the only instruction Renan sees inside Studio.

---

## 3. `service` (document)

> **A `service` document with a slug the codebase has never seen renders
> a full page at `/services/<slug>`, joins `/services` and the sitemap,
> and disappears from all three when unpublished.** Renan can add service
> pages without a developer. The eight original slugs remain a URL
> contract owned by `src/lib/config/site.ts`; the CMS supplies content for
> a known slug and can also introduce new ones, but it cannot move or
> delete the eight. See ROUTES.md §2.


| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | |
| `slug` | slug | Yes | Read-only on the 8 original services (see the identity note below); warns that changing it affects rankings on a new one |
| `order` | number | | Position in the numbered list |
| `legacyUrl` | string | | Old Wix address — drives redirects |
| `heroTitle` | string | Yes | |
| `intro` | text | | 1–2 sentences under the heading |
| `heroMedia` | image + alt (hotspot) | | Hotspot controls crop safety |
| `overview` | block[] | | Main body copy |
| `commonWorks` | string[] | | Typical jobs |
| `deliveryContent` | block[] | | How the work is delivered |
| `gallery` | galleryImage[] | | |
| `suitableFor` | string[] | | e.g. Property Managers |
| `faq` | {question, answer}[] | | Only genuine questions — emitted as schema |
| `relatedServices` | reference[] | | Max 3 |
| `seo` | seo object | | |

Currently mirrored in code by `services` in `src/lib/config/site.ts`, which
remains the source of truth for **slugs and ordering** even after the CMS
goes live — those are URL contracts, not content.

> **`eyebrow` was removed** (September 2026) — the small "Service 01" /
> "Service 02" label above each service page's heading. The client asked
> for it gone from every service page; the numeral itself (position and
> ordering) is unaffected and still lives in code (`ServicePage.index`,
> `src/lib/config/site.ts`), it just has nowhere it renders as visible
> text on the eight service detail pages any more. Any `eyebrow` value
> still sitting in an old document in the dataset is harmless and unread.

> **IDENTITY: a core service document is matched by `_id`, not by `slug`
> or `name`.** `service-<slug>` (e.g. `service-gutter-cleaning`) is the
> deterministic id `scripts/migrate-to-sanity.ts` created it at, and is
> what `getServices()` in `src/lib/content/provider.ts` matches against —
> never the mutable `slug` FIELD or the `name`. This is a fix, not the
> original design: the client renamed "Gutter Cleaning"'s slug field (via
> Studio's Content Agent, not the read-only slug input — see
> `CMS-AUDIT-2026-09.md` §1) to "gutter-cleaning-repairs" three times, and slug-
> based matching read each occurrence as a brand-new ninth service while
> the real `/services/gutter-cleaning` kept serving stale content.
> Matching by `_id` makes that structurally impossible: the document is
> recognised as the same core service regardless of what its slug or name
> field says, and the page keeps serving at its one contract URL. Proven
> by `npm run verify:cms`'s "Core service identity drift" fixture
> (`scripts/fixtures/core-service-drift.json`), which republishes that
> exact scenario against a stub CMS on every run.
>
> The same treatment applies to the six projects that shipped with the
> site (`project-<slug>`, matched in `mapProject()` via
> `CONTRACT_PROJECT_SLUG_BY_ID`) — their slugs are likewise pinned to the
> id regardless of what the document's own slug field says. A service or
> project the client creates from scratch has no local counterpart, so
> its own `_id`/slug pair is simply itself; nothing about this restricts
> normal new content.

**Images are CMS-authoritative.** All eight services are seeded with their
current photography (`npm run cms:seed-media`, one-off; uploads the exact
`public/images/services/*` files as assets, no hotspot so the crop is
unchanged). Once seeded, `provider.ts › mergeService` takes `heroMedia`
and `gallery` from Sanity ONLY — a photo replaced in Studio replaces it, a
photo removed removes it, and no stale local image is pushed under a
service. Local imagery is reached only on a full CMS outage. TEXT fields
keep their local fallback (a half-written document must not blank a page).

---

## 4. `project` (document)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | **Yes** | |
| `slug` | slug | **Yes** | |
| `service` | reference → service | | Enables filtering |
| `location` | string | No | Optional by design |
| `summary` | text | | |
| `heroImage` | image + alt | **Yes** | Alt text is required |
| `gallery` | galleryImage[] | | |
| `scope` | string[] | No | |
| `featured` | boolean | | Homepage feature flag |
| `completionDate` | date | No | |
| `seo` | seo object | | |

**Why so few required fields.** Only title, slug and the main photograph are
required. Location, completion date and scope are deliberately optional:
Renan may not hold that information for older jobs, and a required field
would push him towards inventing one. The front end renders only the fields
that actually have values — see `CONTENT-RULES.md` §2.

**Seeded, deletable, no local resurrection.** The six current projects are
real documents (`project-<slug>`), created by `npm run cms:seed-projects`
from `src/lib/content/projects.ts` with the
`public/images/projects/<slug>/` derivatives uploaded as image assets. Once
Sanity answers, `getProjects()` treats its project set as authoritative —
local content is an outage/unconfigured fallback only — so deleting a
project in Studio removes it from `/portfolio`, `/projects/<slug>`, the
sitemap **and** the homepage Featured Project / Recent Works, with no local
copy taking its place. The homepage block does not hold `featuredProject` /
`selectedProjects` references by default: with nothing chosen those
sections resolve against the live collection themselves (the `featured`
project, then the first three), so a project stays freely deletable.
Choosing one in Studio is still supported — Sanity will then ask you to
unpick it before that project can be deleted.

---

## 5. No `siteSettings` document

It existed with fields for `logo`, `phone`, `phoneE164`, `email`,
`address`, `companyNumber`, `socialLinks`, `footerText`, `quoteCTA` and a
site-wide `seo` object — but **nothing on the site ever read it**
(`getSiteSettings()` was written and never called). Every field was a
Studio control that changed nothing.

Removed: the document type, its Studio structure entry, its
singleton-protection, the dead `getSiteSettings` / `SITE_SETTINGS_QUERY` /
`SiteSettings` code, and the `"siteSettings"` tag in `/api/revalidate`.
The live document was deleted from the dataset.

Business identity — phone, email, the "Request a Quote" wording, the logo,
coverage — lives in `src/lib/config/site.ts`, which CLAUDE.md §2 makes the
single source of truth. `Footer`, `structured-data.tsx` and `metadata.ts`
read it directly. Company number and registered-office address are not
published anywhere; a developer adds them to `site.ts` when the client
supplies them.

---

## 6. `homepage` (singleton)

| Field | Type | Notes |
| --- | --- | --- |
| `heroVideoUrl` | url | **The one place the hero video changes** |
| `heroPoster` | image + alt (hotspot) | The hero photograph; also the video's poster |
| `heroFallback` | image + alt (hotspot) | Optional — only for a *different* phone/failure image |
| `heroSupportingCopy` | text | → `HeroContent` |
| `introCopy` | text | → `Introduction`. Blank line = new paragraph |
| `introImage` | image + alt (hotspot) | → `Introduction` |
| `featuredProject` | reference → project | → `FeaturedProject`. Photograph + service name only |
| `selectedProjects` | reference[] → project | → `ProjectGrid`. **Max 3** — the grid holds three frames |
| `serviceAreaCopy` | text | → `Coverage` |
| `finalCtaCopy` | text | → `FinalCta`, which appears on **every** page |

**Every field above is wired to a rendered section.** No `seo` object —
the homepage title and description are fixed brand copy in
`src/app/page.tsx`, so an editable SEO block here would change nothing. If
a field is ever added here without a consumer, remove it instead.

`heroPoster` and `introImage` are seeded with the current photography by
`npm run cms:seed-media` (one-off). They keep a code fallback because the
hero and introduction compositions always need an image (CLAUDE.md §8) —
replacing one works; removing it entirely returns the built-in genuine
BOVI photograph, a supported state.

Each falls back to the verified local content when blank, which is why an
empty Homepage document renders exactly as the site ships.

Layout, section order, typography and motion remain in code. So does
which services appear in the Homepage service index — that block is a
curated design of six, not a list.

---

## 7. Shared objects

### `seo`

Collapsible group on every document: `seoTitle` (max 70), `seoDescription`
(max 180), `ogImage`. Descriptions explain in plain English where each
appears.

### `galleryImage`

Image with **required** `alt` and optional `caption`. Alt is required at
the schema level so accessibility cannot be skipped by the editor.

---

## 8. Relationships

```
homepage ──featuredProject──▶ project
homepage ──selectedProjects─▶ project (max 6)
project  ──service──────────▶ service
service  ──relatedServices──▶ service (max 3)
```

---

## 9. Hero video hand-off to Renan

Once Studio is live, the instruction to the client is one sentence:

> **Homepage → Hero background video URL → paste the link → Publish.**

Leaving it blank shows the photograph instead. That is a supported state,
not a broken one.

`resolveHeroMedia({ cms })` gives the CMS value precedence over the
environment variable. No component, style or layout change is needed.
