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
    <section className="relative isolate overflow-hidden bg-green-900 text-white">
      <div
        aria-hidden="true"
        className="grain-overlay pointer-events-none absolute inset-0"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6vw] top-1/2 -translate-y-1/2 select-none font-serif text-[18rem] leading-none text-gold-500/[0.08] blur-[1px] sm:text-[26rem]"
      >
        §
      </span>
      <Container className="relative py-16 lg:py-24">
        {breadcrumbs && (
          <div className="mb-7">
            <JsonLd data={breadcrumbLd(breadcrumbs)} />
            <Breadcrumbs items={breadcrumbs} tone="onDark" />
          </div>
        )}
        {eyebrow && (
          <p className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="font-serif text-lg leading-none text-gold-400"
            >
              §
            </span>
            <span className="font-medium text-white/80">{eyebrow}</span>
          </p>
        )}
        <h1 className="mt-4 max-w-3xl text-balance font-serif text-[clamp(2.25rem,1.5rem+3vw,3.5rem)] font-semibold leading-[1.06] tracking-tight text-white">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            {intro}
          </p>
        )}
      </Container>
    </section>
  );
}
