import { site, instagramUrl } from "@/content/site";
import type { PracticeArea, Lawyer, BlogMeta, FaqItem } from "@/content/types";

const ORG_ID = `${site.baseUrl}/#organization`;
const WEBSITE_ID = `${site.baseUrl}/#website`;

/** Resolve um caminho relativo para URL absoluta. */
function abs(path: string): string {
  if (path.startsWith("http")) return path;
  return `${site.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": ORG_ID,
    name: site.legalName,
    alternateName: site.alternateName,
    url: site.baseUrl,
    image: abs("/logo.png"),
    logo: abs("/logo.png"),
    telephone: site.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.street}, ${site.address.number}, ${site.address.complement}`,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    areaServed: { "@type": "City", name: "Salvador" },
    sameAs: [instagramUrl],
    knowsAbout: [
      "Direito do Trabalho",
      "Direito Civil",
      "Direito do Consumidor",
      "Direito Médico",
    ],
  };
}

export function webSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.baseUrl,
    name: site.shortName,
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.href),
    })),
  };
}

export function serviceLd(area: PracticeArea) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: area.name,
    serviceType: area.name,
    description: area.seo.description,
    url: abs(`/areas/${area.slug}`),
    areaServed: { "@type": "City", name: "Salvador" },
    provider: { "@id": ORG_ID },
  };
}

export function personLd(lawyer: Lawyer, areaNames: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: lawyer.name,
    jobTitle: lawyer.role,
    url: abs(`/equipe/${lawyer.slug}`),
    worksFor: { "@id": ORG_ID },
    knowsAbout: areaNames,
    alumniOf: lawyer.formation,
    ...(lawyer.photo ? { image: abs(lawyer.photo) } : {}),
  };
}

export function blogPostingLd(post: BlogMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: post.authors.map((name) => ({ "@type": "Person", name })),
    ...(post.cover ? { image: abs(post.cover) } : {}),
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    publisher: { "@id": ORG_ID },
    inLanguage: "pt-BR",
  };
}

export function faqPageLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
