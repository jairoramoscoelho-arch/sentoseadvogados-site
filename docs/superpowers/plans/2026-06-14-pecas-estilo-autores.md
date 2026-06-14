# Estúdio de Peças — Parte B.1: Estilo (autor renomado **ou** texto livre) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Na tela que precede a geração da peça, o advogado escolhe **um único** autor renomado da área (voz + doutrina inspiram a peça), apresentado num **modal com accordion por área**, **OU** escreve instruções livres — nunca os dois ao mesmo tempo. A escolha é gravada na peça e injetada no prompt de geração.

**Architecture:** Um componente client (`EstiloPeca`) controla o estado com **exclusão mútua**: escolher um autor desabilita/limpa o campo livre, e ter texto livre desabilita o botão de escolher autor. Os autores aparecem num `<dialog>` nativo com accordion por área (single-select). A escolha vira inputs ocultos de um `<form>` (o de "Gerar peça"), é persistida em `legal_drafts` (`style_authors text[]` com 0 ou 1 item, `style_instruction text`), lida pela rota de geração e passada a `streamDraft`. O prompt do redator ganha uma seção "ESTILO E DOUTRINA" no conteúdo do usuário (o system prompt não muda).

**Tech Stack:** Next.js 16 (App Router, Server Actions, Route Handlers), React 19 (useState, useFormStatus), Supabase (Postgres + RLS), Anthropic SDK (`messages.stream`, Opus 4.8), Zod, Vitest, Tailwind v4 (`<dialog>` nativo centralizado, `has-[:checked]`/accordion).

**Decisão do cliente:** "Estilo + doutrina" — a IA emula a voz do autor E pode invocar suas teses/posições doutrinárias como reforço, sem inventar fatos do caso. Addendum obrigatório: **modal + accordion**, **um único autor**, **exclusão mútua autor ⇄ texto livre**.

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `supabase/migrations/0007_draft_style.sql` | Colunas de estilo em `legal_drafts` | Criar |
| `src/types/db.ts` | `LegalDraft` ganha `style_authors`/`style_instruction` | Modificar |
| `src/lib/data/drafts.ts` | `DRAFT_COLS` inclui as colunas novas | Modificar |
| `src/lib/ai/triage.ts` | Exportar `TriageArea` | Modificar |
| `src/lib/pecas/autores.ts` | Autores por área + `autoresPorArea()` + `AREA_LABEL` + `areasComAutores()` | Criar |
| `src/lib/pecas/autores.test.ts` | Testa resolução por área e o agrupamento do modal | Criar |
| `src/lib/ai/drafting.ts` | `DraftStyle` + `styleSection()` + 4º parâmetro `style` | Modificar |
| `src/lib/ai/drafting.test.ts` | Testa a injeção do estilo no prompt | Modificar |
| `src/app/dashboard/pecas/actions.ts` | `createDraftFromIntake` captura/grava estilo (exclusão mútua no servidor) | Modificar |
| `src/components/pecas/EstiloPeca.tsx` | Picker: modal+accordion (1 autor) ⇄ texto livre | Criar |
| `src/components/pecas/GenerateDraftButton.tsx` | Form de gerar compõe `EstiloPeca` | Modificar |
| `src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx` | Passa `area` ao botão | Modificar |
| `src/components/pecas/IntakeStudio.tsx` | Passa `area` ao botão (modo edição) | Modificar |
| `src/app/api/drafts/[id]/generate/route.ts` | Lê o estilo da peça e passa a `streamDraft` | Modificar |

---

## Task 1: Migração — colunas de estilo em `legal_drafts`

**Files:**
- Create: `supabase/migrations/0007_draft_style.sql`
- Modify: `src/types/db.ts` (interface `LegalDraft`, após `style_id`)
- Modify: `src/lib/data/drafts.ts` (`DRAFT_COLS`)

- [ ] **Step 1: Escrever a migração**

Create `supabase/migrations/0007_draft_style.sql`:

```sql
-- =====================================================================
-- Sprint 1D — estilo da peça: UM autor renomado (voz + doutrina) OU
-- instruções livres do advogado, capturados antes da geração.
-- =====================================================================
alter table public.legal_drafts
  add column if not exists style_authors     text[] not null default '{}',
  add column if not exists style_instruction text;
```

- [ ] **Step 2: Aplicar a migração**

Run: `npm run db:migrate`
Expected: `Aplicando 0007_draft_style.sql... ok` e `Migrações em dia.`

- [ ] **Step 3: Atualizar o tipo `LegalDraft`**

