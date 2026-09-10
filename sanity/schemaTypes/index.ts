/**
 * BOVI ACCESS — Sanity schema.
 *
 * ---------------------------------------------------------------------
 * STATUS: mounted at /studio (Phase 4).
 *
 * These are plain schema objects rather than `defineType(...)` calls.
 * `defineType`/`defineField` are type helpers only — the object shape IS
 * the Sanity schema, and it is registered as-is in sanity.config.ts.
 *
 * The Studio only becomes reachable once NEXT_PUBLIC_SANITY_PROJECT_ID is
 * set; until then /studio renders setup instructions instead. See
 * CMS-HANDOVER.md.
 * ---------------------------------------------------------------------
 *
 * EDITING PHILOSOPHY
 * Renan gets CONTENT freedom, not DESIGN freedom. Every field below is
 * content: words, photographs, ordering, SEO. There is no field that sets
 * a colour, a spacing value, a font size, a layout or a section order.
 * Those live in code and stay there.
 *
 * Field descriptions are written for a non-technical editor, because they
 * are the only instructions Renan will see inside Studio.
 */

import type { Rule } from "sanity";

import { services } from "@/lib/config/site";

const required = (rule: Rule) => rule.required();
const maxLength = (n: number) => (rule: Rule) => rule.max(n);

/* ------------------------------------------------------------------ */
/* URL-contract slug protection                                        */
/*                                                                    */
/* Service slugs, and the slugs of the projects that shipped with the  */
/* site, are a URL contract: they are in Google's index and drive the  */
/* legacy Wix redirect map (CLAUDE.md §7, ROUTES.md). A content edit    */
/* must not be able to change a public address. The `slug` field on     */
/* those documents is therefore read-only in Studio — the value can     */
/* still be corrected by a developer through a migration, which is the  */
/* only place a URL change should ever originate.                       */
/*                                                                     */
/* A service or project the client CREATES keeps a fully editable slug  */
/* until it is first published; `documentId` is only in these sets once */
/* the document exists, so a brand-new draft is unaffected.             */
/* ------------------------------------------------------------------ */

const CORE_SERVICE_IDS = new Set(
  services.map((service) => `service-${service.slug}`),
);

/**
 * The six projects seeded from `src/lib/content/projects.ts`. Listed
 * explicitly rather than imported so the Studio bundle does not pull in
 * the whole content module; keep in step with that file.
 */
const CONTRACT_PROJECT_IDS = new Set([
  "project-external-pipe-repair",
  "project-gutter-downpipe-clearance",
  "project-brickwork-repointing-works",
  "project-lightning-protection-works",
  "project-mastic-sealant-renewal",
  "project-commercial-glazing-clean",
]);

const publishedId = (id: string | undefined) =>
  (id ?? "").replace(/^drafts\./, "");

/** `readOnly` guard for a document type's slug field. */
const slugIsContractLocked =
  (ids: ReadonlySet<string>) =>
  ({ document }: { document?: { _id?: string } }) =>
    ids.has(publishedId(document?._id));

/* ------------------------------------------------------------------ */
/* Reusable object types                                               */
/* ------------------------------------------------------------------ */

export const seoFields = {
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    {
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      description:
        "Shown in Google results and the browser tab. Aim for 50-60 characters. Leave blank to use the page title.",
      validation: maxLength(70),
    },
    {
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      description:
        "The grey summary text under the Google result. Aim for 140-160 characters.",
      validation: maxLength(180),
    },
    {
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description:
        "Used when the page is shared on LinkedIn, WhatsApp or Facebook. Landscape works best.",
      options: { hotspot: true },
    },
  ],
};

export const galleryImage = {
  name: "galleryImage",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    {
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "Describe what is in the photograph, for screen readers and Google. Required.",
      validation: required,
    },
    { name: "caption", title: "Caption", type: "string" },
  ],
};

/**
 * Alt text for a standalone `image` field. Every photograph on the site
 * needs one — the front end drops an image with no alt rather than ship it
 * unlabelled (src/lib/sanity/image.ts), so without this a replacement made
 * in Studio would not appear.
 */
const imageAlt = {
  name: "alt",
  title: "Alt text",
  type: "string",
  description:
    "One sentence describing what is in the photograph, for screen readers and Google. Required — an image with no alt text will not appear on the site.",
  validation: required,
};

/* ------------------------------------------------------------------ */
/* service                                                             */
/* ------------------------------------------------------------------ */

