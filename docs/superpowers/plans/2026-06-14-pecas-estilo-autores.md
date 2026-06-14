# Estúdio de Peças — Parte B.1: Estilo (autores renomados + texto livre) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Na tela que precede a geração da peça, o advogado escolhe autores renomados da área (cuja voz **e doutrina** inspiram a peça) e/ou escreve instruções livres; essa escolha é gravada na peça e injetada no prompt de geração.

**Architecture:** A seleção de estilo é capturada por um `<form>` já existente (o de "Gerar peça"), persistida em duas novas colunas de `legal_drafts` (`style_authors text[]`, `style_instruction text`), e lida pela rota de geração, que a passa para `streamDraft`. O prompt do redator ganha uma seção "ESTILO E DOUTRINA" no conteúdo do usuário (o system prompt não muda). Autores ficam numa config estática por área (`src/lib/pecas/autores.ts`) — juristas brasileiros conhecidos, sem upload (o upload de peças próprias é a Sprint 6).

**Tech Stack:** Next.js 16 (App Router, Server Actions, Route Handlers), React 19, Supabase (Postgres + RLS), Anthropic SDK (`messages.stream`, Opus 4.8), Zod, Vitest, Tailwind v4.

**Decisão do cliente (13/06):** "Estilo + doutrina" — a IA emula a voz do autor E pode invocar suas teses/posições doutrinárias como reforço, sem inventar fatos do caso (revisão do advogado obrigatória, como já avisa o `<blockquote>` da minuta).

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `supabase/migrations/0007_draft_style.sql` | Colunas de estilo em `legal_drafts` | Criar |
| `src/types/db.ts` | Tipo `LegalDraft` ganha `style_authors`/`style_instruction` | Modificar |
| `src/lib/data/drafts.ts` | `DRAFT_COLS` inclui as colunas novas | Modificar |
| `src/lib/ai/triage.ts` | Exportar `TriageArea` (tipo da área) | Modificar |
| `src/lib/pecas/autores.ts` | Config estática de autores por área + `autoresPorArea()` | Criar |
| `src/lib/pecas/autores.test.ts` | Testa a resolução de autores por área | Criar |
| `src/lib/ai/drafting.ts` | `DraftStyle` + `styleSection()` + 4º parâmetro `style` em `draftMessages`/`streamDraft` | Modificar |
| `src/lib/ai/drafting.test.ts` | Testa a injeção do estilo no prompt | Modificar |
| `src/app/dashboard/pecas/actions.ts` | `createDraftFromIntake` captura e grava o estilo | Modificar |
| `src/components/pecas/GenerateDraftButton.tsx` | Campos de estilo (checkboxes + texto livre) no form de gerar | Modificar |
| `src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx` | Passa `area` ao botão | Modificar |
| `src/components/pecas/IntakeStudio.tsx` | Passa `area` ao botão (modo edição) | Modificar |
| `src/app/api/drafts/[id]/generate/route.ts` | Lê o estilo da peça e passa a `streamDraft` | Modificar |

---

## Task 1: Migração — colunas de estilo em `legal_drafts`

**Files:**
- Create: `supabase/migrations/0007_draft_style.sql`
- Modify: `src/types/db.ts:51-66` (interface `LegalDraft`)
- Modify: `src/lib/data/drafts.ts:5-6` (`DRAFT_COLS`)

- [ ] **Step 1: Escrever a migração**

Create `supabase/migrations/0007_draft_style.sql`:

```sql
-- =====================================================================
-- Sprint 1D — estilo da peça: autores renomados (voz + doutrina) e/ou
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

- [ ] **Step 5: Verificar tipos e lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0007_draft_style.sql src/types/db.ts src/lib/data/drafts.ts
git commit -m "feat(pecas): colunas style_authors/style_instruction em legal_drafts (0007)"
```

---

## Task 2: Config de autores por área

**Files:**
- Modify: `src/lib/ai/triage.ts:6` (exportar `TriageArea`)
- Create: `src/lib/pecas/autores.ts`
- Test: `src/lib/pecas/autores.test.ts`

- [ ] **Step 1: Exportar o tipo da área**

In `src/lib/ai/triage.ts`, logo após a linha que define `TRIAGE_AREAS` (`export const TRIAGE_AREAS = [...] as const;`), adicionar:

