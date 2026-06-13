import type { FaqItem } from "./types";

/**
 * Perguntas frequentes. Conteúdo informativo (redigido pelo escritório),
 * em linguagem sóbria e sem promessas de resultado, conforme as regras de
 * publicidade da advocacia (Provimento OAB nº 205/2021).
 */
export const faqs = [
  {
    id: "areas",
    question: "Quais áreas o escritório atende?",
    answer:
      "O Sento-Sé & Advogados Associados atua principalmente em Direito Trabalhista, Direito Civil, Direito do Consumidor e Direito Médico e da Saúde, atendendo tanto pessoas físicas quanto empresas.",
  },
  {
    id: "onde-fica",
    question: "Onde fica o escritório?",
    answer:
      "Nossa sede fica na Avenida Tancredo Neves, 2227, Edifício Salvador Prime, Torre Work, sala 517, no bairro Caminho das Árvores, em Salvador — Bahia, um dos principais centros empresariais da cidade.",
  },
  {
    id: "agendar",
    question: "Como agendo uma consulta?",
    answer:
      "Você pode entrar em contato pelo WhatsApp (71) 99351-0900 ou pelo formulário da página de Contato. Retornamos para entender a sua demanda e, quando for o caso, agendar um atendimento presencial ou on-line.",
  },
  {
    id: "online",
    question: "O escritório atende de forma on-line?",
    answer:
      "Sim. Além do atendimento presencial em Salvador, realizamos reuniões e acompanhamento de casos de forma remota, conforme a necessidade e a conveniência do cliente.",
  },
  {
    id: "empresas-pessoas",
    question: "Vocês atendem empresas e pessoas físicas?",
    answer:
      "Sim. Atendemos pessoas físicas em demandas individuais e empresas em consultoria preventiva e contencioso, com destaque para a área trabalhista empresarial e o compliance.",
  },
  {
    id: "primeira-consulta",
    question: "O que levar para a primeira consulta?",
    answer:
      "Sempre que possível, reúna os documentos relacionados ao caso — contratos, comprovantes, mensagens, documentos pessoais e qualquer notificação recebida. Esses materiais ajudam na análise inicial da sua situação.",
  },
  {
    id: "regioes",
    question: "Em quais regiões vocês atuam?",
    answer:
      "Atuamos em Salvador e na Região Metropolitana, com possibilidade de acompanhamento de demandas em outras comarcas, a depender do caso.",
  },
  {
    id: "compliance",
    question: "Como funciona a consultoria trabalhista para empresas?",
    answer:
      "Oferecemos suporte preventivo às empresas, com mapeamento de riscos, revisão de rotinas e implementação de boas práticas de compliance trabalhista, reduzindo passivos e fortalecendo a segurança jurídica das relações de trabalho.",
  },
] as const satisfies FaqItem[];