export const service = {
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Service name",
      type: "string",
      description:
        "How this service is listed across the site - the Services page, the footer, and related-service links. Keep it short.",
      validation: required,
    },
    {
      name: "slug",
      title: "Web address",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
        /*
          Lowercase, hyphenated, nothing else. Left to Sanity's default a
          name like "Bird Netting & Proofing" becomes a slug with an
          ampersand in it, which makes a fragile URL.
        */
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      description:
        "The end of the page address: /services/THIS-BIT. It fills in automatically from the service name when you create a new service. The eight original services show this as read-only on purpose: their addresses are in Google's index and are the target of redirects from the old site, so a rename has to go through your developer.",
      // The eight original services are a URL contract — see the note by
      // CORE_SERVICE_IDS above.
      readOnly: slugIsContractLocked(CORE_SERVICE_IDS),
      validation: (rule: Rule) =>
        rule.required().custom((value: { current?: string } | undefined) => {
          const current = value?.current;
          if (!current) return "A web address is required.";
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)) {
            return "Use lowercase letters, numbers and hyphens only - for example bird-netting.";
          }
          return true;
        }),
    },
    {
      name: "order",
      title: "Display order",
      type: "number",
      description:
        "Lower numbers appear first on the Services page. The eight original services keep their fixed positions 01-08; this orders any NEW services you add, which follow after them.",
    },
    {
      name: "legacyUrl",
      title: "Old website address",
      type: "string",
      description:
        "Only for services that existed on the old Wix site. Leave blank for anything new.",
    },
    {
      name: "eyebrow",
      title: "Small label above the heading",
      type: "string",
      description:
        'Optional. For example "Service 09". Leave blank and it simply reads "Service".',
    },
    {
      name: "heroTitle",
      title: "Page heading",
      type: "string",
      description:
        "The large heading at the top of the page. Usually the same as the service name.",
      validation: required,
    },
    {
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 4,
      description:
        "One or two sentences under the heading. Also used as the Google description when the SEO fields below are left blank, so keep it a plain, honest summary.",
    },
    {
      name: "heroMedia",
      title: "Main photograph",
      type: "image",
      options: { hotspot: true },
      fields: [imageAlt],
      description:
        "The large photograph at the top of the page. Click the crop icon and drag the circle over the part that must stay visible when it is cropped on a phone - usually a person or the building. Optional: leave it empty and the page opens on a plain dark heading, which is better than a photograph that does not show this service.",
    },
    {
      name: "overview",
      title: "Overview",
      type: "array",
      of: [{ type: "block" }],
      description:
        "The main description of the service, in a few short paragraphs. Plain paragraphs only - the page design ignores headings and bold.",
    },
    {
      name: "commonWorks",
      title: "Common works",
      type: "array",
      of: [{ type: "string" }],
      description:
        'The "Typical scope of works" list. One short line per job, for example "Movement joint sealant replacement".',
    },
    {
      name: "deliveryContent",
      title: "How we deliver it",
      type: "array",
      of: [{ type: "block" }],
      description:
        'The "How the work gets done" list. One short paragraph per point.',
    },
    {
      name: "gallery",
      title: "More photographs",
      type: "array",
      of: [{ type: "galleryImage" }],
      description:
        "Extra photographs further down the page. ORDER MATTERS - drag to reorder. The 1st is the large image beside the delivery section; the 2nd and 3rd sit side by side under the introduction. Add three for the full layout, or just one for the large image only. The page is built to look right either way, so only add photographs that genuinely show this service.",
    },
    {
      name: "suitableFor",
      title: "Suitable for",
      type: "array",
      of: [{ type: "string" }],
      description:
        'The "Where this service fits" list, for example "Managed residential blocks".',
    },
    {
      name: "faq",
      title: "FAQs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", title: "Question", type: "string" },
            { name: "answer", title: "Answer", type: "text", rows: 4 },
          ],
        },
      ],
      description:
        "Optional. Only add questions you are genuinely asked - these are published to Google as structured data, so an invented answer becomes an invented Google result. Leave it empty and the section is simply not shown.",
    },
    {
      name: "relatedServices",
      title: "Related services",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
      description:
        "Up to three services shown at the bottom of this page. Leave it empty and the site picks sensible ones for you.",
      validation: maxLength(3),
    },
    seoFields,
  ],
  preview: {
    select: { title: "name", slug: "slug.current", media: "heroMedia" },
    prepare: ({ title, slug, media }: Record<string, unknown>) => ({
      title: (title as string) || "Untitled service",
      subtitle: slug ? "/services/" + (slug as string) : "No web address yet",
      media: media as never,
    }),
  },
};

