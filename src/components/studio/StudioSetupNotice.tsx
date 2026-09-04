import { Container } from "@/components/ui/Container";

/**
 * Shown at /studio when no Sanity project is configured.
 *
 * This is an internal setup screen, not a public page: it is noindex, it
 * is never linked from the site, and it exists so that whoever opens
 * /studio sees exactly what is missing instead of a stack trace or a
 * blank screen.
 */
export function StudioSetupNotice() {
  const steps = [
    "Create a free account at sanity.io using the BOVI Access email address.",
    "Create a project named “BOVI Access” with a dataset called “production”.",
    "Copy the Project ID from the project’s dashboard.",
    "Add it to the deployment as NEXT_PUBLIC_SANITY_PROJECT_ID, with NEXT_PUBLIC_SANITY_DATASET set to production.",
    "Redeploy. This page becomes the content editor.",
  ];

  return (
    <main data-ground="dark" className="min-h-dvh bg-ink text-bone">
      <Container width="narrow" className="py-24">
        <p className="eyebrow text-green-bright">BOVI Access</p>
        <h1 className="mt-6 text-h3">Content editor not connected yet</h1>

        <p className="mt-6 text-body-lg text-mist">
          The website is running on its built-in content. Everything works —
          but content changes still need a developer until a Sanity project is
          connected here.
        </p>

        <ol className="mt-10 border-t border-hairline-dark">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex gap-5 border-b border-hairline-dark py-5"
            >
              <span aria-hidden="true" className="eyebrow text-green-bright">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-body text-mist">{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-small text-mist">
          Full instructions, including what can be edited once connected, are
          in CMS-HANDOVER.md in the project repository.
        </p>
      </Container>
    </main>
  );
}