In `src/types/db.ts`, dentro de `interface LegalDraft`, logo após a linha `style_id: string | null;`, adicionar:

```ts
  style_authors: string[];
  style_instruction: string | null;
```

- [ ] **Step 4: Incluir as colunas no select**

In `src/lib/data/drafts.ts`, substituir a constante `DRAFT_COLS` por:

```ts
const DRAFT_COLS =
  "id, client_id, case_id, intake_id, template_id, title, status, content_html, model_used, style_id, style_authors, style_instruction, created_by, assigned_to, created_at, updated_at, deleted_at";
```

- [ ] **Step 5: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0007_draft_style.sql src/types/db.ts src/lib/data/drafts.ts
git commit -m "feat(pecas): colunas style_authors/style_instruction em legal_drafts (0007)"
```

---

## Task 2: Config de autores por área (+ agrupamento p/ o modal)

**Files:**
- Modify: `src/lib/ai/triage.ts` (exportar `TriageArea`)
- Create: `src/lib/pecas/autores.ts`
- Test: `src/lib/pecas/autores.test.ts`

- [ ] **Step 1: Exportar o tipo da área**

In `src/lib/ai/triage.ts`, logo após a linha `export const TRIAGE_AREAS = [...] as const;`, adicionar:

```ts
export type TriageArea = (typeof TRIAGE_AREAS)[number];
```

- [ ] **Step 2: Escrever o teste (que falha)**

Create `src/lib/pecas/autores.test.ts`:

```ts
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
```

- [ ] **Step 3: Rodar o teste e ver falhar**

Run: `npx vitest run src/lib/pecas/autores.test.ts`
Expected: FAIL — `Failed to resolve import "./autores"`.

- [ ] **Step 4: Implementar a config**

Create `src/lib/pecas/autores.ts`:

```ts
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
```

- [ ] **Step 5: Rodar o teste e ver passar**

Run: `npx vitest run src/lib/pecas/autores.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 6: Commit**

```bash
git add src/lib/ai/triage.ts src/lib/pecas/autores.ts src/lib/pecas/autores.test.ts
git commit -m "feat(pecas): autores por área + grupos para o modal accordion"
```

---

## Task 3: Injeção do estilo no prompt de geração

**Files:**
- Modify: `src/lib/ai/drafting.ts` (`draftMessages`, `streamDraft`)
- Test: `src/lib/ai/drafting.test.ts`

- [ ] **Step 1: Escrever os testes (que falham)**

Substituir o conteúdo inteiro de `src/lib/ai/drafting.test.ts` por:

```ts
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
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/ai/drafting.test.ts`
Expected: FAIL — `draftMessages` ainda não aceita o 4º argumento / não há seção "ESTILO E DOUTRINA".

- [ ] **Step 3: Implementar `DraftStyle` + `styleSection` e o 4º parâmetro**

In `src/lib/ai/drafting.ts`:

(a) Logo após o import de topo (`import type { TriageResult } from "./triage";`), adicionar:

```ts
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
```

(b) Trocar a assinatura e o `return` de `draftMessages`:

```ts
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
```

(c) Trocar a assinatura e a chamada de `streamDraft`:

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/ai/drafting.test.ts`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/drafting.ts src/lib/ai/drafting.test.ts
git commit -m "feat(pecas): estilo (autor ou texto livre) injetado no prompt do redator"
```

---

## Task 4: `createDraftFromIntake` captura e grava o estilo

**Files:**
- Modify: `src/app/dashboard/pecas/actions.ts` (`createSchema`, `createDraftFromIntake`)

- [ ] **Step 1: Ampliar o schema de criação**

In `src/app/dashboard/pecas/actions.ts`, substituir `const createSchema = z.object({ intakeId: z.string().uuid() });` por:

```ts
const createSchema = z.object({
  intakeId: z.string().uuid(),
  styleAuthors: z.array(z.string()).default([]),
  styleInstruction: z.string().max(2000).optional(),
});
```

- [ ] **Step 2: Ler os campos do FormData**

In `createDraftFromIntake`, substituir:

```ts
  const parsed = createSchema.safeParse({ intakeId: formData.get("intakeId") });
```

por:

```ts
  const parsed = createSchema.safeParse({
    intakeId: formData.get("intakeId"),
    styleAuthors: formData.getAll("styleAuthors").map((v) => String(v)),
    styleInstruction: (formData.get("styleInstruction") as string) || undefined,
  });
```

- [ ] **Step 3: Gravar o estilo na peça (exclusão mútua no servidor)**

