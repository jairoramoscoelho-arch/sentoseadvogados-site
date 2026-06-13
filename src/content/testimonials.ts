import type { Testimonial } from "./types";

/** Depoimentos de clientes (extraídos do site atual). */
export const testimonials = [
  {
    id: "ricardo-lemos",
    author: "Ricardo Lemos",
    rating: 5,
    text: "Profissionais extremamente competentes, atenciosos e comprometidos com o cliente. O escritório Sento-Sé Advogados transmite segurança desde o primeiro atendimento, com uma equipe qualificada, transparente e ética. Fui muito bem orientado em todas as etapas do processo, sempre com clareza e agilidade. Recomendo para quem busca um serviço jurídico sério e de excelência!",
  },
  {
    id: "elaine-sepulveda",
    author: "Elaine Sepulveda",
    rating: 5,
    text: "Tive uma experiência extremamente positiva com o escritório Sento-Sé Advogados. Desde o início fui tratada com muito respeito, acolhimento e profissionalismo. A equipe é atenciosa, comprometida e transmite uma confiança que faz toda a diferença em momentos difíceis. O que mais me marcou foi a forma clara e objetiva com que explicaram cada passo do processo. Recomendo, porque sei que entregam um trabalho sério, com competência e empatia.",
  },
  {
    id: "carlos-augusto",
    author: "Carlos Augusto",
    rating: 5,
    text: "Posso testemunhar como cliente que a competência e a dedicação do escritório Sento-Sé Advogados entregam um trabalho plenamente eficiente. Inclusive já indiquei para familiares, que também ficaram muito satisfeitos. Meus agradecimentos e vida longa e próspera para os colaboradores do escritório.",
  },
] satisfies Testimonial[];
