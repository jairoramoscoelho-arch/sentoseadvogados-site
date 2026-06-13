import type { PracticeArea } from "./types";

/**
 * Áreas de atuação. Descrições de Trabalhista, Cível e Consumidor são as do
 * próprio escritório (site atual); Direito Médico foi redigido para o
 * especialista da equipe (Vitor Marinho). Copy informativa, sem promessas de
 * resultado (Provimento OAB 205/2021).
 */
export const areas = [
  {
    slug: "direito-trabalhista",
    name: "Direito Trabalhista",
    shortName: "Trabalhista",
    summary:
      "Assessoria completa em Direito do Trabalho, na defesa de empregados e de empregadores.",
    description:
      "Nosso escritório oferece assessoria completa em Direito do Trabalho, atuando tanto na defesa de empregados quanto de empregadores. Trabalhamos com análise detalhada do contrato de trabalho, identificação de irregularidades, cálculos de verbas rescisórias e elaboração de ações judiciais e extrajudiciais. Atuamos em casos de horas extras, assédio moral, adicional de insalubridade ou periculosidade, rescisão indireta, verbas não pagas, reconhecimento de vínculo, estabilidade provisória, entre outras demandas. Nossa atuação é personalizada, sempre buscando a solução mais adequada e segura para cada cliente.",
    highlights: [
      "Horas extras e verbas não pagas",
      "Assédio moral e rescisão indireta",
      "Adicional de insalubridade e periculosidade",
      "Reconhecimento de vínculo e estabilidade provisória",
      "Cálculo e revisão de verbas rescisórias",
      "Consultoria e compliance trabalhista para empresas",
    ],
    icon: "trabalhista",
    order: 1,
    seo: {
      title: "Advogado Trabalhista em Salvador",
      description:
        "Atuação em Direito do Trabalho em Salvador: horas extras, assédio moral, rescisão, verbas e compliance trabalhista, na defesa de empregados e empregadores.",
    },
  },
  {
    slug: "direito-civil",
    name: "Direito Civil",
    shortName: "Cível",
    summary:
      "Consultoria e representação em contratos, indenizações, dívidas e responsabilidade civil.",
    description:
      "Na área Cível, prestamos consultoria e representação em conflitos envolvendo contratos, indenizações, dívidas, execução, responsabilidade civil, posse e propriedade. Auxiliamos na prevenção de litígios, revisão de documentos, negociações e propositura das ações necessárias para resguardar direitos. Nosso objetivo é oferecer segurança jurídica e estratégias eficazes, seja para resolver conflitos de forma amigável, seja para defender os interesses do cliente no processo judicial.",
    highlights: [
      "Contratos e responsabilidade civil",
      "Indenizações por danos materiais e morais",
      "Cobranças, dívidas e execução",
      "Posse e propriedade",
      "Revisão de documentos e negociações",
      "Prevenção e solução de litígios",
    ],
    icon: "civil",
    order: 2,
    seo: {
      title: "Advogado Cível em Salvador",
      description:
        "Direito Civil em Salvador: contratos, indenizações, responsabilidade civil, dívidas, posse e propriedade. Consultoria e representação judicial e extrajudicial.",
    },
  },
  {
    slug: "direito-do-consumidor",
    name: "Direito do Consumidor",
    shortName: "Consumidor",
    summary:
      "Defesa do consumidor diante de práticas abusivas, cobranças indevidas e fraudes.",
    description:
      "Atuamos fortemente em demandas de Direito do Consumidor, garantindo que o cliente tenha seus direitos preservados diante de práticas abusivas. Lidamos com casos de cobranças indevidas, compras não entregues, fraudes, negativação indevida, problemas com bancos, companhias aéreas, instituições financeiras e plataformas digitais. Também buscamos reparação por prejuízos materiais e danos morais, sempre de forma célere e assertiva. Nosso compromisso é orientar o consumidor e agir de maneira estratégica para solucionar o problema, seja por via administrativa ou judicial.",
    highlights: [
      "Cobranças indevidas e negativação",
      "Compras e serviços não entregues",
      "Fraudes e práticas abusivas",
      "Problemas com bancos e instituições financeiras",
      "Companhias aéreas e plataformas digitais",
      "Reparação por danos materiais e morais",
    ],
    icon: "consumidor",
    order: 3,
    seo: {
      title: "Advogado do Consumidor em Salvador",
      description:
        "Direito do Consumidor em Salvador: cobranças indevidas, negativação, fraudes, problemas com bancos, companhias aéreas e plataformas digitais. Defesa do consumidor.",
    },
  },
  {
    slug: "direito-medico-e-da-saude",
    name: "Direito Médico e da Saúde",
    shortName: "Médico e Saúde",
    summary:
      "Atuação em responsabilidade na área da saúde, defesa de hospitais, clínicas e profissionais, e bioética.",
    description:
      "Atuamos em Direito Médico, da Saúde e Bioética, com atendimento voltado tanto a profissionais e instituições de saúde quanto a pacientes. Representamos hospitais, clínicas e médicos em casos de responsabilidade civil por erro médico, além de orientar sobre prontuários, consentimento informado, sigilo e questões éticas. Também acompanhamos demandas envolvendo planos de saúde, como negativas de cobertura e reembolsos. Nossa atuação combina rigor técnico, sensibilidade e conhecimento das especificidades do setor de saúde, com foco em prevenção e segurança jurídica.",
    highlights: [
      "Responsabilidade civil por erro médico",
      "Defesa de hospitais, clínicas e profissionais",
      "Prontuário, consentimento informado e sigilo",
      "Planos de saúde e negativas de cobertura",
      "Bioética e conformidade na área da saúde",
      "Consultoria preventiva para instituições de saúde",
    ],
    icon: "medico",
    order: 4,
    seo: {
      title: "Advogado de Direito Médico e da Saúde em Salvador",
      description:
        "Direito Médico, da Saúde e Bioética em Salvador: erro médico, defesa de hospitais e clínicas, planos de saúde e consultoria preventiva para o setor de saúde.",
    },
  },
] satisfies PracticeArea[];
