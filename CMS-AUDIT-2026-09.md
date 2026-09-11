# BOVI Access — CMS reliability audit (September 2026)

Internal, technical. For the client-facing workflow, see `CMS-HANDOVER.md`.
For the field-by-field schema reference, see `CMS-SCHEMA.md`.

This records a full Sanity CMS → frontend → webhook → production audit
carried out after a service document was duplicated in production for the
third time. It exists so the next person touching this codebase (including
a future instance of an AI assistant) does not have to re-derive the
identity architecture from scratch, and can tell at a glance which parts of
the CMS have already been load-bearing-tested and which have not.

---

## 1. The incident this audit closed out

`service-gutter-cleaning`'s **slug field** (not just its display name) was
changed in Studio — apparently via the Studio's built-in **Content Agent**
AI assistant, not by hand-typing into the slug input, since that input has
been `readOnly` since the previous pass — from `gutter-cleaning` to
`gutter-cleaning-repairs`, three separate times over two days.

Before this pass, `getServices()` in `src/lib/content/provider.ts` matched
a CMS document to its local, code-owned counterpart **by slug**:

```ts
docs.find((doc) => doc.slug === local.slug)
```

Every time the slug drifted, the real document stopped matching
`gutter-cleaning` (so `/services/gutter-cleaning` fell back to stale local
content) and started matching nothing in the local list, so it was treated
as a **new ninth service** — appearing a second time in the dropdown,
`/services`, the sitemap and Related Services, at the URL
`/services/gutter-cleaning-repairs`.

`readOnly` on the slug field is a **Studio UI affordance only**. It stops
a person typing into that input. It does not stop:

- the Studio's Content Agent (an AI feature that mutates documents through
  the same API a human editor's save does — a field being `readOnly` in
  the form does not appear to constrain it),
- a direct API/CLI patch,
- a browser tab that loaded the Studio bundle before a protection shipped.

**Conclusion: field-level `readOnly` reduces accidental drift but cannot be
the mechanism that guarantees a duplicate never happens again.** The fix
had to be in the code that decides what a "service" is.

## 2. The fix — identity by document id, not by slug or name

`src/lib/content/provider.ts` now matches every one of the eight original
services, and the six projects that shipped with the site, by their
**stable Sanity document id** — never by the mutable `slug` field, never
by `name`/`title`:

```ts
const CORE_SERVICE_ID = (slug: string) => `service-${slug}`;
// ...
const merged = localServices.map((local) =>
  mergeService(
    local,
    docs.find((doc) => doc._id === CORE_SERVICE_ID(local.slug)),
    slugById,
  ),
);
```

`CORE_SERVICE_ID`/`CONTRACT_PROJECT_SLUG_BY_ID` are keyed off the
deterministic ids `scripts/migrate-to-sanity.ts` and
`scripts/seed-projects.ts` created the original documents at
(`service-<slug>`, `project-<slug>`). Those ids are not exposed anywhere in
Studio and cannot be edited through it.

The consequence: **a core document's slug field can say anything at all —
it no longer changes which local service the CMS content merges onto, and
it is never treated as a signal that a new document exists.** The frontend
always serves the eight at their eight contract addresses, with whatever
content (including the display name) the document currently holds.
`mapProject()` applies the identical rule for the six shipped projects via
`CONTRACT_PROJECT_SLUG_BY_ID`.

`relatedServices` references were the second-order casualty of slug-based
identity: a service referencing "Gutter Cleaning" by its slug would point
at whatever the slug field said *at query time*, which could be the
drifted value. The GROQ projection now dereferences by `_id`
(`relatedServices[]->_id`) and `provider.ts` resolves those ids through
the same core-aware map (`slugById`), so a related-service link is
correct regardless of what the referenced document's own slug field says.

**This is verified on every `npm run verify:cms` run**, not just asserted:
`scripts/fixtures/core-service-drift.json` reproduces the exact incident
(the real `service-gutter-cleaning` id, a drifted slug) against a stub
CMS, and the script asserts the count stays at eight, the contract URL
keeps serving the CMS content, the drifted slug 404s, and the sitemap is
byte-for-byte what a clean dataset produces. See
`scripts/verify-cms-service.mjs` → "Core service identity drift".

