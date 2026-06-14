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
});
