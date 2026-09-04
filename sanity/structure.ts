import type { StructureResolver } from "sanity/structure";

/**
 * Studio navigation, written for Renan rather than for a developer.
 *
 * Two things this fixes about the default Studio:
 *
 * 1. Homepage and Site settings are SINGLETONS. By default Sanity would
 *    offer "create another Homepage", which is meaningless and would
 *    silently break the site by making the query ambiguous. They are
 *    shown here as a single editable document.
 *
 * 2. The order is the order Renan will actually use: the things he
 *    changes most often first.
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
      S.documentTypeListItem("service").title("Services"),

      S.divider(),

      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site settings"),
        ),
    ]);