New services and projects the client creates are unaffected: they have no
local counterpart, so their own `_id`/slug pair is simply themselves.

## 3. What this does *not* do, and the remaining decision

The identity fix makes duplication **structurally impossible** for the 14
core documents, however their slug field is mutated. It does **not** stop
the slug field itself from silently drifting away from the value shown in
Studio's UI — so a document can still end up displaying a slug that
doesn't match its real URL, which is confusing even though it is now
harmless. Two live incidents of this shape were found during this audit
and corrected (both restored via the Sanity CLI, values below); the
underlying drift mechanism (most likely the Content Agent) has not been
independently disabled, because:

- there is no per-field way to exclude a document from Content Agent
  mutation from within `sanity.config.ts` as of `sanity@5.31.2`;
- disabling the feature entirely is an organisation/project-level setting
  on sanity.io/manage, not a code change, and doing that blind (without
  the client present to confirm they don't use it deliberately) was
  judged riskier than leaving it — especially now that a drift cannot
  actually break anything client-facing.

**If a future drift is still undesirable purely as a UI/data-hygiene
matter** (Renan seeing a slug in Studio that doesn't match the real URL),
the remaining options, roughly in order of effort:

1. Ask the client whether they use Content Agent deliberately; if not,
   turn it off for the project at sanity.io/manage.
2. A small Sanity Function/webhook that reverts a contract document's
   slug field if it drifts from an allow-list — real effort, and needs
   care to avoid a revert-loop (guard on `_rev`, or only fire on the
   `slug` path, not on every field change).
3. Do nothing further — the identity fix means "nothing further" is a
   legitimate, safe choice, not a gap.

Slugs restored during this audit (via the Sanity CLI, `sanity.io`
revision history intact for both):

| Document | Drifted to | Restored to |
| --- | --- | --- |
| `service-gutter-cleaning` | `gutter-cleaning-repairs` | `gutter-cleaning` |
| `project-brickwork-repointing-works` | `brickwork-repointing` | `brickwork-repointing-works` |

## 4. Data integrity scan (production dataset, 4x76hdgl/production)

Read-only queries via the authenticated Sanity CLI. No data was mutated by
the scan itself.

| Check | Result |
| --- | --- |
| `homepage` documents | 1 |
| `service` documents | 8 (all 8 contract slugs, no duplicates) |
| `project` documents | 6 (all 6 contract slugs, no duplicates) |
| `sanity.imageAsset` documents | 61 |
| Drafts (`drafts.*`) | 0 |
| Services with a malformed `heroMedia` (missing asset ref or alt) | 0 |
| Services with a malformed gallery item (`_key`/asset/alt) | 0 |
| Projects with a malformed `heroImage` or gallery item | 0 |
| Homepage `heroPoster`/`introImage` asset refs | present and resolve |
| Homepage `featuredProject`/`selectedProjects` | unset (site uses the
  built-in fallback: first `featured: true` project, first three by
  order) — not a defect |
| Duplicate service/project `_id`s | 0 |
| Broken image asset references (project/service galleries) | none found
  (asset ref counts match published gallery counts exactly; confirmed by
  the full Playwright suite's "no image fails to load" checks) |

## 5. Studio boot / auth / structure

Verified against the deployed production Studio
(`https://www.boviaccess.co.uk/studio`), authenticated as the same
Administrator account Renan uses:

- Loads on the production custom domain, no white-screen, no
  `getAttribute only applies to plain objects`, no console errors.
- Structure → Homepage / Projects / Services all open; Services lists
  exactly 8 (post-fix), each with its correct photo, name and address.
- The Studio's own "Content Agent is generally available" banner is
  visible — confirms the feature is live on this project (see §3).

WebKit is a Playwright *proxy* for Safari, not Safari itself — see §7.
Studio itself is not exercised through Playwright at all (it requires an
authenticated Sanity session Playwright's stub environment cannot supply);
Studio verification is manual, against the real deployed Studio, as above.

## 6. The gallery lightbox — a genuine WebKit bug, found and fixed

Unrelated to the identity work, surfaced by adding a WebKit test project
(see §7): the multi-image gallery lightbox (`src/components/ui/Gallery.tsx`)
failed to return focus to the thumbnail that opened it, specifically on
WebKit, specifically after a **native** close (Escape, or any path that
reaches `dialog.close()` without an explicit synchronous re-focus).

Root cause, confirmed by direct instrumentation: on `dialog.close()`,
Chromium restores focus to the element that was focused before
`showModal()`, per spec. **WebKit does not** — it moves focus to the
nearest ancestor (observed: `<main>`), and a `.focus()` call issued any
time after that same synchronous turn — from a `close` event handler, a
React effect, `requestAnimationFrame`, even `setTimeout(0)` — does not
stick; only a `.focus()` issued in the exact same synchronous call as
`.close()` does.

The fix has two parts:

1. The element to refocus is captured **synchronously in the click
   handler that opens the gallery** (`event.currentTarget`, passed through
   `openAt(index, opener)`), not read back later via
   `document.activeElement` inside a `useEffect`. That effect was found to
   run, on WebKit, after focus had already drifted to `<main>` for reasons
   unrelated to the gallery — so it was capturing the wrong element to
   begin with, independent of the close-side bug.
2. Every control that ends the lightbox — the X, the backdrop, and Escape
   (intercepted via the cancelable `cancel` event so it goes through the
   same path) — calls one `closeDialog()` function that calls `.close()`
   and `.focus()` back-to-back, synchronously, in that order.

Regression coverage: `e2e/gallery-lightbox.spec.ts`, plus the existing
`services.spec.ts` / `projects.spec.ts` lightbox tests, all run against
both `desktop-1440` (Chromium) and `webkit-1440` (WebKit).

## 7. Browser QA matrix

| Engine | Coverage |
| --- | --- |
| Chromium | Full suite, all 7 viewport projects (375–1440px) |
| WebKit (Safari proxy) | One desktop viewport (1440×900 — Renan's actual setup), scoped to `gallery-lightbox`, `image-hotspot`, `services`, `projects`, `homepage` and `cms` specs — the areas most likely to diverge by rendering engine (native `<dialog>`, touch handling, focus, image pipeline). Broad per-route layout sweeps (`foundation.spec.ts`) stay Chromium-only; that is arithmetic on computed layout, not an area WebKit is expected to diverge on. |
| Firefox | Not run. Not a target browser for this client (Renan uses Safari/macOS; there is no indication any visitor segment is Firefox-heavy), and the existing suite has no Firefox project configured. Can be added the same way `webkit-1440` was if ever wanted. |
| Real Safari on macOS | **Not tested — cannot be from this environment.** WebKit is Apple's engine and the closest automatable stand-in Playwright offers, but Safari itself carries additional OS-level chrome, extensions and settings Playwright's WebKit does not reproduce. Treat the WebKit pass as strong evidence, not a guarantee, for real Safari; the one genuine cross-engine bug found this session (§6) was caught specifically because a second engine was run at all. |

## 8. Webhook

- Exactly one webhook exists: **"BOVI Website Revalidation"**,
  `POST https://bovi-access.vercel.app/api/revalidate`, dataset
  `production`. No duplicates.
- `SANITY_REVALIDATE_SECRET` is set on Vercel — confirmed by
  `POST /api/revalidate` with no signature returning `401 Invalid
  signature`, not `501 not configured`.
- Recent delivery log entries (including several generated live during
  this audit's own CLI patches) all show `Status: success, Result code:
  200`.
- `revalidateTag` covers the tagged page data; `revalidatePath("/sitemap.xml")`
  (added in a previous pass) additionally covers the sitemap route, which
  does not reliably pick up a tag-only revalidation on its own.

## 9. Safe-testing method used throughout

Two mechanisms, matching what the codebase already used successfully:

- **`npm run verify:cms`** — builds the site against a fixture/stub CMS
  (`scripts/sanity-stub-server.cjs`), never touching the real dataset.
  Proves new-service/new-project lifecycle, deletion, and (as of this
  audit) the identity-drift scenario, entirely without live data.
- **Live CLI drift-and-restore** — for the two real incidents (§3), the
  exact slug value was captured before mutating, the drift was applied,
  the effect verified against a local build reading the live dataset, and
  the original value restored and re-verified. No test document was
  created or left behind in the production dataset; no display content
  (titles, copy, images) was touched.
