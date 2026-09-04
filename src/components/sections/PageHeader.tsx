import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro?: string;
};

/**
 * Standard dark page masthead used by every non-Homepage route, so page
 * openings stay consistent while individual pages own their body content.
 */
export function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <section data-ground="dark" className="bg-ink text-bone">
      <Container className="pt-20 pb-16 lg:pt-28 lg:pb-24">
        <SectionLabel ground="dark">{eyebrow}</SectionLabel>
        <h1 className="mt-6 max-w-[16ch] uppercase">{title}</h1>
        {intro ? (
          <p className="mt-8 max-w-[58ch] text-body-lg text-mist">{intro}</p>
        ) : null}
      </Container>
    </section>
  );
}
