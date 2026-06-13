import { areas } from "@/content/areas";
import { team } from "@/content/team";
import { testimonials } from "@/content/testimonials";
import { faqs } from "@/content/faqs";
import { posts } from "@/content/posts";
import type { BlogMeta, Lawyer, PracticeArea } from "@/content/types";

/* ----------------------------- Áreas ----------------------------- */

export function getAreas(): PracticeArea[] {
  return [...areas].sort((a, b) => a.order - b.order);
}

export function getAreaBySlug(slug: string): PracticeArea | undefined {
  return areas.find((a) => a.slug === slug);
}

export function getAreaSlugs(): string[] {
  return areas.map((a) => a.slug);
}

/* ----------------------------- Equipe ---------------------------- */

export function getTeam(): Lawyer[] {
  return [...team];
}

export function getPartners(): Lawyer[] {
  return team.filter((l) => l.isPartner);
}

/** Advogados que não são sócios nem estagiários. */
export function getAssociates(): Lawyer[] {
  return team.filter((l) => !l.isPartner && !l.isIntern);
}

export function getInterns(): Lawyer[] {
  return team.filter((l) => l.isIntern);
}

/** Advogados (sócios + associados), excluindo estagiários. */
export function getLawyers(): Lawyer[] {
  return team.filter((l) => !l.isIntern);
}

export function getLawyerBySlug(slug: string): Lawyer | undefined {
  return team.find((l) => l.slug === slug);
}

export function getLawyerSlugs(): string[] {
  return team.map((l) => l.slug);
}

/* -------------------------- Relações ----------------------------- */

export function getAreasForLawyer(lawyer: Lawyer): PracticeArea[] {
  return lawyer.areaSlugs
    .map((slug) => getAreaBySlug(slug))
    .filter((a): a is PracticeArea => Boolean(a));
}

export function getLawyersForArea(slug: string): Lawyer[] {
  return team.filter((l) => l.areaSlugs.includes(slug));
}

/* ----------------------- Depoimentos / FAQ ----------------------- */

export function getTestimonials() {
  return [...testimonials];
}

export function getFaqs() {
  return [...faqs];
}

/* ------------------------------ Blog ----------------------------- */

export function getAllPosts(): BlogMeta[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}

export function getRecentPosts(count = 3): BlogMeta[] {
  return getAllPosts().slice(0, count);
}
