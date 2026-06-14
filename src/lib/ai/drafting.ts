import "server-only";
import { createAnthropicClient, STUDIO_MODEL } from "./anthropic";
import type { TriageResult } from "./triage";

export interface DraftStyle {
  authors: string[];
  instruction: string | null;
}

function styleSection(style: DraftStyle | undefined): string {
  if (!style) return "";
  const parts: string[] = [];
  if (style.authors.length > 0) {
    parts.push(
      `Inspire-se na VOZ e na DOUTRINA de ${style.authors.join("; ")} — emule o estilo (tom, estrutura, retórica) e, quando pertinente, invoque as teses/posições doutrinárias desse autor como reforço argumentativo, SEM inventar fatos do caso nem citações de que você não tenha certeza.`,
    );
  }
  const instr = style.instruction?.trim();
  if (instr) {
    parts.push(`Instruções de estilo do advogado: ${instr}`);
  }
  return parts.length > 0 ? `\n\nESTILO E DOUTRINA:\n${parts.join("\n")}` : "";
}

export function buildDraftSystemPrompt(): string {
  return `Você é redator(a) forense sênior do escritório Sento-Sé & Advogados Associados (Salvador/BA). Redige peças jurídicas em português jurídico brasileiro, prontas para REVISÃO do advogado.

O que os julgadores valorizam (siga rigorosamente):
- Endereçamento e qualificação corretos das partes.
- DOS FATOS: narrativa clara, cronológica e fiel ao relato — sem inventar fatos.
- DO DIREITO: para cada tese, faça a SUBSUNÇÃO explícita do fato à norma (dispositivo legal/súmula; jurisprudência quando couber).
- DOS PEDIDOS: certos, determinados e coerentes com a causa de pedir; inclua os requerimentos padrão (citação, produção de provas, procedência) e o valor da causa.
- Dados ausentes: marque com [a completar] — NUNCA invente CPF, endereço, número de processo, datas ou valores.

Formato de SAÍDA (obrigatório):
- Responda APENAS com o corpo da peça em HTML semântico, usando somente estas tags: <h2>, <h3>, <p>, <strong>, <em>, <ul>, <ol>, <li>, <blockquote>.
- NÃO use <h1>, <html>, <body>, <style>, classes, atributos, nem cercas de código. NÃO escreva nada fora do HTML.
- <h2> para as seções (ex.: DOS FATOS, DO DIREITO, DOS PEDIDOS); <h3> para cada tese.
- Ao final, inclua um <blockquote> avisando que esta é uma minuta gerada por IA, que pode conter erros (inclusive em citações legais e jurisprudenciais), e que DEVE ser revisada por um advogado antes de qualquer protocolo ou envio.`;
}

function legalRequisite(triage: TriageResult): string {
  const tipo = triage.tipo_peca_sugerido.toLowerCase();
  if (tipo.includes("inicial")) {
    return triage.area === "trabalhista"
      ? "Requisitos da petição/reclamação inicial trabalhista (art. 840 da CLT)."
      : "Requisitos da petição inicial (art. 319 do CPC).";
  }
  if (tipo.includes("contesta") || tipo.includes("defesa")) {
    return "Requisitos da contestação (art. 336 do CPC), com impugnação específica dos fatos.";
  }
  if (tipo.includes("recurso") || tipo.includes("apela") || tipo.includes("agravo")) {
    return "Observar tempestividade, preparo e a fundamentação das razões recursais.";
  }
  return "";
}

export function draftMessages(
  triage: TriageResult,
  clientName: string,
  rawText: string,
  style?: DraftStyle,
): Array<{ role: "user"; content: string }> {
  const teses = triage.teses
    .map((t, i) => `${i + 1}. ${t.titulo} — ${t.fundamento}`)
    .join("\n");
  const requisito = legalRequisite(triage);
  const content = `Gere a peça do tipo: ${triage.tipo_peca_sugerido}.

Cliente: ${clientName} (polo: ${triage.partes.cliente_polo}).
Contraparte: ${triage.partes.contraparte}.
Área: ${triage.area}. Natureza: ${triage.natureza}.
${requisito ? `Requisitos legais a observar: ${requisito}\n` : ""}Resumo dos fatos: ${triage.resumo}

Teses a desenvolver (com a devida fundamentação):
${teses}
${triage.observacoes ? `\nObservações/ressalvas: ${triage.observacoes}` : ""}

RELATO DO CLIENTE (única fonte dos fatos — não invente nada além disto):
"""
${rawText}
"""${styleSection(style)}`;
  return [{ role: "user", content }];
}

/** Inicia a geração da peça em streaming (texto). Server-only. */
export async function streamDraft(
  triage: TriageResult,
  clientName: string,
  rawText: string,
  style?: DraftStyle,
) {
  const anthropic = await createAnthropicClient();
  return anthropic.messages.stream({
    model: STUDIO_MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: buildDraftSystemPrompt(),
    messages: draftMessages(triage, clientName, rawText, style),
  });
}
