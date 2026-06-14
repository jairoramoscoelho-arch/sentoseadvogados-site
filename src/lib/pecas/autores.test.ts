import { describe, it, expect } from "vitest";
import { autoresPorArea, areasComAutores, AREA_LABEL } from "./autores";

describe("autoresPorArea", () => {
  it("trabalhista inclui juristas conhecidos da área", () => {
    const nomes = autoresPorArea("trabalhista").map((a) => a.nome);
    expect(nomes).toContain("Maurício Godinho Delgado");
    expect(nomes).toContain("Vólia Bomfim Cassar");
  });

  it("consumidor inclui Cláudia Lima Marques", () => {
    const nomes = autoresPorArea("consumidor").map((a) => a.nome);
    expect(nomes).toContain("Cláudia Lima Marques");
  });

  it("'outro' não tem lista curada (só texto livre)", () => {
    expect(autoresPorArea("outro")).toEqual([]);
  });

  it("todo autor tem nome e descrição não vazios", () => {
    for (const area of ["trabalhista", "civel", "consumidor", "medico"] as const) {
      for (const a of autoresPorArea(area)) {
        expect(a.nome.length).toBeGreaterThan(0);
        expect(a.descricao.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("areasComAutores (grupos do modal)", () => {
  it("exclui áreas sem autores (ex.: 'outro')", () => {
    const areas = areasComAutores().map((g) => g.area);
    expect(areas).toContain("trabalhista");
    expect(areas).not.toContain("outro");
  });

  it("cada grupo traz label e autores não vazios", () => {
    for (const g of areasComAutores()) {
      expect(g.label).toBe(AREA_LABEL[g.area]);
      expect(g.autores.length).toBeGreaterThan(0);
    }
  });
});
