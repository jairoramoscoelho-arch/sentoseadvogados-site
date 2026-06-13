import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { AreaIcon } from "@/components/icons/AreaIcon";
import { MotionReveal } from "@/components/interactive/MotionReveal";
import { getAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Áreas de Atuação",
  description:
    "Conheça as áreas de atuação do Sento-Sé Advogados em Salvador: Direito Trabalhista, Cível, do Consumidor e Direito Médico e da Saúde.",
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  const areas = getAreas();

  return (
    <>
      <PageHeader
        eyebrow="O que fazemos"
        title="Áreas de Atuação"
        intro="Atuamos de forma personalizada em cada área, com consultoria preventiva e atuação judicial, sempre em busca da solução mais adequada e segura para o seu caso."
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Áreas de Atuação", href: "/areas" },
        ]}
      />

      <section className="section-y">
        <Container>
          <div className="divide-y divide-line">
            {areas.map((area) => (
              <MotionReveal key={area.slug}>
                <article className="grid gap-8 py-12 first:pt-0 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-700">
                        <AreaIcon name={area.icon} className="h-6 w-6" />
                      </span>
                      <span className="font-serif text-sm tabular-nums text-gold-600">
                        {String(area.order).padStart(2, "0")}
                      </span>
                    </div>
                    <h2
                      id={area.slug}
                      className="mt-5 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
                    >
                      {area.name}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-muted">
                      {area.summary}
                    </p>
                    <div className="mt-6">
                      <Button href={`/areas/${area.slug}`} variant="outline">
                        Saiba mais
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <p className="text-base leading-8 text-ink/80">
                      {area.description}
                    </p>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {area.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5">
                          <Check
                            className="mt-1 h-4 w-4 shrink-0 text-green-700"
                            aria-hidden="true"
                          />
                          <span className="text-sm leading-6 text-ink/80">
                            {h}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