```ts
export type TriageArea = (typeof TRIAGE_AREAS)[number];
```

- [ ] **Step 2: Escrever o teste (que falha)**

Create `src/lib/pecas/autores.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { autoresPorArea } from "./autores";

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

export function autoresPorArea(area: TriageArea): Autor[] {
  return AUTORES_POR_AREA[area] ?? [];
}
```

- [ ] **Step 5: Rodar o teste e ver passar**

Run: `npx vitest run src/lib/pecas/autores.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 6: Commit**

```bash
git add src/lib/ai/triage.ts src/lib/pecas/autores.ts src/lib/pecas/autores.test.ts
git commit -m "feat(pecas): config de autores por área + TriageArea"
```

---

## Task 3: Injeção do estilo no prompt de geração

**Files:**
- Modify: `src/lib/ai/drafting.ts:38-80` (`draftMessages`, `streamDraft`)
- Test: `src/lib/ai/drafting.test.ts`

- [ ] **Step 1: Escrever os testes (que falham)**

In `src/lib/ai/drafting.test.ts`, substituir o import da primeira linha e o objeto `triage`, e acrescentar testes de estilo. O arquivo inteiro passa a ser:

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
  it("com autores, injeta os nomes e a seção de estilo", () => {
    const [msg] = draftMessages(triage, "C", "h", {
      authors: ["Fredie Didier Jr.", "Nelson Nery Junior"],
      instruction: null,
    });
    expect(msg.content).toContain("ESTILO E DOUTRINA");
    expect(msg.content).toContain("Fredie Didier Jr.");
    expect(msg.content).toContain("Nelson Nery Junior");
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
  it("estilo vazio (sem autores e sem instrução) não cria a seção", () => {
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

(a) Logo após o import de topo (`import type { TriageResult } from "./triage";`), adicionar o tipo e o helper:

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
      `Inspire-se na VOZ e na DOUTRINA destes autores — emule o estilo (tom, estrutura, retórica) e, quando pertinente, invoque as teses/posições doutrinárias deles como reforço argumentativo, SEM inventar fatos do caso nem citações que você não tenha certeza: ${style.authors.join("; ")}.`,
    );
  }
  const instr = style.instruction?.trim();
  if (instr) {
    parts.push(`Instruções de estilo do advogado: ${instr}`);
  }
  return parts.length > 0 ? `\n\nESTILO E DOUTRINA:\n${parts.join("\n")}` : "";
}
```

(b) Trocar a assinatura e o `return` de `draftMessages` para receber e anexar o estilo:

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
git commit -m "feat(pecas): estilo (autores + texto livre) injetado no prompt do redator"
```

---

## Task 4: `createDraftFromIntake` captura e grava o estilo

**Files:**
- Modify: `src/app/dashboard/pecas/actions.ts:13-44`

- [ ] **Step 1: Ampliar o schema de criação**

In `src/app/dashboard/pecas/actions.ts`, substituir a linha `const createSchema = z.object({ intakeId: z.string().uuid() });` por:

```ts
const createSchema = z.object({
  intakeId: z.string().uuid(),
  styleAuthors: z.array(z.string()).default([]),
  styleInstruction: z.string().max(2000).optional(),
});
```

- [ ] **Step 2: Ler os campos do FormData**

In `createDraftFromIntake`, substituir a linha do `safeParse`:

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

- [ ] **Step 3: Gravar o estilo na peça**

In `createDraftFromIntake`, no objeto passado a `.insert({ ... })`, logo após a linha `intake_id: intake.id,`, adicionar:

```ts
      style_authors: parsed.data.styleAuthors,
      style_instruction: parsed.data.styleInstruction ?? null,
```

- [ ] **Step 4: Verificar tipos e lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/pecas/actions.ts
git commit -m "feat(pecas): grava o estilo escolhido na criação da peça"
```

---

## Task 5: Campos de estilo no botão "Gerar peça"

**Files:**
- Modify: `src/components/pecas/GenerateDraftButton.tsx` (arquivo inteiro)

- [ ] **Step 1: Reescrever o componente com os campos de estilo**

Replace o conteúdo inteiro de `src/components/pecas/GenerateDraftButton.tsx` por:

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createDraftFromIntake } from "@/app/dashboard/pecas/actions";
import { autoresPorArea } from "@/lib/pecas/autores";
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

