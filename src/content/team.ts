import type { Lawyer } from "./types";

/**
 * Equipe do escritório. Bios e formação extraídas do conteúdo do próprio
 * escritório. Números de OAB pendentes de confirmação do cliente (campo `oab`).
 * Não há retratos individuais ainda — `photo` indefinido usa avatar com monograma.
 */
export const team = [
  {
    slug: "jairo-sento-se",
    name: "Jairo Sento-Sé",
    role: "Sócio-fundador",
    isPartner: true,
    isIntern: false,
    bio: "Sócio-fundador do escritório, é referência no campo trabalhista, com atuação marcante na defesa de direitos e na formação de novos profissionais. Sua sólida trajetória acadêmica alia-se a uma forte experiência prática, refletida no tratamento meticuloso e estratégico de cada caso.",
    formation: [
      "Graduação em Direito — Universidade Federal da Bahia (UFBA)",
      "Pós-graduação em Direito do Trabalho — Faculdade Baiana de Direito",
      "Mestre em Direito — UFBA",
      "Doutorando em Direito — UFBA",
      "Professor de Direito e Processo do Trabalho",
    ],
    areaSlugs: ["direito-trabalhista"],
    seo: {
      title: "Jairo Sento-Sé — Sócio-fundador",
      description:
        "Jairo Sento-Sé, sócio-fundador do Sento-Sé Advogados, mestre e doutorando pela UFBA e professor de Direito e Processo do Trabalho.",
    },
  },
  {
    slug: "victor-mata",
    name: "Victor Mata",
    role: "Advogado e Professor",
    isPartner: false,
    isIntern: false,
    bio: "Professor de Direito e Processo do Trabalho, soma vasta experiência no patrocínio de ações trabalhistas, atuando tanto em favor de reclamantes quanto de reclamados. É reconhecido por sua abordagem estratégica e pelo atendimento preciso, unindo técnica, didática e visão moderna da advocacia.",
    formation: [
      "Graduação em Direito — Universidade de Salvador (UNIFACS)",
      "Especialista em Direito do Trabalho",
      "Professor de Direito e Processo do Trabalho",
    ],
    areaSlugs: ["direito-trabalhista"],
  },
  {
    slug: "joao-felipe-fagundes",
    name: "João Felipe Fagundes",
    role: "Advogado",
    isPartner: false,
    isIntern: false,
    bio: "Há mais de quatro anos atua com foco em consultoria e contencioso empresarial trabalhista, oferecendo suporte preventivo e soluções estratégicas para empresas. Seu trabalho é marcado pela constante atualização acadêmica e pela participação ativa em estudos e análises no campo juslaboral.",
    formation: [
      "Graduação em Direito — Centro de Ensino Superior de Ilhéus",
      "Especialista em Direito do Trabalho",
    ],
    areaSlugs: ["direito-trabalhista"],
  },
  {
    slug: "rafael-almeida",
    name: "Rafael Almeida",
    role: "Advogado e Professor",
    isPartner: false,
    isIntern: false,
    bio: "Fortalece o corpo jurídico do escritório com formação sólida e atuação técnica na área cível. Possui experiência destacada em demandas estratégicas de natureza cível e exerce a docência em Direito Constitucional. Sua visão crítica e aprofundada garante segurança e assertividade em litígios e pareceres.",
    formation: [
      "Graduação em Direito — Universidade Católica do Salvador (UCSal)",
      "Especialista em Direito Processual Civil — Centro de Estudos Renato Saraiva (CERS)",
      "Docente de Direito Constitucional",
    ],
    areaSlugs: ["direito-civil"],
  },
  {
    slug: "rafael-do-carmo",
    name: "Rafael do Carmo",
    role: "Advogado",
    isPartner: false,
    isIntern: false,
    bio: "Atua com frequência na advocacia empresarial, oferecendo suporte completo e tratamento minucioso às demandas consumeristas. Sua prática é marcada pela organização, pelo rigor técnico e pela atenção às nuances do mercado de consumo.",
    formation: [
      "Graduação em Direito — Faculdade Batista Brasileira",
      "Especialista em Direito do Consumidor",
      "Pós-graduação em Direito Processual Civil — Complexo de Ensino Renato Saraiva (CERS)",
    ],
    areaSlugs: ["direito-do-consumidor"],
  },
  {
    slug: "vitor-marinho",
    name: "Vitor Marinho",
    role: "Advogado",
    isPartner: false,
    isIntern: false,
    bio: "Atua com foco em Direito Médico, Saúde e Bioética, com atuação frequente na representação de hospitais e clínicas em casos de erro médico. Combina sensibilidade, precisão técnica e profundo conhecimento das especificidades do setor de saúde.",
    formation: [
      "Graduação em Direito — Universidade Católica do Salvador (UCSal)",
      "Especialista em Direito Médico, Saúde e Bioética",
      "Pós-graduação em Direito Público — Faculdade Baiana de Direito",
    ],
    areaSlugs: ["direito-medico-e-da-saude"],
  },
  {
    slug: "allan-souza",
    name: "Allan Souza",
    role: "Estagiário — Núcleo do Consumidor",
    isPartner: false,
    isIntern: true,
    bio: "Integra o núcleo de Direito do Consumidor, com responsabilidade por diligências internas e externas, organização de documentos, atendimento prévio e acompanhamento de demandas administrativas.",
    formation: ["Graduando em Direito — UNIME (8º semestre)"],
    areaSlugs: ["direito-do-consumidor"],
  },
  {
    slug: "naila-lima-silva",
    name: "Naila Lima Silva",
    role: "Estagiária — Núcleo Trabalhista",
    isPartner: false,
    isIntern: true,
    bio: "Atua no núcleo trabalhista do escritório, destacando-se pela competência, organização e dedicação. Desde 2024 participa do projeto de extensão da Clínica de Direitos Humanos da UFBA, experiência que amplia sua formação humanística.",
    formation: ["Graduanda em Direito — UNIJORGE (5º semestre)"],
    areaSlugs: ["direito-trabalhista"],
  },
  {
    slug: "giula-carqueija",
    name: "Giula Carqueija",
    role: "Estagiária — Núcleo Trabalhista",
    isPartner: false,
    isIntern: true,
    bio: "Integra o núcleo trabalhista, participando ativamente de rotinas essenciais, auxiliando na elaboração de peças, no atendimento aos clientes e na organização processual.",
    formation: ["Graduanda em Direito — UNIME"],
    areaSlugs: ["direito-trabalhista"],
  },
  {
    slug: "thaissa-castro",
    name: "Thaissa Castro",
    role: "Estagiária — Núcleo Cível",
    isPartner: false,
    isIntern: true,
    bio: "Compõe o setor cível do escritório, auxiliando em pesquisas jurídicas, na preparação de documentos e no acompanhamento de prazos e demandas. Sua postura cuidadosa e o interesse em aprimorar-se tecnicamente a tornam um reforço valioso para o núcleo cível.",
    formation: ["Graduanda em Direito"],
    areaSlugs: ["direito-civil"],
  },
] satisfies Lawyer[];
