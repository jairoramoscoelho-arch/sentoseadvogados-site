import { describe, it, expect } from "vitest";
import { TIPOS_PECA, tipoPecaByKey } from "./tipos";

describe("TIPOS_PECA", () => {
  it("tem os tipos principais", () => {
    const nomes = TIPOS_PECA.map((t) => t.nome);
    expect(nomes).toContain("Petição inicial");
    expect(nomes).toContain("Contestação");
    expect(nomes).toContain("Recurso");
  });

  it("chaves são únicas e não vazias; cada tipo tem nome e descrição", () => {
    const keys = new Set<string>();
    for (const t of TIPOS_PECA) {
      expect(t.key.length).toBeGreaterThan(0);
      expect(keys.has(t.key)).toBe(false);
      keys.add(t.key);
      expect(t.nome.length).toBeGreaterThan(0);
      expect(t.descricao.length).toBeGreaterThan(0);
    }
  });

  it("tipoPecaByKey resolve e devolve undefined p/ chave inexistente", () => {
    expect(tipoPecaByKey("peticao_inicial")?.nome).toBe("Petição inicial");
    expect(tipoPecaByKey("inexistente")).toBeUndefined();
  });
});
