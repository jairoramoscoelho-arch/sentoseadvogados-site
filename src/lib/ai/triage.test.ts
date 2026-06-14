import { describe, it, expect } from "vitest";
import { TriageSchema } from "./triage";

const valid = {
  area: "consumidor",
  natureza: "ação indenizatória por dano material e moral",
  resumo: "Cliente teve voo cancelado e sofreu prejuízos.",
  partes: { cliente_polo: "autor", contraparte: "companhia aérea X" },
  teses: [{ titulo: "Falha na prestação do serviço", fundamento: "art. 14 CDC" }],
  tipo_peca_sugerido: "Petição inicial",
  jurisprudence_queries: ["cancelamento de voo dano moral", "responsabilidade objetiva CDC transporte aéreo"],
  observacoes: "",
};

describe("TriageSchema", () => {
  it("valida um resultado completo", () => {
    expect(TriageSchema.parse(valid)).toMatchObject({ area: "consumidor" });
  });
  it("rejeita area fora do enum", () => {
    expect(() => TriageSchema.parse({ ...valid, area: "tributario" })).toThrow();
  });
  it("rejeita quando falta um campo obrigatório", () => {
    const incompleto: Record<string, unknown> = { ...valid };
    delete incompleto.resumo;
    expect(() => TriageSchema.parse(incompleto)).toThrow();
  });
});
