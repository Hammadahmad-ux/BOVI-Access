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
      validation: required,
    },
    {
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      description:
        "Changing this changes the page web address and can lose Google rankings. Only change it if you are sure.",
      validation: required,
    },
    {
      name: "order",
      title: "Display order",
      type: "number",
      description:
        "Controls the position in the numbered service list (01, 02, 03 and so on).",
    },
    {
      name: "legacyUrl",
      title: "Old website address",
      type: "string",
      description:
        "The address this service had on the old Wix site, if any. Used to redirect old links. Leave blank if unsure.",
    },
    { name: "eyebrow", title: "Eyebrow label", type: "string" },
    {
      name: "heroTitle",
      title: "Page heading",
      type: "string",
      validation: required,
    },
    {
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 4,
      description: "One or two sentences shown directly under the heading.",
    },
    {
      name: "heroMedia",
      title: "Main image",
      type: "image",
      options: { hotspot: true },
      description:
        "The large image at the top of the page. Use the hotspot tool to set which part must stay visible when the image is cropped.",
    },
    {
      name: "overview",
      title: "Overview",
      type: "array",
      of: [{ type: "block" }],
      description: "The main body copy for this service.",
    },
    {
      name: "commonWorks",
      title: "Common works",
      type: "array",
      of: [{ type: "string" }],
      description: "A short list of the typical jobs covered by this service.",
    },
    {
      name: "deliveryContent",
      title: "How we deliver it",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "gallery",
      title: "Photo gallery",
      type: "array",
      of: [{ type: "galleryImage" }],
    },
    {
      name: "suitableFor",
      title: "Suitable for",
      type: "array",
      of: [{ type: "string" }],
      description: "For example: Property Managers, Facilities Managers.",
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
        "Only add questions you are genuinely asked. These are published to Google as structured data.",
    },
    {
      name: "relatedServices",
      title: "Related services",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
      validation: maxLength(3),
    },
    seoFields,
  ],
  preview: { select: { title: "name", media: "heroMedia" } },
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
   */
  fields: [
    {
      name: "heroVideoUrl",
      title: "Hero background video URL",
      type: "url",
      description:
        "Paste the web address of the hero background video. Leave blank to show the photograph instead. This is the only place the hero video needs to change.",
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
    },
    { name: "introCopy", title: "Introduction text", type: "text", rows: 5 },
    {
      name: "introImage",
      title: "Introduction image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "featuredProject",
      title: "Featured project",
      type: "reference",
      to: [{ type: "project" }],
    },
    {
      name: "selectedProjects",
      title: "Projects shown on the homepage",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      validation: maxLength(6),
    },
    {
      name: "serviceAreaCopy",
      title: "Service area text",
      type: "text",
      rows: 3,
    },
    {
      name: "finalCtaCopy",
      title: "Closing call-to-action text",
      type: "text",
      rows: 3,
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
