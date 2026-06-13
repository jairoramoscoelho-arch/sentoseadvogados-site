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
          <p className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="font-serif text-lg leading-none text-gold-500"
            >
              §
            </span>
            <span className="font-medium text-green-800">{eyebrow}</span>
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
