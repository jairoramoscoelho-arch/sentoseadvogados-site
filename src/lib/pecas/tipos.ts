export interface TipoPeca {
  key: string;
  nome: string;
  descricao: string;
}

/** Tipos de peça oferecidos na galeria. `nome` é o rótulo usado na geração. */
export const TIPOS_PECA: TipoPeca[] = [
  {
    key: "peticao_inicial",
    nome: "Petição inicial",
    descricao: "Inaugura o processo: fatos, direito e pedidos.",
  },
  {
    key: "reclamacao_trabalhista",
    nome: "Reclamação trabalhista",
    descricao: "Petição inicial na Justiça do Trabalho (art. 840 da CLT).",
  },
  {
    key: "contestacao",
    nome: "Contestação",
    descricao: "Defesa do réu, com impugnação específica dos fatos.",
  },
  {
    key: "replica",
    nome: "Réplica",
    descricao: "Resposta do autor à contestação.",
  },
  {
    key: "recurso",
    nome: "Recurso",
    descricao: "Impugna decisão desfavorável (apelação, recurso ordinário, agravo).",
  },
  {
    key: "contrarrazoes",
    nome: "Contrarrazões",
    descricao: "Resposta ao recurso da parte contrária.",
  },
  {
    key: "notificacao_extrajudicial",
    nome: "Notificação extrajudicial",
    descricao: "Comunicação formal antes ou fora do processo.",
  },
];

export function tipoPecaByKey(key: string): TipoPeca | undefined {
  return TIPOS_PECA.find((t) => t.key === key);
}
