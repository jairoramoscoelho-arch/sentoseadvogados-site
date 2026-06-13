/**
 * Formas (interfaces) de todo o conteúdo estruturado do site.
 * Fonte da verdade tipada — os módulos em `src/content/*` satisfazem estes tipos.
 */

export interface Seo {
  /** Título da aba/SERP (sem o sufixo do template). */
  title: string;
  /** Meta description (120–160 caracteres idealmente). */
  description: string;
  /** Caminho relativo de uma imagem OG específica (opcional). */
  ogImage?: string;
}

export interface PracticeArea {
  slug: string;
  /** Nome completo da área (ex.: "Direito Trabalhista"). */
  name: string;
  /** Rótulo curto para cartões/menus (ex.: "Trabalhista"). */
  shortName: string;
  /** Frase-resumo de 1 linha. */
  summary: string;
  /** Parágrafo(s) de descrição completa. */
  description: string;
  /** Tópicos/serviços em destaque (bullets). */
  highlights: string[];
  /** Chave do ícone (ver components/icons). */
  icon: AreaIcon;
  /** Ordem de exibição. */
  order: number;
  seo: Seo;
}

export type AreaIcon =
  | "trabalhista"
  | "civil"
  | "consumidor"
  | "medico"
  | "empresarial"
  | "balanca";

export interface Lawyer {
  slug: string;
  name: string;
  /** Cargo/função (ex.: "Sócio-fundador", "Advogada", "Estagiário"). */
  role: string;
  isPartner: boolean;
  isIntern: boolean;
  /** Caminho da foto em /public (opcional enquanto não houver retrato). */
  photo?: string;
  /** Bio em parágrafo único. */
  bio: string;
  /** Formação acadêmica (lista de credenciais). */
  formation: string[];
  /** Slugs das áreas em que atua (relaciona com PracticeArea). */
  areaSlugs: string[];
  /** Número da OAB — PENDENTE de confirmação do cliente. */
  oab?: string;
  email?: string;
  seo?: Seo;
}

export interface Testimonial {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Área relacionada (opcional), para agrupar. */
  areaSlug?: string;
}

export interface BlogMeta {
  slug: string;
  title: string;
  excerpt: string;
  /** Data de publicação no formato ISO (YYYY-MM-DD). */
  date: string;
  /** Data de atualização ISO (opcional). */
  updated?: string;
  /** Nomes dos autores. */
  authors: string[];
  /** Categoria editorial. */
  category: string;
  /** Caminho da imagem de capa em /public (opcional). */
  cover?: string;
  seo?: Seo;
}

export interface SiteAddress {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode?: string;
  country: "BR";
}

export interface OpeningHours {
  /** Dias no formato schema.org (ex.: ["Monday","Tuesday"]). */
  days: string[];
  opens: string; // "08:00"
  closes: string; // "18:00"
}

export interface SiteConfig {
  legalName: string;
  shortName: string;
  alternateName?: string;
  /** Tagline / descrição padrão para SEO. */
  description: string;
  baseUrl: string;
  /** Telefone em E.164 (ex.: "+5571993510900"). */
  phone: string;
  phoneDisplay: string;
  /** Número para wa.me (só dígitos, com DDI). */
  whatsapp: string;
  email?: string;
  /** Handle do Instagram, sem @. */
  instagram: string;
  address: SiteAddress;
  geo?: { latitude: number; longitude: number };
  openingHours?: OpeningHours[];
}
