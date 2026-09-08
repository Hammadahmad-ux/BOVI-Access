import type { StructureResolver } from "sanity/structure";

/**
 * Studio navigation, written for Renan rather than for a developer.
 *
 * Two things this fixes about the default Studio:
 *
 * 1. Homepage is a SINGLETON. By default Sanity would offer "create
 *    another Homepage", which is meaningless and would silently break the
 *    site by making the query ambiguous. It is shown here as a single
 *    editable document.
 *
 * 2. The order is the order Renan will actually use: the things he
 *    changes most often first.
 *
 * There is deliberately NO "Site settings" here. Contact details, the
 * quote-button label and brand assets are code configuration
 * (src/lib/config/site.ts) — a Studio control for them would change
 * nothing on the site. See CMS-HANDOVER.md.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("BOVI Access")
    .items([
      S.listItem()
        .title("Homepage")
        .id("homepage")
        .child(
          S.document()
            .schemaType("homepage")
            .documentId("homepage")
            .title("Homepage"),
        ),

      S.divider(),

      S.documentTypeListItem("project").title("Projects"),

      // Ordered the way the website orders them, so the list Renan sees
      // matches the page he is editing. The default ordering is by
      // creation date, which matches nothing.
      S.listItem()
        .title("Services")
        .id("services")
        .child(
          S.documentTypeList("service")
            .title("Services")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
    ]);