/* ------------------------------------------------------------------ */
/* project                                                             */
/* ------------------------------------------------------------------ */

export const project = {
  name: "project",
  title: "Project",
  type: "document",
  /**
   * A project is ONE JOB: its own photographs, its own short description,
   * its own page at /projects/<slug>.
   *
   * NOTE ON REQUIRED FIELDS: only title, slug, the main photograph and a
   * summary are required. Location, completion date and scope are optional
   * by design — Renan may not hold that information for older jobs, and a
   * required field would push him towards inventing one, which is exactly
   * what CONTENT-RULES.md §1 forbids. The project page renders only the
   * fields that actually have values, and omits whole sections rather than
   * showing an empty label.
   */
  fields: [
    {
      name: "title",
      title: "Project title",
      type: "string",
      description:
        'What the work was, e.g. "External Pipe Repair" or "Brickwork Repointing". Only use a client name, building name or address if the client has agreed you can publish it.',
      validation: required,
    },
    {
      name: "slug",
      title: "Web address",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      description:
        "The end of the page address: /projects/THIS-BIT. It fills in from the title when you create the project. The projects that shipped with the site show this as read-only — their addresses are already in Google's index and in the sitemap, so a rename goes through your developer.",
      // The six original projects are a URL contract — see the note by
      // CONTRACT_PROJECT_IDS above. Projects created later keep an
      // editable slug.
      readOnly: slugIsContractLocked(CONTRACT_PROJECT_IDS),
      validation: (rule: Rule) =>
        rule.required().custom((value: { current?: string } | undefined) => {
          const current = value?.current;
          if (!current) return "A web address is required.";
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)) {
            return "Use lowercase letters, numbers and hyphens only.";
          }
          return true;
        }),
    },
    {
      name: "service",
      title: "Service",
      type: "reference",
      to: [{ type: "service" }],
      description:
        "Which service this job was. Shown above the project title, and used to link the project to the right service page.",
    },
    {
      name: "location",
      title: "Location",
      type: "string",
      description:
        "OPTIONAL, and only if the client is happy for it to be published. Leave blank and the page simply does not show a location — it does not leave a gap.",
    },
    {
      name: "summary",
      title: "Short description",
      type: "text",
      rows: 4,
      description:
        "Two or three sentences on what the photographs show and what the work involved. This is what appears under the project on the Projects page, so keep it factual and specific — what was done, on what, and how it was reached.",
      validation: required,
    },
    {
      name: "heroImage",
      title: "Main photograph",
      type: "image",
      options: { hotspot: true },
      description:
        "The photograph used on the Projects page card and at the top of the project's own page. Click the crop icon and drag the circle over the part that must stay visible when it is cropped.",
      fields: [
        {
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "One sentence describing what is in the photograph, e.g. \"Rope access technician working on external pipework\". Do not put a client name, address or project title in here.",
          validation: required,
        },
      ],
      validation: required,
    },
    {
      name: "gallery",
      title: "More photographs from this job",
      type: "array",
      of: [{ type: "galleryImage" }],
      description:
        "Shown on the project page below the details, and the count appears on the Projects card. Two to four is usually right — pick shots that show something different: the access, the problem, the work, the result. ALL of them must be from THIS job. Drag to reorder.",
    },
    {
      name: "scope",
      title: "Scope of works",
      type: "array",
      of: [{ type: "string" }],
      description:
        "OPTIONAL. A short list of what was carried out, one line each. Leave it empty and the section is not shown at all.",
    },
    {
      name: "featured",
      title: "Feature this project",
      type: "boolean",
      initialValue: false,
      description:
        "Makes this the large lead project at the top of the Projects page. Tick it on one project only — if several are ticked, the first is used.",
    },
    {
      name: "completionDate",
      title: "Completed",
      type: "date",
      options: { dateFormat: "MMMM YYYY" },
      description:
        "OPTIONAL. Leave blank unless you are sure of the date — the page shows no date rather than a guess.",
    },
    seoFields,
  ],
  preview: {
    select: {
      title: "title",
      service: "service.name",
      slug: "slug.current",
      media: "heroImage",
    },
    prepare: ({ title, service, slug, media }: Record<string, unknown>) => ({
      title: (title as string) || "Untitled project",
      // The service, not the location: most projects have no published
      // location, and a list of blank subtitles is no use for finding one.
      subtitle:
        (service as string) ||
        (slug ? "/projects/" + (slug as string) : "No web address yet"),
      media: media as never,
    }),
  },
};

