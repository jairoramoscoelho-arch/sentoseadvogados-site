import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { personLd } from "@/lib/jsonld";
import {
  getLawyerBySlug,
  getLawyerSlugs,
  getAreasForLawyer,
} from "@/lib/content";
import { initials } from "@/lib/utils";
import { whatsappUrl } from "@/content/site";

export function generateStaticParams() {
  return getLawyerSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lawyer = getLawyerBySlug(slug);
  if (!lawyer) return {};
  return {
    title: lawyer.seo?.title ?? `${lawyer.name} — ${lawyer.role}`,
    description:
      lawyer.seo?.description ??
      `${lawyer.name}, ${lawyer.role} no Sento-Sé Advogados. ${lawyer.bio}`.slice(
        0,
        160,
      ),
    alternates: { canonical: `/equipe/${lawyer.slug}` },
  };
}

export default async function LawyerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lawyer = getLawyerBySlug(slug);
  if (!lawyer) notFound();

  const areas = getAreasForLawyer(lawyer);

  return (
    <>
      <JsonLd data={personLd(lawyer, areas.map((a) => a.name))} />
      <PageHeader
        eyebrow={lawyer.role}
        title={lawyer.name}
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Equipe", href: "/equipe" },
          { name: lawyer.name, href: `/equipe/${lawyer.slug}` },
        ]}
      />

      <section className="section-y">
        <Container className="grid gap-12 lg:grid-cols-[20rem_1fr] lg:gap-16">
          {/* Avatar + contato */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
              {lawyer.photo ? (
                <Image
                  src={lawyer.photo}
                  alt={lawyer.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 20rem"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-700 to-green-900">
                  <span
                    aria-hidden="true"
                    className="font-serif text-6xl font-semibold text-gold-400"
                  >
                    {initials(lawyer.name)}
                  </span>
                </div>
              )}
            </div>
            {lawyer.oab && (
              <p className="mt-4 text-sm text-muted">OAB/BA {lawyer.oab}</p>
            )}
            <div className="mt-5">
              <Button href={whatsappUrl} variant="primary" className="w-full">
                Falar no WhatsApp
              </Button>
            </div>
          </div>

          {/* Bio + formação + áreas */}
          <div>
            <p className="text-lg leading-8 text-ink/80">{lawyer.bio}</p>

            <h2 className="mt-10 flex items-center gap-2 font-serif text-xl font-semibold text-ink">
              <GraduationCap
                className="h-5 w-5 text-green-700"
                aria-hidden="true"
              />
              Formação
            </h2>
            <ul className="mt-4 space-y-2.5">
              {lawyer.formation.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-sm leading-6 text-ink/80"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"
                    aria-hidden="true"
                  />
                  {f}
                </li>
              ))}
            </ul>

            {areas.length > 0 && (
              <>
                <h2 className="mt-10 font-serif text-xl font-semibold text-ink">
                  Áreas de atuação
                </h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {areas.map((area) => (
                    <Link
                      key={area.slug}
                      href={`/areas/${area.slug}`}
                      className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-green-800 transition-colors hover:border-green-700/40 hover:bg-green-50"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
