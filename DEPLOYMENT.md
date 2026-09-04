# BOVI ACCESS — Deployment & Operations

Current state, not aspiration. Where something is not configured, this
document says so.

---

## 1. Status

| Capability | State | What is missing |
| --- | --- | --- |
| Website | **Built and buildable** | — |
| Content editor (Sanity) | **Code complete, not connected** | Client must create the Sanity project |
| Enquiry email (Resend) | **Code complete, not connected** | API key + verified sending domain |
| File attachments | **Working end to end in code** | Delivery depends on Resend above |
| Publish → live refresh | **Code complete, not connected** | Webhook secret + Sanity webhook |
| Custom domain | **Not pointed** | Deliberate — see §7 |
| Analytics | **Not installed** | No IDs supplied; no cookie banner needed yet |

**The site runs correctly with none of the above configured.** It serves
its verified built-in content, and the enquiry form tells the visitor to
call or email rather than pretending to send. Nothing is faked.

---

## 2. Content mode

There are two modes, and one switch:

```
NEXT_PUBLIC_SANITY_PROJECT_ID set    → CMS mode: content comes from Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID unset  → local mode: built-in verified content
```

`src/lib/content/provider.ts` is the only file that knows which. Every
page calls the same functions and gets the same types either way.

**Local mode is not a placeholder.** It is the content the site ships
with, written against `CONTENT-RULES.md`. But do not tell the client the
website is editable while it is running in local mode — check `/studio`,
which states plainly which mode is active.

CMS content is merged *over* the local baseline field by field, so a
half-filled Sanity document cannot blank a page.

---

## 3. Environment variables

Full annotated list in `.env.example`. Set these in Vercel → Project →
Settings → Environment Variables.

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Recommended | Canonicals, OG, sitemap. **Set per environment** so previews do not emit production canonicals. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public | For CMS | Switches on CMS mode |
| `NEXT_PUBLIC_SANITY_DATASET` | Public | For CMS | `production` |
| `SANITY_API_READ_TOKEN` | **Server** | Optional | Draft/preview reads |
| `SANITY_REVALIDATE_SECRET` | **Server** | For instant publish | Verifies the webhook |
| `SANITY_WRITE_TOKEN` | **Server** | One-off | Migration only — delete after use |
| `RESEND_API_KEY` | **Server** | For email | Enquiry delivery |
| `CONTACT_TO_EMAIL` | **Server** | For email | Where enquiries go |
| `CONTACT_FROM_EMAIL` | **Server** | For email | Must be on a **verified** domain |
| `NEXT_PUBLIC_BOVI_HERO_VIDEO_URL` | Public | Optional | Hero video before the CMS is live |

Nothing secret is behind a `NEXT_PUBLIC_` prefix. The three Resend values
are read server-side only, inside the route handler.

---

## 4. Connecting Sanity

1. Client creates the account and project — see `CMS-HANDOVER.md` §1.
   **The client's account must own the project**; the developer is added
   as a collaborator, not the reverse.
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.
3. Add the deployment URL to Sanity → API → **CORS origins** (with
   credentials) so `/studio` can talk to the dataset.
4. Seed the eight services:
   ```bash
   SANITY_WRITE_TOKEN=<editor token> npm run cms:migrate
   ```
   Idempotent — safe to re-run, never duplicates, never overwrites an
   edit made in Studio. It does **not** create projects (none verified)
   and does **not** upload images (do those in Studio, where the hotspot
   tool sets the crop).
5. Delete the write token.
6. Redeploy and confirm `/studio` loads the editor rather than the setup
   notice.

### Revalidation — so publishing updates the site

Pages revalidate hourly by default. To make Publish take effect in
seconds:

1. Generate a long random string; set it as `SANITY_REVALIDATE_SECRET`.
2. Sanity → API → **Webhooks** → Create:
   - URL: `https://<your-domain>/api/revalidate`
   - Trigger on: create, update, delete
   - Filter: `_type in ["service","project","homepage","siteSettings"]`
   - HTTP method: `POST`
   - Secret: the same string

