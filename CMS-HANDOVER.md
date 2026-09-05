# BOVI Access — Editing Your Website

This is for Renan. It explains how to change the content on your website
yourself, without a developer.

Nothing in this document contains a password. Your login is your own.

---

## The editor is connected

Your content editor is live. The eight services are already in it and the
website is reading from it — you can start editing straight away.

### One thing still to sort: ownership

The Sanity project was set up under the developer's account. **Ask them to
add your BOVI email address as an Administrator and transfer ownership to
you.** Until that is done, the account holding your website content is not
yours. It takes about five minutes.

<details>
<summary>How the project was originally created (for reference)</summary>

1. Go to **https://sanity.io** and create a free account. **Use the BOVI
   Access email address**, not a personal one — this account owns your
   content, so it should belong to the business.
2. Create a project called **BOVI Access**. When it asks for a dataset
   name, use **production**.
3. On the project dashboard, copy the **Project ID** (a short code like
   `a1b2c3d4`).
4. Send that Project ID to your developer. It is not a secret.
5. They add it to the website's settings and redeploy. That is the whole
   job — everything else is already built.

</details>

---

## Where to log in

```
https://www.boviaccess.co.uk/studio
```

Log in with the Sanity account you created. Bookmark it.

---

## What you can change yourself

| You control | You do not control |
| --- | --- |
| Projects and project photographs | Page layout and section order |
| Service text and service images | Fonts, colours and spacing |
| Homepage hero video and images | Animations |
| Selected homepage text | How the site looks on mobile |
| FAQs on service pages | The design |
| Phone, email, address | |
| Google/search wording (SEO) | |

That split is deliberate. You can change anything a visitor reads or
looks at. You cannot accidentally break how the site is put together.

---

## The four things in the editor

When you log in you will see four items in the left-hand menu.

### Homepage

One page. Everything on it is optional — **leave a field blank and the
website keeps showing what is there now.** It never goes blank.

- **Hero background video URL** — paste a web address for a video and it
  plays behind the big "ACCESS WITHOUT LIMITS" heading. Leave it empty and
  the photograph shows instead. Both look right; the photograph is not a
  fallback you need to feel bad about.
- **Hero poster / fallback image** — the photograph shown while the video
  loads, on phones, and if the video cannot play.
- **Introduction text and image**
- **Featured project** — pick one of your projects to feature.
- **Projects shown on the homepage** — pick up to six.
- **Service area text** and **closing call-to-action text**

### Projects

This is the one you will use most.

**To add a project:**

1. Click **Projects**, then the pencil/plus icon to create a new one.
2. Fill in the **Project title** and the **URL slug** (the slug fills in
   automatically from the title — leave it alone unless you have a reason).
3. Add the **Main photograph**. **Alt text is required** — write one short
   sentence describing what is in the photo. It is what a blind visitor
   hears and what Google reads.
4. Choose the **Service** it relates to.
5. Everything else is optional: **Location**, **Summary**, **Scope of
   works**, **Completed** date. **Leave anything blank that you are not
   sure about.** The website simply will not show that line. Never guess.
6. Tick **Feature on the homepage** if you want it near the top.
7. Click **Publish**.

Right now the website shows your photographs grouped by service, because
no project has a confirmed name yet. As soon as you publish real projects
here, they take over.

### Services

There are eight, already written and live. You can edit any of them.

- **Page heading**, **Introduction**, **Overview**, **Common works**,
  **How we deliver it**, **Suitable for** — all editable.
- **Main image** — click it, upload a new photograph, and **use the
  hotspot tool** (the little circle) to mark the part that must stay
  visible when the image is cropped on a phone.
- **Photo gallery** — the extra photographs further down the service
  page. The first one is the large image beside "How the work gets
  done"; the next two sit side by side under the introduction. **Add
  three and you get all of them; add one and you get just the large
  one.** The page is built to look right either way, so only add photos
  that genuinely show that service — a page with two honest photographs
  beats a page with four borrowed ones.
- **FAQs** — only add questions you are genuinely asked. These get sent
  to Google as structured data, so an invented answer becomes an invented
  Google result.
- **Related services** — up to three, shown at the bottom of the page.

> **Do not change the URL slug on a service.** Those web addresses are
> linked from Google and from the old website. Changing one loses the
> ranking and breaks incoming links. If a service genuinely needs renaming,
> tell your developer so the old address can be redirected.

### Site settings

Your phone number, email address, and social links.

Two fields for the phone on purpose:

- **Phone number** — how it is displayed, e.g. `07990 377780`
- **Phone number (dialling format)** — what happens when someone taps it
  on a phone, e.g. `+447990377780`, no spaces

Keep both in step. **Company registration number** and **Address** are
blank because they have not been supplied — fill them in and they appear
in the footer and privacy policy automatically.

---

## How to replace a photograph

1. Open the item (a service, a project, or the Homepage).
2. Click the existing image.
3. Choose **Upload** and pick the new file.
4. Write the **alt text** — one sentence describing what is in it.
5. Click the **hotspot** circle and drag it over the important part —
   usually the person or the building. This is what stops heads being
   cropped off on a phone.
6. **Publish**.

Photographs straight from a phone are fine. The website resizes and
compresses them automatically.

---

## Publishing

Nothing you type is live until you press **Publish**.

- **Publish** — goes live on the website, usually within a minute.
- Your unpublished edits are saved as drafts. You can close the browser
  and come back to them.
- To undo, open the document's **⋯** menu and look at the revision
  history.

If a change does not appear after a couple of minutes, hard-refresh the
page (**Ctrl+Shift+R**, or **Cmd+Shift+R** on a Mac).

---

## Two rules worth keeping

**1. Never write something you cannot back up.**
No invented project names, client names, dates, certifications, insurance
figures or statistics. If a property manager asks "where does that number
come from?", there has to be an answer. Leaving a field blank is always
better than filling it with a guess — the website is built to look right
with blanks.

**2. Alt text is not optional.**
Every photograph needs one sentence describing what is in it. Describe the
photograph, not what you wish it showed.

---

## If something goes wrong

- **A page looks empty** — you probably deleted text rather than leaving
  it as it was. Use the revision history to put it back.
- **You cannot log in** — use the password reset on the Sanity login page.
- **You have accidentally deleted a project** — Sanity keeps history.
  Contact your developer before creating anything new.

---

## Related documents

- `DEPLOYMENT.md` — hosting, environment settings, going live
- `CMS-SCHEMA.md` — the technical field reference
- `CONTENT-RULES.md` — what may and may not be claimed on the site