/* ------------------------------------------------------------------ */
/* NO siteSettings document.                                           */
/*                                                                    */
/* It existed with fields for phone, email, address, company number,   */
/* social links, footer text, logo, quote-button label and SEO — but   */
/* nothing on the site ever read them (`getSiteSettings()` was never    */
/* called), so every field was a control that changed nothing. Those   */
/* facts live in src/lib/config/site.ts, which CLAUDE.md §2 makes the   */
/* single source of truth for business identity; a developer edits     */
/* them there. The document type, its Studio entry and the dead        */
/* provider code were removed together — see CMS-HANDOVER.md.           */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* homepage (singleton)                                                */
/* ------------------------------------------------------------------ */

export const homepage = {
  name: "homepage",
  title: "Homepage",
  type: "document",
  /**
   * Only the content slots below are editable. Section ORDER, layout,
   * typography and motion are fixed in code — there is deliberately no
   * page-builder array here.
   *
   * EVERY FIELD HERE IS WIRED. That was not true before this revision:
   * `getHomepage()` existed but was called from nowhere, so all of these
   * could be edited in Studio and nothing on the site would change. A
   * control that does nothing is worse than no control, so if a field is
   * ever added back here without a consumer, remove it instead.
   *
   * Each field falls back to the verified local content when left blank,
   * which is why an empty Homepage document renders exactly as the site
   * ships today.
   */
  fields: [
    {
      name: "heroVideoUrl",
      title: "Hero background video address",
      type: "url",
      description:
        "Paste the web address of a hero background video to replace the one built in. Leave blank to keep the current BOVI footage. This is the only place the hero video ever needs to change.",
    },
    {
      name: "heroPoster",
      title: "Hero poster image",
      type: "image",
      options: { hotspot: true },
      fields: [imageAlt],
      description:
        "The photograph shown while the video loads, and — unless you also set the fallback below — on phones and whenever the video cannot play. Must be a real BOVI photograph.",
    },
    {
      name: "heroFallback",
      title: "Hero fallback photograph",
      type: "image",
      options: { hotspot: true },
      fields: [imageAlt],
      description:
        "Optional. Only set this if you want a DIFFERENT photograph on phones and when the video cannot play. Leave it blank and the poster image above is used. Must be a real BOVI photograph.",
    },
    {
      name: "heroSupportingCopy",
      title: "Hero supporting text",
      type: "text",
      rows: 3,
      description:
        "The short paragraph under ACCESS WITHOUT LIMITS. The headline itself, the buttons and the three claims beneath them are fixed in the design.",
    },
    {
      name: "introCopy",
      title: "Introduction text",
      type: "text",
      rows: 6,
      description:
        "The paragraphs in the first section below the hero. Leave a BLANK LINE between paragraphs and each becomes its own paragraph. The heading above them is fixed in the design.",
    },
    {
      name: "introImage",
      title: "Introduction photograph",
      type: "image",
      options: { hotspot: true },
      fields: [imageAlt],
      description:
        "The tall photograph beside that text. Click the crop icon and drag the circle over the part that must stay visible.",
    },
    {
      name: "featuredProject",
      title: "Featured project",
      type: "reference",
      to: [{ type: "project" }],
      description:
        "Which project's photograph carries the Featured Project block. Only the photograph and the service name are taken from it - the heading and paragraph beside it are fixed in the design. Leave blank to keep the current photograph.",
    },
    {
      name: "selectedProjects",
      title: "Projects shown on the homepage",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      description:
        "The Recent Works row. The design holds exactly THREE photographs - one wide and two tall - so the first three you pick are the ones shown. Leave empty to keep the current three.",
      validation: maxLength(3),
    },
    {
      name: "serviceAreaCopy",
      title: "Service area text",
      type: "text",
      rows: 3,
      description:
        'The sentence in the "London & The South East" section. Those two headline lines are fixed - the approved coverage wording is not editable.',
    },
    {
      name: "finalCtaCopy",
      title: "Closing call-to-action text",
      type: "text",
      rows: 3,
      description:
        'The sentence under "NEED SAFE ACCESS AT HEIGHT?". Note: this block closes EVERY page on the site, not just the homepage, so changing it changes all of them.',
    },
    /*
      NO SEO fields here. The homepage title and description are fixed brand
      copy set in code (src/app/page.tsx), so an editable SEO block on this
      document would be a control that changes nothing. Service and project
      SEO fields ARE wired and stay.
    */
  ],
};

/* ------------------------------------------------------------------ */

export const schemaTypes = [
  service,
  project,
  homepage,
  galleryImage,
];
