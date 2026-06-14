import "server-only";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createAnthropicClient, STUDIO_MODEL } from "./anthropic";

export const TRIAGE_AREAS = ["trabalhista", "civel", "consumidor", "medico", "outro"] as const;

// Sem .optional()/constraints numéricas — saída estruturada exige campos previsíveis.
export const TriageSchema = z.object({
  area: z.enum(TRIAGE_AREAS),
  natureza: z.string(),
  resumo: z.string(),
  partes: z.object({
    cliente_polo: z.enum(["autor", "reu", "terceiro", "indefinido"]),
    contraparte: z.string(),
  }),
  teses: z.array(
    z.object({
      titulo: z.string(),
      fundamento: z.string(),
    }),
  ),
  tipo_peca_sugerido: z.string(),
  jurisprudence_queries: z.array(z.string()),
  observacoes: z.string(),
});

export type TriageResult = z.infer<typeof TriageSchema>;

const SYSTEM = `Você é advogado(a) triador(a) experiente no escritório Sento-Sé & Advogados Associados (Salvador/BA), que atua em Direito Trabalhista, Cível, do Consumidor e Médico/Saúde.

A partir do relato do cliente (em linguagem leiga), classifique o caso de forma técnica e objetiva, em pt-BR:
- area: a área predominante (use "outro" se não couber nas quatro).
- natureza: a natureza jurídica provável da demanda (ex.: "reclamatória trabalhista", "ação indenizatória").
- resumo: 2 a 4 frases neutras dos fatos relevantes, sem juízo de valor.
- partes: o polo provável do cliente e quem é a contraparte.
- teses: as teses jurídicas cabíveis, cada uma com fundamento legal resumido (artigos/súmulas), do mais forte ao mais fraco.
- tipo_peca_sugerido: a peça inicial mais adequada (ex.: "Petição inicial", "Contestação", "Recurso", "Notificação extrajudicial").
- jurisprudence_queries: 3 a 6 termos de busca úteis para localizar jurisprudência favorável.
- observacoes: ressalvas, dados faltantes ou alertas (prazos, prescrição). Pode ser vazio.

Baseie-se no relato; não invente fatos. Esta é uma triagem inicial — não substitui a análise do advogado.`;

/** Classifica o relato do cliente em uma estrutura validada. Server-only. */
export async function triageStory(story: string): Promise<TriageResult> {
  const client = await createAnthropicClient();
  const message = await client.messages.parse({
    model: STUDIO_MODEL,
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: zodOutputFormat(TriageSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: story }],
  });
  if (!message.parsed_output) {
    throw new Error("A triagem não retornou um resultado estruturado.");
  }
  return message.parsed_output;
}