In `createDraftFromIntake`, no objeto de `.insert({ ... })`, logo após `intake_id: intake.id,`, adicionar:

```ts
      style_authors: parsed.data.styleAuthors,
      style_instruction:
        parsed.data.styleAuthors.length > 0
          ? null
          : parsed.data.styleInstruction ?? null,
```

- [ ] **Step 4: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/pecas/actions.ts
git commit -m "feat(pecas): grava o estilo (autor ou texto) na criação da peça"
```

---

## Task 5: Componente `EstiloPeca` — modal accordion (1 autor) ⇄ texto livre

**Files:**
- Create: `src/components/pecas/EstiloPeca.tsx`

- [ ] **Step 1: Criar o componente**

Create `src/components/pecas/EstiloPeca.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { ChevronDown, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { areasComAutores } from "@/lib/pecas/autores";
import type { TriageArea } from "@/lib/ai/triage";

const groups = areasComAutores();

/**
 * Escolha de estilo da peça (opcional), com EXCLUSÃO MÚTUA:
 * — OU um único autor de referência (voz + doutrina), escolhido num modal
 *   com accordion por área;
 * — OU instruções livres no campo de texto.
 * Nunca os dois ao mesmo tempo. Emite inputs ocultos lidos por createDraftFromIntake.
 */
export function EstiloPeca({ area }: { area?: TriageArea }) {
  const [author, setAuthor] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openArea, setOpenArea] = useState<TriageArea | null>(
    area && groups.some((g) => g.area === area) ? area : groups[0]?.area ?? null,
  );

  const hasText = instruction.trim().length > 0;
  const openModal = () => dialogRef.current?.showModal();
  const closeModal = () => dialogRef.current?.close();

  const pick = (nome: string) => {
    setAuthor(nome);
    setInstruction("");
    closeModal();
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-serif text-lg font-semibold text-ink">
        Estilo da peça{" "}
        <span className="text-sm font-normal text-muted">(opcional)</span>
      </legend>
      <p className="text-sm text-muted">
        Escolha <strong>um</strong> autor de referência (a IA segue a voz e pode
        citar a doutrina dele — revise as citações) <em>ou</em> escreva instruções
        livres. Apenas uma das opções.
      </p>

      {/* O que o form envia quando há autor escolhido. */}
      {author && <input type="hidden" name="styleAuthors" value={author} />}

      {/* Opção A — autor */}
      <div>
        {author ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-green-700/40 bg-green-50/60 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-green-700" aria-hidden="true" />
              <span className="font-medium text-ink">{author}</span>
            </span>
            <button
              type="button"
              onClick={() => setAuthor(null)}
              className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium text-muted transition-colors hover:bg-cloud hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openModal}
            disabled={hasText}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-green-700 transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Escolher autor de referência
          </button>
        )}
        {hasText && !author && (
          <p className="mt-1.5 text-xs text-muted">
            Apague as instruções livres para escolher um autor.
          </p>
        )}
      </div>

      {/* divisor */}
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted/70">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Opção B — texto livre */}
      <div>
        <textarea
          name="styleInstruction"
          rows={3}
          maxLength={2000}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={author !== null}
          placeholder="Ex.: tom assertivo, ênfase na dignidade da pessoa humana, explorar a tese da perda de uma chance…"
          className="w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:border-green-700/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-cloud/50 disabled:opacity-60"
        />
        {author && (
          <p className="mt-1.5 text-xs text-muted">
            Remova o autor para escrever instruções livres.
          </p>
        )}
      </div>

      {/* Modal com accordion por área (single-select) */}
      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal();
        }}
        className={cn(
          "w-full max-w-none bg-paper p-0 text-ink shadow-lift backdrop:bg-green-900/40",
          "fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] overflow-auto rounded-t-2xl",
          "sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[85dvh] sm:w-[min(560px,92vw)] sm:rounded-2xl",
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-5 py-4">
          <p className="font-serif text-lg font-semibold text-ink">
            Autor de referência
          </p>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Fechar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-cloud hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col gap-2 p-4">
          {groups.map((g) => {
            const isOpen = openArea === g.area;
            return (
              <div
                key={g.area}
                className="overflow-hidden rounded-xl border border-line"
              >
                <button
                  type="button"
                  onClick={() => setOpenArea(isOpen ? null : g.area)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 bg-cloud/40 px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-cloud"
                >
                  {g.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform duration-200 [transition-timing-function:var(--ease-out-expo)]",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <ul className="flex flex-col divide-y divide-line">
                    {g.autores.map((a) => (
                      <li key={a.nome}>
                        <button
                          type="button"
                          onClick={() => pick(a.nome)}
                          className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-green-50/60"
                        >
                          <span className="text-sm font-medium text-ink">
                            {a.nome}
                          </span>
                          <span className="text-xs text-muted">{a.descricao}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </dialog>
    </fieldset>
  );
}
```

- [ ] **Step 2: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 3: Commit**

```bash
git add src/components/pecas/EstiloPeca.tsx
git commit -m "feat(pecas): EstiloPeca — modal accordion de 1 autor com exclusão mútua"
```

---

## Task 6: `GenerateDraftButton` compõe `EstiloPeca`

**Files:**
- Modify: `src/components/pecas/GenerateDraftButton.tsx` (arquivo inteiro)

- [ ] **Step 1: Reescrever o botão para usar o picker**

Replace o conteúdo inteiro de `src/components/pecas/GenerateDraftButton.tsx` por:

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createDraftFromIntake } from "@/app/dashboard/pecas/actions";
import { EstiloPeca } from "./EstiloPeca";
import type { TriageArea } from "@/lib/ai/triage";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-medium text-green-900 transition-colors hover:bg-gold-600 disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? "Criando peça…" : "Gerar peça"}
    </button>
  );
}

/** Cria a peça a partir do relato (intake), com estilo opcional, e leva ao editor. */
export function GenerateDraftButton({
  intakeId,
  area,
}: {
  intakeId: string;
  area?: TriageArea;
}) {
  return (
    <form
      action={createDraftFromIntake}
      className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft"
    >
      <input type="hidden" name="intakeId" value={intakeId} />
      <EstiloPeca area={area} />
      <Submit />
    </form>
  );
}
```

- [ ] **Step 2: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0). (`area` é opcional; os usos atuais sem `area` continuam compilando até a Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/components/pecas/GenerateDraftButton.tsx
git commit -m "feat(pecas): Gerar peça compõe o picker de estilo EstiloPeca"
```

---

## Task 7: Passar a área ao botão (relato e estúdio)

**Files:**
- Modify: `src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx` (bloco do `GenerateDraftButton`)
- Modify: `src/components/pecas/IntakeStudio.tsx` (uso do `GenerateDraftButton` no modo edição)

- [ ] **Step 1: Relato — passar `t?.area`**

In `src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx`, substituir:

```tsx
      <div className="mt-6">
        <GenerateDraftButton intakeId={intake.id} />
      </div>
```

por:

```tsx
      <div className="mt-6">
        <GenerateDraftButton intakeId={intake.id} area={t?.area} />
      </div>
```

- [ ] **Step 2: Estúdio (modo edição) — passar `result.area`**

In `src/components/pecas/IntakeStudio.tsx`, no ramo `mode === "edit"`, substituir:

```tsx
                <GenerateDraftButton intakeId={id} />
```

por:

```tsx
                <GenerateDraftButton intakeId={id} area={result.area} />
```

- [ ] **Step 3: Verificar lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros; build conclui; rota `/dashboard/clientes/[id]/relato/[intakeId]` presente.

- [ ] **Step 4: Commit**

```bash
git add "src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx" src/components/pecas/IntakeStudio.tsx
git commit -m "feat(pecas): área da triagem abre o accordion na área certa"
```

---

## Task 8: Rota de geração consome o estilo da peça

**Files:**
- Modify: `src/app/api/drafts/[id]/generate/route.ts` (bloco do `streamDraft`)

- [ ] **Step 1: Montar o `DraftStyle` e passar a `streamDraft`**

In `src/app/api/drafts/[id]/generate/route.ts`, substituir:

```ts
  const client = await getClient(draft.client_id);

  let messageStream;
  try {
    messageStream = await streamDraft(
      triage.data,
      client?.name ?? "o cliente",
      intake.raw_text ?? "",
    );
  } catch (e) {
```

por:

```ts
  const client = await getClient(draft.client_id);

  const style = {
    authors: draft.style_authors ?? [],
    instruction: draft.style_instruction,
  };

  let messageStream;
  try {
    messageStream = await streamDraft(
      triage.data,
      client?.name ?? "o cliente",
      intake.raw_text ?? "",
      style,
    );
  } catch (e) {
```

- [ ] **Step 2: Verificar lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros; build conclui.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/drafts/[id]/generate/route.ts"
git commit -m "feat(pecas): geração usa o estilo (autor/instrução) gravado na peça"
```

---

## Task 9: Verificação end-to-end + merge

**Files:** nenhum (verificação).

- [ ] **Step 1: Suíte completa**

Run: `npx vitest run`
Expected: todos verdes (13 anteriores + 6 de autores + 4 novos de drafting = ~23 testes).

Run: `npm run lint && npm run build`
Expected: 0 erros; build conclui.

- [ ] **Step 2: Teste manual (contra a API real)**

1. Em `/dashboard/triagens` → "Nova triagem": escolha um cliente, escreva um relato trabalhista, rode a triagem e salve.
2. Abra a triagem (`/dashboard/clientes/[id]/relato/[intakeId]`). Confirme o bloco **"Estilo da peça (opcional)"**.
3. Clique **"Escolher autor de referência"** → abre o **modal**; confirme o **accordion por área** com a área da triagem (Trabalhista) já aberta. Escolha **um** autor → o modal fecha, aparece o chip do autor e a **textarea fica desabilitada**.
4. Clique **"Remover"** no chip → a textarea reabilita. Digite um texto → o botão **"Escolher autor" fica desabilitado** (exclusão mútua nos dois sentidos).
5. Com um autor escolhido (ou texto), clique **"Gerar peça"**. No editor, confirme a geração e que o tom reflete a escolha.
6. Confirme no banco que `legal_drafts` tem `style_authors` **ou** `style_instruction` (nunca os dois).
7. Repita sem escolher nada → a geração continua funcionando.

- [ ] **Step 3: Merge para produção**

```bash
git checkout main
git merge --no-ff feat/dashboard-advogados -m "Merge: estilo de peças (autor renomado ou texto livre)"
git push origin main
git checkout feat/dashboard-advogados
```

(Guard de segredos: `git diff --cached --name-only | grep -i env` deve ser vazio.)

---

## Self-Review

**Spec coverage (item #4 + addendum):**
- "autores renomados da área para marcar" → Task 2 (config/grupos) + Task 5 (modal accordion) + Task 7 (área certa aberta). ✓
- "modal accordeon" → `<dialog>` nativo + accordion por área (`areasComAutores`) na Task 5. ✓
- "só pode escolher um" → `author: string | null` single-select; `pick()` substitui; `style_authors` com 0/1 item. ✓
- "se escolher autor não pode escrever no box e vice-versa" → textarea `disabled={author !== null}` (não submete) + botão `disabled={hasText}`; servidor zera `style_instruction` quando há autor (Task 4 Step 3). ✓
- "texto livre influencia a peça" → `name="styleInstruction"` → captura (Task 4) → injeção (Task 3). ✓
- "estilo + doutrina" → `styleSection` instrui emular voz E invocar doutrina, sem inventar fatos. ✓
- Persistência p/ re-geração → colunas (Task 1) lidas pela rota (Task 8). ✓

**Placeholder scan:** sem "TBD"/"TODO"/genéricos — cada passo traz o código completo. ✓

**Type consistency:**
- `DraftStyle { authors: string[]; instruction: string | null }` — Task 3 (def) e Task 8 (montagem a partir de `draft.style_authors`/`draft.style_instruction`, colunas/typo da Task 1). ✓
- `areasComAutores(): { area: TriageArea; label: string; autores: Autor[] }[]` — Task 2 (def/teste) e Task 5 (uso `groups`). ✓
- `AREA_LABEL: Record<TriageArea,string>` — Task 2; usado em `areasComAutores`. ✓
- `EstiloPeca({ area?: TriageArea })` — Task 5 (def) e Task 6 (uso); `GenerateDraftButton({ intakeId, area? })` — Task 6 (def) e Task 7 (`t?.area` / `result.area`). ✓
- Form ⇄ action: `name="styleAuthors"` (oculto, 0/1) ↔ `getAll("styleAuthors")`; `name="styleInstruction"` (textarea) ↔ `get("styleInstruction")`. ✓

---

## Próximos planos (restante da Parte B)

- **B.2 — Galeria de tipos + wizard** (`/dashboard/pecas/nova` reformulado): tipo → cliente → contexto (reusar triagem / nova história) → estilo (reusa `EstiloPeca`) → gerar; generaliza `createDraftFromIntake`.
- **B.3 — Geração a partir de documento (Claude-PDF nativo)**: bucket `peca-anexos`, upload, `documents?` em `draftMessages`/`streamDraft`, rota envia o PDF ao Claude. Habilita Recurso/Contestação a partir do PDF. Sem docling.
