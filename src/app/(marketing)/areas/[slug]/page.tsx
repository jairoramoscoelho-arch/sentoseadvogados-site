import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LawyerCard } from "@/components/cards/LawyerCard";
import { AreaIcon } from "@/components/icons/AreaIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceLd } from "@/lib/jsonld";
import {
  getAreaBySlug,
  getAreaSlugs,
  getLawyersForArea,
} from "@/lib/content";
import { whatsappUrl } from "@/content/site";

export function generateStaticParams() {
  return getAreaSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) return {};
  return {
    title: area.seo.title,
    description: area.seo.description,
    alternates: { canonical: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  const lawyers = getLawyersForArea(area.slug).filter((l) => !l.isIntern);

  return (
    <>
      <JsonLd data={serviceLd(area)} />
      <PageHeader
        eyebrow="Área de Atuação"
        title={area.name}
        intro={area.summary}
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Áreas de Atuação", href: "/areas" },
          { name: area.name, href: `/areas/${area.slug}` },
        ]}
      />

      <section className="section-y">
        <Container className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div>
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <AreaIcon name={area.icon} className="h-7 w-7" />
            </span>
            <p className="mt-6 text-lg leading-8 text-ink/80">
              {area.description}
            </p>

            <h2 className="mt-12 font-serif text-2xl font-semibold tracking-tight text-ink">
              Como podemos ajudar
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {area.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 rounded-lg border border-line bg-paper p-4"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-6 text-ink/80">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-line bg-cream p-7 shadow-soft">
              <h2 className="font-serif text-xl font-semibold text-ink">
                Precisa de orientação em {area.shortName}?
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Fale com a nossa equipe e entenda como podemos ajudar no seu
                caso, de forma clara e objetiva.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button href={whatsappUrl} variant="primary" className="w-full">
                  Falar no WhatsApp
                </Button>
                <Button href="/contato" variant="outline" className="w-full">
                  Página de contato
                </Button>
              </div>
            </div>
          </aside>
        </Container>
      </section>

      {lawyers.length > 0 && (
        <section className="section-y bg-cream">
          <Container>
            <SectionHeading
              eyebrow="Equipe"
              title={`Quem atua em ${area.shortName}`}
            />
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {lawyers.map((lawyer) => (
                <LawyerCard key={lawyer.slug} lawyer={lawyer} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
