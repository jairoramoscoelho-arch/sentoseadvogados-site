import { describe, it, expect } from "vitest";
import { buildDraftSystemPrompt, draftMessages } from "./drafting";
import type { TriageResult } from "./triage";

const triage: TriageResult = {
  area: "civel",
  natureza: "ação indenizatória",
  resumo: "Resumo dos fatos.",
  partes: { cliente_polo: "autor", contraparte: "Empresa X" },
  teses: [{ titulo: "Responsabilidade civil", fundamento: "art. 186 CC" }],
  tipo_peca_sugerido: "Petição inicial",
  jurisprudence_queries: ["dano moral"],
  documentos_necessarios: [],
  observacoes: "",
};

describe("drafting", () => {
  it("system prompt exige HTML e revisão", () => {
    const s = buildDraftSystemPrompt();
    expect(s).toContain("<h2>");
    expect(s.toLowerCase()).toContain("html");
    expect(s.toLowerCase()).toContain("revis");
  });
  it("draftMessages injeta tipo, cliente, contraparte, tese e relato", () => {
    const [msg] = draftMessages(triage, "Cliente Teste", "história do cliente aqui");
    expect(msg.content).toContain("Petição inicial");
    expect(msg.content).toContain("Cliente Teste");
    expect(msg.content).toContain("Empresa X");
    expect(msg.content).toContain("Responsabilidade civil");
    expect(msg.content).toContain("história do cliente aqui");
  });
  it("inicial cível referencia art. 319", () => {
    const [msg] = draftMessages(triage, "C", "h");
    expect(msg.content).toContain("319");
  });
  it("sem estilo, não inclui a seção ESTILO E DOUTRINA", () => {
    const [msg] = draftMessages(triage, "C", "h");
    expect(msg.content).not.toContain("ESTILO E DOUTRINA");
  });
  it("com autor, injeta o nome e a seção de estilo", () => {
    const [msg] = draftMessages(triage, "C", "h", {
      authors: ["Fredie Didier Jr."],
      instruction: null,
    });
    expect(msg.content).toContain("ESTILO E DOUTRINA");
    expect(msg.content).toContain("Fredie Didier Jr.");
    expect(msg.content.toLowerCase()).toContain("doutrina");
  });
  it("com instrução livre, injeta o texto do advogado", () => {
    const [msg] = draftMessages(triage, "C", "h", {
      authors: [],
      instruction: "tom assertivo, ênfase na dignidade",
    });
    expect(msg.content).toContain("ESTILO E DOUTRINA");
    expect(msg.content).toContain("tom assertivo, ênfase na dignidade");
  });
  it("estilo vazio (sem autor e sem instrução) não cria a seção", () => {
    const [msg] = draftMessages(triage, "C", "h", { authors: [], instruction: "" });
    expect(msg.content).not.toContain("ESTILO E DOUTRINA");
  });
  it("tipoOverride troca o tipo da peça e o requisito legal", () => {
    const [msg] = draftMessages(triage, "C", "h", undefined, "Recurso");
    expect(msg.content).toContain("Gere a peça do tipo: Recurso");
    expect(msg.content.toLowerCase()).toContain("recursais");
    expect(msg.content).not.toContain("319");
  });
  it("sem tipoOverride, usa o tipo sugerido pela triagem", () => {
    const [msg] = draftMessages(triage, "C", "h");
    expect(msg.content).toContain("Gere a peça do tipo: Petição inicial");
  });
});
