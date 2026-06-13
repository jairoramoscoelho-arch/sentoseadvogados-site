import type { BlogMeta } from "./types";

/**
 * Metadados dos artigos do blog. Os corpos ficam em `src/content/blog/<slug>.mdx`
 * (o `slug` aqui deve ser igual ao nome do arquivo .mdx). Separar metadados (TS
 * tipado) do corpo (MDX) evita problemas de tipagem de exports do MDX.
 */
export const posts = [
  {
    slug: "compliance-trabalhista",
    title:
      "Compliance Trabalhista: uma necessidade estratégica nas relações de trabalho modernas",
    excerpt:
      "Mais do que um conjunto de regras, o compliance trabalhista é um sistema de gestão que previne passivos, fortalece a cultura organizacional e garante relações de trabalho éticas e equilibradas.",
    date: "2025-12-02",
    authors: ["Victor Mata", "João Felipe Fagundes"],
    category: "Direito Trabalhista",
    cover: "/blog/compliance.png",
    seo: {
      title: "Compliance Trabalhista: por que sua empresa precisa",
      description:
        "O que é compliance trabalhista, por que ele reduz passivos e como implementar um programa efetivo de conformidade nas relações de trabalho.",
    },
  },
  {
    slug: "estabilidade-provisoria-da-gestante",
    title: "A estabilidade provisória da gestante: direitos e obrigações",
    excerpt:
      "Garantia trabalhista essencial, a estabilidade provisória da gestante protege a empregada contra a dispensa arbitrária desde a confirmação da gravidez até cinco meses após o parto.",
    date: "2025-12-02",
    authors: ["Victor Mata"],
    category: "Direito Trabalhista",
    seo: {
      title: "Estabilidade da gestante: direitos e obrigações",
      description:
        "Entenda a estabilidade provisória da gestante: fundamentação legal, direitos da empregada, obrigações do empregador e consequências do descumprimento.",
    },
  },
  {
    slug: "jornada-de-excelencia-do-escritorio",
    title: "A jornada de excelência do escritório Sento-Sé Advocacia",
    excerpt:
      "Fundado pelo advogado Jairo Sento-Sé, o escritório alia sólido embasamento acadêmico à prática jurídica, com dedicação à defesa dos direitos trabalhistas.",
    date: "2025-12-02",
    authors: ["Sento-Sé Advogados"],
    category: "Institucional",
    cover: "/blog/equipe.jpg",
    seo: {
      title: "A jornada de excelência do escritório Sento-Sé",
      description:
        "A trajetória do escritório Sento-Sé Advocacia: formação acadêmica, abordagem prática e atuação dedicada na área de Direito do Trabalho.",
    },
  },
] satisfies BlogMeta[];
