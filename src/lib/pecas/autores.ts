import type { TriageArea } from "@/lib/ai/triage";

export interface Autor {
  nome: string;
  descricao: string;
}

/** Juristas brasileiros de referência por área — voz e doutrina que inspiram a peça. */
const AUTORES_POR_AREA: Record<TriageArea, Autor[]> = {
  trabalhista: [
    { nome: "Maurício Godinho Delgado", descricao: "Curso de Direito do Trabalho; ex-ministro do TST." },
    { nome: "Vólia Bomfim Cassar", descricao: "Direito do Trabalho; princípios e relações de emprego." },
    { nome: "Mauro Schiavi", descricao: "Direito Processual do Trabalho." },
    { nome: "Homero Batista Mateus da Silva", descricao: "CLT comentada; doutrina trabalhista aplicada." },
  ],
  civel: [
    { nome: "Fredie Didier Jr.", descricao: "Direito Processual Civil; teoria geral e procedimento." },
    { nome: "Nelson Nery Junior", descricao: "CPC comentado; processo civil." },
    { nome: "Daniel Amorim Assumpção Neves", descricao: "Manual de Direito Processual Civil." },
    { nome: "Cristiano Chaves de Farias", descricao: "Direito Civil; responsabilidade civil e famílias." },
  ],
  consumidor: [
    { nome: "Cláudia Lima Marques", descricao: "CDC; teoria das relações de consumo." },
    { nome: "Rizzatto Nunes", descricao: "Curso de Direito do Consumidor." },
    { nome: "Bruno Miragem", descricao: "Direito do Consumidor; responsabilidade nas relações de consumo." },
    { nome: "Herman Benjamin", descricao: "CDC comentado pelos autores do anteprojeto; ministro do STJ." },
  ],
  medico: [
    { nome: "Miguel Kfouri Neto", descricao: "Responsabilidade civil do médico; erro médico." },
    { nome: "Genival Veloso de França", descricao: "Direito Médico e Medicina Legal." },
    { nome: "Rui Stoco", descricao: "Tratado de Responsabilidade Civil." },
  ],
  outro: [],
};

export const AREA_LABEL: Record<TriageArea, string> = {
  trabalhista: "Trabalhista",
  civel: "Cível",
  consumidor: "Consumidor",
  medico: "Médico / Saúde",
  outro: "Outras áreas",
};

export function autoresPorArea(area: TriageArea): Autor[] {
  return AUTORES_POR_AREA[area] ?? [];
}

/** Grupos (área → autores) para o accordion do modal; ignora áreas sem autores. */
export function areasComAutores(): Array<{
  area: TriageArea;
  label: string;
  autores: Autor[];
}> {
  return (Object.keys(AUTORES_POR_AREA) as TriageArea[])
    .filter((a) => AUTORES_POR_AREA[a].length > 0)
    .map((a) => ({ area: a, label: AREA_LABEL[a], autores: AUTORES_POR_AREA[a] }));
}
