import type { ReactNode } from "react";
import { Container } from "./Container";
import { Breadcrumbs, type Crumb } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  breadcrumbs?: Crumb[];
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <section className="border-b border-line bg-cream">
      <Container className="py-12 lg:py-16">
        {breadcrumbs && (
          <div className="mb-6">
            <JsonLd data={breadcrumbLd(breadcrumbs)} />
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-3xl text-balance font-serif text-[clamp(2rem,1.4rem+2.6vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-ink">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{intro}</p>
        )}
      </Container>
    </section>
  );
}