Without the secret the endpoint refuses every request — an
unauthenticated cache-purge endpoint is a free denial-of-service lever, so
it fails closed on purpose.

---

## 5. Connecting enquiry email

1. Create a Resend account for BOVI.
2. **Verify the `boviaccess.co.uk` domain** (DNS records in Resend). Until
   this is done, mail sent as `@boviaccess.co.uk` will be rejected — the
   sending address cannot simply be typed in.
3. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL=info@boviaccess.co.uk`, and
   `CONTACT_FROM_EMAIL` to an address on the verified domain.
4. Redeploy and send a real test enquiry, with and without an attachment.

Until all three are set, `/api/quote` returns **503** with an honest
message and the form points the visitor at the phone number. It never
reports a success it did not achieve.

### Attachments

Files are posted as multipart form data, validated on the server (type,
per-file size, total size), and forwarded straight to the email as
attachments. **Nothing is stored.** There is no bucket, no database and no
retention policy to manage — the enquiry lives in BOVI's inbox and
nowhere else. That was chosen over object storage because it is less
infrastructure and less personal data at rest.

Limits: 5 files, 8MB each, 15MB total (Resend caps a request at 40MB).
Accepted: JPG, PNG, WebP, HEIC/HEIF, PDF.

### Abuse protection

Honeypot field, server-side Zod validation, and an in-memory rate limit of
5 submissions per IP per 10 minutes.

**The rate limit is per serverless instance, not distributed.** On Vercel
each instance has its own memory, so a spread-out attacker gets more than
the stated allowance. It stops the common case at zero cost. If enquiry
spam becomes real, swap the Map in `src/lib/forms/rate-limit.ts` for
Upstash Redis or Vercel KV — the function signature does not change.

---

## 6. Ownership

Target state before launch:

| Asset | Should be owned by |
| --- | --- |
| Domain `boviaccess.co.uk` | **Renan** (already is) |
| Sanity project | **Renan's account**, developer as collaborator |
| Vercel project | Renan's account, or a shared team |
| GitHub repository | Renan, or transferable to him |
| Resend account | BOVI business account |

The point: Renan can change developer without losing his website, his
content or his enquiries.

---

## 7. Going live — do NOT do this yet

Do not point the domain, change DNS, or take down the Wix site until all
of these are true:

- [ ] Renan has confirmed the trust claims in writing (`CONTENT-RULES.md` §4)
- [ ] Legacy URL export obtained and redirects completed (`ROUTES.md` §3)
- [ ] Sanity project connected and owned by the client
- [ ] Resend domain verified and a real test enquiry received
- [ ] Privacy policy legally reviewed, company details supplied
- [ ] Full Phase 5 QA pass
- [ ] Renan has approved the site

Cutover sequence is in `ROUTES.md` §7. Keep Wix live until DNS has fully
propagated, then watch Search Console for 404 spikes — each one is a
legacy URL the audit missed.

---

## 8. Analytics

Not installed. No GA4 or Clarity IDs have been supplied, and none have
been invented.

Because nothing sets a non-essential cookie today, **no cookie banner is
required**. Adding GA4 or Clarity changes that: both need a consent
mechanism before they load, and the privacy policy needs updating.

Conversion events worth wiring when it happens: `request_quote_click`,
`phone_click`, `email_click`, `quote_submit`. **Never** pass enquiry
field contents, names, emails or phone numbers into analytics.

---

## 9. Commands

```bash
npm run dev            # local development
npm run check          # lint + typecheck + production build
npm run test:e2e       # Playwright, seven viewports (build first)
npm run cms:migrate    # one-off Sanity seed
npm run assets:brand   # regenerate logos and favicons
npm run assets:images  # regenerate web image derivatives
```
