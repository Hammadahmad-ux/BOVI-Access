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

const required = (rule: Rule) => rule.required();
const maxLength = (n: number) => (rule: Rule) => rule.max(n);

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
        "The end of the page address: /services/THIS-BIT. It fills in automatically from the service name, so for a NEW service just leave it alone. WARNING: on a service that is already live, changing this changes its address - Google forgets the old one and every existing link to it breaks. Ask your developer first.",
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
   * NOTE ON REQUIRED FIELDS: only title, slug and the main photograph are
   * required. Location, completion date and scope are optional by design —
   * Renan may not hold that information for older jobs, and a required
   * field would push him towards inventing one. The front end renders only
   * the fields that actually have values.
   */
  fields: [
    {
      name: "title",
      title: "Project title",
      type: "string",
      validation: required,
    },
    {
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: required,
    },
    {
      name: "service",
      title: "Service",
      type: "reference",
      to: [{ type: "service" }],
      description: "Which service was this project? Used for filtering.",
    },
    {
      name: "location",
      title: "Location",
      type: "string",
      description: "Optional. Leave blank if you would rather not say.",
    },
    {
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Two or three sentences on what the job involved.",
    },
    {
      name: "heroImage",
      title: "Main photograph",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: required,
        },
      ],
      validation: required,
    },
    {
      name: "gallery",
      title: "Photo gallery",
      type: "array",
      of: [{ type: "galleryImage" }],
    },
    {
      name: "scope",
      title: "Scope of works",
      type: "array",
      of: [{ type: "string" }],
      description: "Optional. A short bulleted list of what was carried out.",
    },
    {
      name: "featured",
      title: "Feature on the homepage",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "completionDate",
      title: "Completed",
      type: "date",
      options: { dateFormat: "MMMM YYYY" },
      description: "Optional.",
    },
    seoFields,
  ],
  preview: {
    select: { title: "title", subtitle: "location", media: "heroImage" },
  },
};

/* ------------------------------------------------------------------ */
/* siteSettings (singleton)                                            */
/* ------------------------------------------------------------------ */

export const siteSettings = {
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  /** Singleton — Studio structure restricts this to a single document. */
  fields: [
    { name: "logo", title: "Logo", type: "image" },
    {
      name: "phone",
      title: "Phone number",
      type: "string",
      description: "As you want it displayed, for example 07990 377780.",
    },
    {
      name: "phoneE164",
      title: "Phone number (dialling format)",
      type: "string",
      description:
        "International format used by the call links, for example +447990377780. No spaces.",
    },
    { name: "email", title: "Email address", type: "string" },
    { name: "address", title: "Address", type: "text", rows: 3 },
    {
      name: "companyNumber",
      title: "Company registration number",
      type: "string",
      description:
        "Optional. Shown in the footer and privacy policy only if you fill it in.",
    },
    {
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", title: "Platform", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
        },
      ],
    },
    { name: "footerText", title: "Footer text", type: "string" },
    { name: "quoteCTA", title: "Quote button label", type: "string" },
    seoFields,
  ],
};

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
      description: "Shown while the video loads.",
    },
    {
      name: "heroFallback",
      title: "Hero fallback photograph",
      type: "image",
      options: { hotspot: true },
      description:
        "Shown on phones and whenever the video cannot play. Must be a real BOVI photograph.",
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
    seoFields,
  ],
};

/* ------------------------------------------------------------------ */

export const schemaTypes = [
  service,
  project,
  siteSettings,
  homepage,
  galleryImage,
];
