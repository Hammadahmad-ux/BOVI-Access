# BOVI ACCESS — Content Rules

Non-negotiable rules for what may and may not appear on this website.

The client is a real business selling to Property Managers, Facilities
Managers and Commercial Property Owners. An invented accreditation or a
fabricated project is not a placeholder problem — it is a
misrepresentation the client would be answerable for.

---

## 1. Never fabricate

Under no circumstances invent, infer, estimate or "plausibly fill in":

- Project names or titles
- Client or customer names
- Testimonials, reviews or quotes
- Client logos
- Awards
- Company registration number
- Team size or headcount
- Insurance amounts or policy details
- Accreditations (IRATA, SPRAT, CHAS, SafeContractor, Constructionline…)
- Certifications or training records
- Exact geographic coverage (boroughs, counties, postcodes, radii)
- Project values or contract values
- Founding year or "established" dates
- Statistics of any kind ("500+ buildings", "98% retention")
- Completion dates
- Response times or SLA promises
- Health-and-safety records

This applies to visible copy, alt text, metadata, JSON-LD and CMS seed
data equally. Structured data is not a loophole — `aggregateRating`,
`review` and `award` are banned outright.

---

## 2. If a fact is unknown, omit the element

Do not soften an unknown into a vague claim. Do not use a placeholder.

| Do not write | Do instead |
| --- | --- |
| "Trusted by 200+ property managers" | Omit the stat entirely |
| "Established 2006" | Omit |
| "Fully accredited" | Only the three claims in §4 |
| "Covering all London boroughs" | "London & the South East" |
| "Project: [TBC]" | Omit the project |

`/portfolio` ships with **no project entries** for exactly this reason: no
project name, client, location, value or date has been verified. The page
still carries real metadata and a working conversion path, so it is honest
rather than empty-feeling. Projects appear when Renan adds them via Sanity.

---

## 3. Never ship a visible placeholder

Banned strings in production output:

`Lorem ipsum` · `Business Name` · `Your service here` · `Project title` ·
`Coming soon` · `[TBC]` · `TODO` · `Placeholder` · `Example` ·
`Sample text` · fake statistics · fake reviews

Development placeholders may exist internally **only** if they are
obviously detectable and removed before the phase ends. Prefer omitting a
section over stubbing it with fake text.

---

## 4. Claims pending verification

These three appear in the client's prior material. They are **rendered**,
because they are his own existing copy — but they have **not** been
re-confirmed in writing for this build.

| Claim | Status |
| --- | --- |
| IRATA Level 3 | Pending written confirmation |
| Fully Insured | Pending written confirmation |
| 18+ Years at Height | Pending written confirmation |
| RAMS-led delivery | Pending written confirmation |

Tracked in code as `trustClaims` in `src/lib/config/site.ts` with
`verified: false`.

**Rules:**

- Do not add a fourth claim.
- Do not strengthen the wording. "IRATA Level 3" must not become "IRATA
  Level 3 certified team" or "fully IRATA accredited".
- Do not attach a specific insurance figure to "Fully Insured".
- Do not convert "18+ Years at Height" into a founding year.

**Pre-launch action:** get all four confirmed in writing by Renan, then set
`verified: true`. If any cannot be confirmed, remove it.

---

## 5. Geographic coverage

The only approved statement is:

> **London & the South East**

Do not list boroughs, towns, counties or postcodes, and do not build
location landing pages for unconfirmed areas. Note that a significant part
of the photographic library is from **Liverpool**, which is outside the
stated coverage — this is a question for Renan, not a licence to widen the
claim.

---

## 6. Imagery

- Use genuine BOVI photography only.
- Never use competitor imagery (TradeTech or otherwise), scraped images,
  unrelated stock, AI-generated "project" photos, or fake client logos.
- Never present a photograph as a project it is not.
- Alt text describes what is actually visible. Do not assert a location,
  client or building name in alt text unless verified.
- If a service has no genuine image, use a tasteful neutral layout or a
  genuine broader BOVI image — never a substitute from elsewhere.

Provenance for every production image is recorded in
`client-assets/ASSET-INVENTORY.md`.

---

## 7. Service copy

The eight services are confirmed. Descriptions must stay at the level of
*what the work is*, not *how well BOVI does it*, until the client supplies
approved copy.

Acceptable: "Brickwork and repointing delivered by rope access, without
scaffolding or powered access, on occupied commercial buildings."

Not acceptable: "Our expert IRATA-certified team has repointed over 300
buildings across London."

---

## 8. FAQs

Only publish questions the client is genuinely asked, with answers he has
approved. FAQ content is emitted as `FAQPage` structured data, so an
invented FAQ becomes an invented Google result.

`FAQPage` schema is only emitted when genuine, visible FAQs exist on the
page.

---

## 9. Legal pages

`/privacy` describes only what the site actually does: what the enquiry
form collects, why, how it is transmitted, and the user's rights.

It deliberately contains **no** company registration number, registered
office address or ICO registration number, because none has been supplied.

**Pre-launch action:** obtain company details and a legal review before
launch.

---

## 10. Tracking unknowns

Unknown information is tracked **privately** — in this file, in
`QA-CHECKLIST.md` §Pre-launch, and as `verified: false` flags in
`src/lib/config/site.ts`.

It is never tracked as visible on-page text.

### Open questions for Renan

1. Confirm in writing: IRATA Level 3, Fully Insured, 18+ Years at Height,
   RAMS-led delivery.
2. Company registration number and registered office (for footer + privacy).
3. Approve the coverage statement, and clarify the Liverpool work.
4. Supply verified project details for at least 3–6 projects: title,
   service, location (optional), summary, scope.
5. Supply or approve the hero background video.
6. Confirm whether "Gutter Cleaning", "Mastic & Sealant", "Roof & Roofline
   Repairs" and "Lightning Protection" had pages on the Wix site, and their
   URLs (see `ROUTES.md`).
7. Confirm the full list of eight services is correct and complete.
