# BOVI ACCESS — CMS Schema (Sanity)

Schema design in `sanity/schemaTypes/index.ts`.

---

## 1. Status and the authentication blocker

**No Sanity project exists for BOVI yet.** This is a genuine blocker and
cannot be resolved from this repository.

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

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | |
| `slug` | slug | Yes | Warns that changing it affects rankings |
| `order` | number | | Position in the numbered list |
| `legacyUrl` | string | | Old Wix address — drives redirects |
| `eyebrow` | string | | |
| `heroTitle` | string | Yes | |
| `intro` | text | | 1–2 sentences under the heading |
| `heroMedia` | image (hotspot) | | Hotspot controls crop safety |
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

---

## 5. `siteSettings` (singleton)

| Field | Type | Notes |
| --- | --- | --- |
| `logo` | image | |
| `phone` | string | Display format, e.g. `07990 377780` |
| `phoneE164` | string | Dialling format, e.g. `+447990377780` |
| `email` | string | |
| `address` | text | |
| `companyNumber` | string | Optional — shown only if filled in |
| `socialLinks` | {platform, url}[] | |
| `footerText` | string | |
| `quoteCTA` | string | Quote button label |
| `seo` | seo object | Site-wide defaults |

Phone is split into **display** and **dialling** fields so the `tel:` link
can never break when the display format is edited.

**Do not pre-populate unknown factual fields.** `companyNumber` and
`address` stay empty until supplied.

---

## 6. `homepage` (singleton)

| Field | Type | Notes |
| --- | --- | --- |
| `heroVideoUrl` | url | **The one place the hero video changes** |
| `heroPoster` | image (hotspot) | Shown while video loads |
| `heroFallback` | image (hotspot) | Phones + video failure |
| `heroSupportingCopy` | text | |
| `introCopy` | text | |
| `introImage` | image (hotspot) | |
| `featuredProject` | reference → project | |
| `selectedProjects` | reference[] → project | Max 6 |
| `serviceAreaCopy` | text | |
| `finalCtaCopy` | text | |
| `seo` | seo object | |

Layout, section order, typography and motion remain in code.

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