/**
 * Cria a peça a partir do relato (intake) e leva ao editor para gerar.
 * Quando a área é conhecida, oferece autores renomados (voz + doutrina) e um
 * campo livre que influenciam o estilo da peça — opcional.
 */
export function GenerateDraftButton({
  intakeId,
  area,
}: {
  intakeId: string;
  area?: TriageArea;
}) {
  const autores = area ? autoresPorArea(area) : [];
  const temEstilo = area !== undefined;

  return (
    <form
      action={createDraftFromIntake}
      className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft"
    >
      <input type="hidden" name="intakeId" value={intakeId} />

      {temEstilo && (
        <fieldset className="flex flex-col gap-3">
          <legend className="font-serif text-lg font-semibold text-ink">
            Estilo da peça <span className="text-sm font-normal text-muted">(opcional)</span>
          </legend>
          <p className="text-sm text-muted">
            Marque autores cuja voz e doutrina devem inspirar a peça e/ou escreva
            instruções livres. A IA segue o estilo e pode citar a doutrina deles —
            revise as citações antes de usar.
          </p>

          {autores.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {autores.map((a) => (
                <label
                  key={a.nome}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line p-3 text-sm transition-colors hover:border-green-700/30 has-[:checked]:border-green-700/50 has-[:checked]:bg-green-50/60"
                >
                  <input
                    type="checkbox"
                    name="styleAuthors"
                    value={a.nome}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-green-700"
                  />
                  <span>
                    <span className="font-medium text-ink">{a.nome}</span>
                    <span className="block text-xs text-muted">{a.descricao}</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          <textarea
            name="styleInstruction"
            rows={3}
            maxLength={2000}
            placeholder="Ex.: tom assertivo, ênfase na dignidade da pessoa humana, explorar a tese da perda de uma chance…"
            className="w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:border-green-700/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1"
          />
        </fieldset>
      )}

      <Submit />
    </form>
  );
}
```

- [ ] **Step 2: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0). (O componente ainda é usado com a antiga assinatura em dois lugares — `area` é opcional, então compila; a Task 6 passa a área.)

- [ ] **Step 3: Commit**

```bash
git add src/components/pecas/GenerateDraftButton.tsx
git commit -m "feat(pecas): campos de estilo (autores + texto livre) no Gerar peça"
```

---

## Task 6: Passar a área ao botão (relato e estúdio)

**Files:**
- Modify: `src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx:137-139`
- Modify: `src/components/pecas/IntakeStudio.tsx:233`

- [ ] **Step 1: Relato — passar `t?.area`**

In `src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx`, substituir o bloco:

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

(`t` é `TriageResult | null`; se não houver triagem, `area` fica `undefined` e o bloco de estilo some — comportamento desejado.)

- [ ] **Step 2: Estúdio (modo edição) — passar `result.area`**

In `src/components/pecas/IntakeStudio.tsx`, no ramo `mode === "edit"`, substituir:

```tsx
                <GenerateDraftButton intakeId={id} />
```

por:

```tsx
                <GenerateDraftButton intakeId={id} area={result.area} />
```

(Dentro do bloco `{result && (...)}`, `result` é `TriageResult` não-nulo, logo `result.area` é seguro.)

- [ ] **Step 3: Verificar lint e build**

Run: `npm run lint`
Expected: sem erros.

Run: `npm run build`
Expected: build conclui; rota `/dashboard/clientes/[id]/relato/[intakeId]` presente.

- [ ] **Step 4: Commit**

```bash
git add "src/app/dashboard/clientes/[id]/relato/[intakeId]/page.tsx" src/components/pecas/IntakeStudio.tsx
git commit -m "feat(pecas): área da triagem alimenta os autores sugeridos"
```

---

## Task 7: Rota de geração consome o estilo da peça

**Files:**
- Modify: `src/app/api/drafts/[id]/generate/route.ts:30-44`

- [ ] **Step 1: Montar o `DraftStyle` e passar a `streamDraft`**

In `src/app/api/drafts/[id]/generate/route.ts`, substituir o bloco:

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

- [ ] **Step 2: Verificar tipos, lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros; build conclui.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/drafts/[id]/generate/route.ts"
git commit -m "feat(pecas): geração usa o estilo (autores + instrução) gravado na peça"
```

---

## Task 8: Verificação end-to-end + merge

**Files:** nenhum (verificação).

- [ ] **Step 1: Suíte completa**

Run: `npx vitest run`
Expected: todos verdes (13 anteriores + 4 de autores + 4 novos de drafting = ~21 testes).

Run: `npm run lint && npm run build`
Expected: 0 erros; build conclui.

- [ ] **Step 2: Teste manual (contra a API real)**

1. Em `/dashboard/triagens` → "Nova triagem": cadastre/escolha um cliente, escreva um relato trabalhista, rode a triagem e salve.
2. Abra a triagem (`/dashboard/clientes/[id]/relato/[intakeId]`). Confirme que aparece o bloco **"Estilo da peça (opcional)"** com autores trabalhistas (Maurício Godinho Delgado etc.).
3. Marque 1–2 autores, escreva uma instrução livre, clique **"Gerar peça"**.
4. No editor, confirme que a peça é gerada (streaming) e que o tom/estrutura reflete o estilo pedido.
5. No Supabase (ou via uma leitura), confirme que a linha de `legal_drafts` tem `style_authors` e `style_instruction` preenchidos.
6. Repita sem marcar nada → a geração continua funcionando (caminho sem estilo).

- [ ] **Step 3: Merge para produção**

```bash
git checkout main
git merge --no-ff feat/dashboard-advogados -m "Merge: estilo de peças (autores + texto livre)"
git push origin main
git checkout feat/dashboard-advogados
```

(Guard de segredos antes do commit/push: `git diff --cached --name-only | grep -i env` deve ser vazio.)

---

## Self-Review

**Spec coverage (item #4 do batch do usuário):**
- "autores renomados daquela área para marcar com check" → Task 2 (config) + Task 5 (checkboxes) + Task 6 (área correta). ✓
- "ou um box de texto livre que influencia a peça" → Task 5 (`textarea name="styleInstruction"`) + Task 4 (captura) + Task 3 (injeção). ✓
- "Estilo + doutrina" (decisão do cliente) → `styleSection` instrui emular voz E invocar doutrina, sem inventar fatos. ✓
- Persistência para re-geração → colunas em `legal_drafts` (Task 1), lidas pela rota (Task 7). ✓

**Placeholder scan:** sem "TBD"/"TODO"/"handle edge cases" genéricos — cada passo traz o código completo. ✓

**Type consistency:**
- `DraftStyle { authors: string[]; instruction: string | null }` — definido na Task 3, montado igual na rota (Task 7) a partir de `draft.style_authors`/`draft.style_instruction` (colunas da Task 1, tipadas na Task 1 Step 3). ✓
- `autoresPorArea(area: TriageArea): Autor[]` — assinatura idêntica entre Task 2 (def), teste e Task 5 (uso). ✓
- `GenerateDraftButton({ intakeId, area })` — `area?: TriageArea` opcional; usos na Task 6 passam `t?.area` / `result.area` (ambos `TriageArea | undefined`). ✓
- `createDraftFromIntake` lê `styleAuthors` via `getAll` (array) e `styleInstruction` via `get` — casam com `name="styleAuthors"` (checkbox múltiplo) e `name="styleInstruction"` (textarea) da Task 5. ✓

---

## Próximos planos (restante da Parte B)

Esta é a Parte **B.1**. Os outros dois subsistemas da Parte B viram planos próprios (cada um entrega software testável sozinho):

- **B.2 — Galeria de tipos + wizard de criação dinâmica** (`/dashboard/pecas/nova` reformulado): config `src/lib/pecas/tipos.ts`, fluxo tipo → cliente → contexto (reusar triagem existente / nova história) → estilo (reusa o componente desta B.1) → gerar. Generaliza `createDraftFromIntake` para uma action `createDraft` que aceita `intakeId` **ou** história nova.
- **B.3 — Geração a partir de documento (Claude-PDF nativo)**: bucket Storage `peca-anexos` (RLS como `case-documents`), action de upload, `streamDraft`/`draftMessages` ganham `documents?` (document content block, PDF base64), e a rota envia o anexo ao Claude. Habilita Recurso/Contestação a partir do PDF da decisão/inicial. Sem docling.
