import type { SiteConfig } from "./types";

/**
 * URL base canônica do site. Ordem de prioridade:
 * 1. NEXT_PUBLIC_SITE_URL (defina ao usar domínio próprio);
 * 2. VERCEL_PROJECT_PRODUCTION_URL (preenchido automaticamente pela Vercel);
 * 3. localhost (desenvolvimento).
 */
function resolveBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * Configuração central do escritório (NAP, redes, geo, horário).
 * Single source of truth para metadata, JSON-LD, rodapé e página de contato.
 */
export const site = {
  legalName: "Sento-Sé & Advogados Associados",
  shortName: "Sento-Sé Advogados",
  alternateName: "SSEadv",
  description:
    "Escritório de advocacia em Salvador (BA) com atuação destacada em Direito Trabalhista, Cível, do Consumidor e Médico. Ética, assertividade e resultados efetivos.",
  baseUrl: resolveBaseUrl(),
  phone: "+5571993510900",
  phoneDisplay: "(71) 99351-0900",
  whatsapp: "5571993510900",
  // email: pendente de confirmação do cliente.
  instagram: "sentoseadvogados",
  address: {
    street: "Avenida Tancredo Neves",
    number: "2227",
    complement: "Edf. Salvador Prime, Torre Work, sala 517",
    neighborhood: "Caminho das Árvores",
    city: "Salvador",
    state: "BA",
    postalCode: "41820-021", // TODO(cliente): confirmar CEP exato.
    country: "BR",
  },
  // geo: pendente de confirmação (lat/long exatos do Salvador Prime).
  // openingHours: pendente de confirmação do horário de atendimento.
} satisfies SiteConfig;

/** Endereço em uma linha, para exibição e mapa. */
export const fullAddress = `${site.address.street}, ${site.address.number} — ${site.address.complement}, ${site.address.neighborhood}, ${site.address.city} — ${site.address.state}`;

/** URL do WhatsApp com mensagem padrão. */
export const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  "Olá! Gostaria de falar com o escritório Sento-Sé Advogados.",
)}`;

/** URL do perfil no Instagram. */
export const instagramUrl = `https://www.instagram.com/${site.instagram}`;

/** Embed do Google Maps por endereço (sem necessidade de API key). */
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  `${site.legalName}, ${site.address.street}, ${site.address.number}, ${site.address.city}, ${site.address.state}`,
)}&output=embed`;

/** Link "como chegar" para o Google Maps. */
export const mapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.legalName}, ${fullAddress}`,
)}`;
