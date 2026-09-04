import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ServiceFaq } from "@/lib/content/services";

/**
 * Renders NOTHING when a service has no verified FAQ content.
 *
 * That is the point of the component. No service currently has
 * client-verified questions and answers, and inventing them would put
 * fabricated claims into FAQPage structured data as well as onto the page.
 * The template handles zero FAQs by disappearing — see CONTENT-RULES.md §8.
 */
export function ServiceFaqSection({ faq }: { faq: readonly ServiceFaq[] }) {
  if (faq.length === 0) return null;

  return (
    <section className="bg-bone">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionLabel index="05">Questions</SectionLabel>
          <h2 className="mt-6 max-w-[16ch] text-h3">Common questions.</h2>
        </Reveal>

        <dl className="mt-12 border-t border-hairline-light">
          {faq.map((item) => (
            <div
              key={item.question}
              className="grid gap-3 border-b border-hairline-light py-7 lg:grid-cols-12 lg:gap-10"
            >
              <dt className="text-h5 lg:col-span-5">{item.question}</dt>
              <dd className="max-w-[52ch] text-body text-moss lg:col-span-7">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
