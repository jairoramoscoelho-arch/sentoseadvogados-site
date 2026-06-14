# Estúdio de Peças — Parte B.2: Galeria de tipos + wizard de criação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uma rota nova `/dashboard/pecas/criar` onde o advogado escolhe **o tipo de peça** (galeria), o **cliente**, **reusa uma triagem existente** dele (ou vai fazer uma nova no estúdio), define o **estilo** (reusa `EstiloPeca`) e **gera** — com o tipo escolhido prevalecendo sobre o sugerido pela triagem.

**Architecture:** Aditivo e de baixo risco: nada move o estúdio de triagem (`/pecas/nova` fica como está, só muda o título para "Nova triagem"). A galeria é uma página server que carrega clientes + triagens e entrega ao componente client `NovaPecaWizard` (revelação progressiva em uma página: tipo → cliente → triagem+estilo+gerar). O form final reusa a action `createDraftFromIntake` (estendida com um campo `tipo`) e o componente `EstiloPeca` da Parte B.1. O tipo escolhido é gravado em `legal_drafts.tipo` (migração 0008) e a rota de geração o repassa a `streamDraft` como `tipoOverride`, que prevalece sobre `triage.tipo_peca_sugerido`.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19 (useState, useFormStatus), Supabase (Postgres + RLS), Anthropic SDK (`messages.stream`), Zod, Vitest, Tailwind v4.

**Depende de:** Parte B.1 (estilo) — `EstiloPeca`, `createDraftFromIntake` já com `styleAuthors`/`styleInstruction`, colunas de estilo. Já em produção.

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `supabase/migrations/0008_draft_tipo.sql` | Coluna `tipo` em `legal_drafts` | Criar |
| `src/types/db.ts` | `LegalDraft` ganha `tipo` | Modificar |
| `src/lib/data/drafts.ts` | `DRAFT_COLS` inclui `tipo` | Modificar |
| `src/lib/pecas/tipos.ts` | Catálogo de tipos de peça + `tipoPecaByKey()` | Criar |
| `src/lib/pecas/tipos.test.ts` | Testa o catálogo | Criar |
| `src/lib/ai/drafting.ts` | `tipoOverride` em `draftMessages`/`streamDraft`; `legalRequisite(tipo, area)` | Modificar |
| `src/lib/ai/drafting.test.ts` | Testa o override do tipo | Modificar |
| `src/app/dashboard/pecas/actions.ts` | `createDraftFromIntake` aceita `tipo` (título + grava) | Modificar |
| `src/app/api/drafts/[id]/generate/route.ts` | Passa `draft.tipo` como `tipoOverride` | Modificar |
| `src/components/pecas/NovaPecaWizard.tsx` | Wizard (tipo → cliente → triagem → estilo → gerar) | Criar |
| `src/app/dashboard/pecas/criar/page.tsx` | Página da galeria/wizard | Criar |
| `src/app/dashboard/pecas/page.tsx` | Botão "Nova peça" → `/pecas/criar` | Modificar |
| `src/app/dashboard/pecas/nova/page.tsx` | Título "Nova triagem" (relabel) | Modificar |

---

## Task 1: Migração — coluna `tipo` em `legal_drafts`

**Files:**
- Create: `supabase/migrations/0008_draft_tipo.sql`
- Modify: `src/types/db.ts` (interface `LegalDraft`, após `style_instruction`)
- Modify: `src/lib/data/drafts.ts` (`DRAFT_COLS`)

- [ ] **Step 1: Escrever a migração**

Create `supabase/migrations/0008_draft_tipo.sql`:

```sql
-- =====================================================================
-- Sprint 1D — tipo de peça escolhido na galeria (prevalece sobre o tipo
-- sugerido pela triagem na geração e no título). Nulo = usa o da triagem.
-- =====================================================================
alter table public.legal_drafts
  add column if not exists tipo text;
```

- [ ] **Step 2: Aplicar a migração**

Run: `npm run db:migrate`
Expected: `Aplicando 0008_draft_tipo.sql... ok` e `Migrações em dia.`

- [ ] **Step 3: Atualizar o tipo `LegalDraft`**

In `src/types/db.ts`, dentro de `interface LegalDraft`, logo após a linha `style_instruction: string | null;`, adicionar:

```ts
  tipo: string | null;
```

- [ ] **Step 4: Incluir a coluna no select**

In `src/lib/data/drafts.ts`, substituir a constante `DRAFT_COLS` por:

```ts
const DRAFT_COLS =
  "id, client_id, case_id, intake_id, template_id, title, status, content_html, model_used, style_id, style_authors, style_instruction, tipo, created_by, assigned_to, created_at, updated_at, deleted_at";
```

- [ ] **Step 5: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0008_draft_tipo.sql src/types/db.ts src/lib/data/drafts.ts
git commit -m "feat(pecas): coluna tipo em legal_drafts (0008)"
```

---

## Task 2: Catálogo de tipos de peça

**Files:**
- Create: `src/lib/pecas/tipos.ts`
- Test: `src/lib/pecas/tipos.test.ts`

- [ ] **Step 1: Escrever o teste (que falha)**

Create `src/lib/pecas/tipos.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/pecas/tipos.test.ts`
Expected: FAIL — `Failed to resolve import "./tipos"`.

- [ ] **Step 3: Implementar o catálogo**

Create `src/lib/pecas/tipos.ts`:

```ts
export interface TipoPeca {
  key: string;
  nome: string;
  descricao: string;
}

/** Tipos de peça oferecidos na galeria. `nome` é o rótulo usado na geração. */
export const TIPOS_PECA: TipoPeca[] = [
  {
    key: "peticao_inicial",
    nome: "Petição inicial",
    descricao: "Inaugura o processo: fatos, direito e pedidos.",
  },
  {
    key: "reclamacao_trabalhista",
    nome: "Reclamação trabalhista",
    descricao: "Petição inicial na Justiça do Trabalho (art. 840 da CLT).",
  },
  {
    key: "contestacao",
    nome: "Contestação",
    descricao: "Defesa do réu, com impugnação específica dos fatos.",
  },
  {
    key: "replica",
    nome: "Réplica",
    descricao: "Resposta do autor à contestação.",
  },
  {
    key: "recurso",
    nome: "Recurso",
    descricao: "Impugna decisão desfavorável (apelação, recurso ordinário, agravo).",
  },
  {
    key: "contrarrazoes",
    nome: "Contrarrazões",
    descricao: "Resposta ao recurso da parte contrária.",
  },
  {
    key: "notificacao_extrajudicial",
    nome: "Notificação extrajudicial",
    descricao: "Comunicação formal antes ou fora do processo.",
  },
];

export function tipoPecaByKey(key: string): TipoPeca | undefined {
  return TIPOS_PECA.find((t) => t.key === key);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/pecas/tipos.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pecas/tipos.ts src/lib/pecas/tipos.test.ts
git commit -m "feat(pecas): catálogo de tipos de peça para a galeria"
```

---

## Task 3: `tipoOverride` no prompt de geração

**Files:**
- Modify: `src/lib/ai/drafting.ts` (`legalRequisite`, `draftMessages`, `streamDraft`)
- Test: `src/lib/ai/drafting.test.ts`

- [ ] **Step 1: Adicionar os testes (que falham)**

In `src/lib/ai/drafting.test.ts`, dentro do `describe("drafting", () => { ... })`, antes do `});` final, acrescentar:

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/ai/drafting.test.ts`
Expected: FAIL — `draftMessages` ignora o 5º argumento; ainda aparece "319" e não "Recurso".

- [ ] **Step 3: Refatorar `legalRequisite` e injetar o override**

In `src/lib/ai/drafting.ts`:

(a) Substituir a função `legalRequisite` inteira por (passa a receber `tipo` e `area`, e cobre "reclamação" e "contrarrazões"):

```ts
function legalRequisite(tipo: string, area: TriageResult["area"]): string {
  const t = tipo.toLowerCase();
  if (t.includes("inicial") || t.includes("reclama")) {
    return area === "trabalhista"
      ? "Requisitos da petição/reclamação inicial trabalhista (art. 840 da CLT)."
      : "Requisitos da petição inicial (art. 319 do CPC).";
  }
  if (t.includes("contesta") || t.includes("defesa")) {
    return "Requisitos da contestação (art. 336 do CPC), com impugnação específica dos fatos.";
  }
  if (
    t.includes("recurso") ||
    t.includes("apela") ||
    t.includes("agravo") ||
    t.includes("contrarraz")
  ) {
    return "Observar tempestividade, preparo e a fundamentação das razões recursais.";
  }
  return "";
}
```

(b) Trocar a assinatura e o início de `draftMessages` (adicionar `tipoOverride` como 5º parâmetro e derivar `tipo`):

```ts
export function draftMessages(
  triage: TriageResult,
  clientName: string,
  rawText: string,
  style?: DraftStyle,
  tipoOverride?: string,
): Array<{ role: "user"; content: string }> {
  const tipo = tipoOverride?.trim() || triage.tipo_peca_sugerido;
  const teses = triage.teses
    .map((t, i) => `${i + 1}. ${t.titulo} — ${t.fundamento}`)
    .join("\n");
  const requisito = legalRequisite(tipo, triage.area);
  const content = `Gere a peça do tipo: ${tipo}.

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
  tipoOverride?: string,
) {
  const anthropic = await createAnthropicClient();
  return anthropic.messages.stream({
    model: STUDIO_MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: buildDraftSystemPrompt(),
    messages: draftMessages(triage, clientName, rawText, style, tipoOverride),
  });
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/ai/drafting.test.ts`
Expected: PASS (9 testes — 7 anteriores + 2 novos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/drafting.ts src/lib/ai/drafting.test.ts
git commit -m "feat(pecas): tipo escolhido na galeria prevalece na geração (tipoOverride)"
```

---

## Task 4: `createDraftFromIntake` aceita o `tipo`

**Files:**
- Modify: `src/app/dashboard/pecas/actions.ts` (`createSchema`, `createDraftFromIntake`)

- [ ] **Step 1: Adicionar `tipo` ao schema**

In `src/app/dashboard/pecas/actions.ts`, no `const createSchema = z.object({ ... })`, acrescentar a propriedade `tipo` (após `styleInstruction`):

```ts
  tipo: z.string().max(120).optional(),
```

(O objeto fica: `intakeId`, `styleAuthors`, `styleInstruction`, `tipo`.)

- [ ] **Step 2: Ler `tipo` do FormData**

In `createDraftFromIntake`, no objeto do `safeParse`, acrescentar a linha (após `styleInstruction: ...`):

```ts
    tipo: (formData.get("tipo") as string) || undefined,
```

- [ ] **Step 3: Usar o `tipo` no título e gravar na peça**

In `createDraftFromIntake`, substituir a linha:

```ts
  const tipo = triage.success ? triage.data.tipo_peca_sugerido : "Peça jurídica";
```

por (o tipo da galeria prevalece):

```ts
  const tipo =
    parsed.data.tipo?.trim() ||
    (triage.success ? triage.data.tipo_peca_sugerido : "Peça jurídica");
```

E no objeto de `.insert({ ... })`, logo após `intake_id: intake.id,`, adicionar:

```ts
      tipo: parsed.data.tipo?.trim() || null,
```

- [ ] **Step 4: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/pecas/actions.ts
git commit -m "feat(pecas): createDraftFromIntake grava o tipo escolhido"
```

---

## Task 5: Rota de geração usa `draft.tipo`

**Files:**
- Modify: `src/app/api/drafts/[id]/generate/route.ts` (chamada de `streamDraft`)

- [ ] **Step 1: Passar `draft.tipo` como `tipoOverride`**

In `src/app/api/drafts/[id]/generate/route.ts`, na chamada de `streamDraft`, substituir:

```ts
    messageStream = await streamDraft(
      triage.data,
      client?.name ?? "o cliente",
      intake.raw_text ?? "",
      style,
    );
```

por:

```ts
    messageStream = await streamDraft(
      triage.data,
      client?.name ?? "o cliente",
      intake.raw_text ?? "",
      style,
      draft.tipo ?? undefined,
    );
```

- [ ] **Step 2: Verificar lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros; build conclui.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/drafts/[id]/generate/route.ts"
git commit -m "feat(pecas): geração usa o tipo escolhido na galeria"
```

---

## Task 6: Componente `NovaPecaWizard`

**Files:**
- Create: `src/components/pecas/NovaPecaWizard.tsx`

- [ ] **Step 1: Criar o wizard**

Create `src/components/pecas/NovaPecaWizard.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn, formatDatePtBr } from "@/lib/utils";
import { TIPOS_PECA } from "@/lib/pecas/tipos";
import { EstiloPeca } from "./EstiloPeca";
import { createDraftFromIntake } from "@/app/dashboard/pecas/actions";
import type { Client } from "@/types/db";
import type { RecentIntake } from "@/lib/data/clients";
import type { TriageArea } from "@/lib/ai/triage";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

const cardBase =
  "flex flex-col gap-0.5 rounded-xl border bg-paper p-4 text-left shadow-soft transition-colors hover:border-green-700/30";
const cardOn = "border-green-700/50 bg-green-50/60";
const cardOff = "border-line";

export function NovaPecaWizard({
  clients,
  intakes,
  initialClientId,
}: {
  clients: Client[];
  intakes: RecentIntake[];
  initialClientId?: string;
}) {
  const [tipo, setTipo] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(
    initialClientId && clients.some((c) => c.id === initialClientId)
      ? initialClientId
      : null,
  );
  const [intakeId, setIntakeId] = useState<string | null>(null);

  const clientTriagens = intakes.filter((i) => i.client_id === clientId);
  const selectedIntake = clientTriagens.find((i) => i.id === intakeId) ?? null;
  const selectedArea = (
    selectedIntake?.triage as { area?: TriageArea } | null
  )?.area;

  const chooseClient = (id: string) => {
    setClientId(id);
    setIntakeId(null);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Tipo */}
      <section>
        <h2 className="font-serif text-lg font-semibold text-ink">
          1. Tipo de peça
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TIPOS_PECA.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTipo(t.nome)}
              aria-pressed={tipo === t.nome}
              className={cn(cardBase, tipo === t.nome ? cardOn : cardOff)}
            >
              <span className="font-medium text-ink">{t.nome}</span>
              <span className="text-xs text-muted">{t.descricao}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Cliente */}
      {tipo && (
        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">
            2. Cliente
          </h2>
          {clients.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              Nenhum cliente cadastrado.{" "}
              <Link
                href="/dashboard/clientes"
                className="font-medium text-green-700 hover:text-green-800"
              >
                Cadastre um cliente
              </Link>{" "}
              e volte aqui.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {clients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => chooseClient(c.id)}
                  aria-pressed={clientId === c.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border bg-paper px-4 py-3 text-left text-sm shadow-soft transition-colors hover:border-green-700/30",
                    clientId === c.id ? cardOn : cardOff,
                  )}
                >
                  <span className="truncate font-medium text-ink">{c.name}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {c.type === "pf" ? "PF" : "PJ"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Embasamento (triagem) + estilo + gerar */}
      {tipo && clientId && (
        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">
            3. Embasamento
          </h2>
          {clientTriagens.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              Este cliente ainda não tem triagem.{" "}
              <Link
                href={`/dashboard/pecas/nova?cliente=${clientId}`}
                className="font-medium text-green-700 hover:text-green-800"
              >
                Fazer a triagem
              </Link>{" "}
              e volte para gerar a peça.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                Escolha a triagem que embasa a peça:
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {clientTriagens.map((i) => {
                  const t = i.triage as {
                    area?: string;
                    tipo_peca_sugerido?: string;
                  } | null;
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setIntakeId(i.id)}
                      aria-pressed={intakeId === i.id}
                      className={cn(cardBase, intakeId === i.id ? cardOn : cardOff)}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-ink">
                          {t?.area ? cap(t.area) : "Triagem"}
                          {t?.tipo_peca_sugerido
                            ? ` · sugerido: ${t.tipo_peca_sugerido}`
                            : ""}
                        </span>
                        <span className="shrink-0 text-xs text-muted">
                          {formatDatePtBr(i.created_at)}
                        </span>
                      </span>
                      {i.raw_text && (
                        <span className="line-clamp-1 text-xs text-muted">
                          {i.raw_text}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm">
                <Link
                  href={`/dashboard/pecas/nova?cliente=${clientId}`}
                  className="font-medium text-green-700 hover:text-green-800"
                >
                  + Nova história para este cliente
                </Link>
              </p>
            </>
          )}

          {intakeId && (
            <form
              action={createDraftFromIntake}
              className="mt-6 flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft"
            >
              <input type="hidden" name="intakeId" value={intakeId} />
              <input type="hidden" name="tipo" value={tipo} />
              <EstiloPeca area={selectedArea} />
              <Submit />
            </form>
          )}
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar lint**

Run: `npm run lint`
Expected: sem erros (exit 0).

- [ ] **Step 3: Commit**

```bash
git add src/components/pecas/NovaPecaWizard.tsx
git commit -m "feat(pecas): NovaPecaWizard (tipo → cliente → triagem → estilo → gerar)"
```

---

## Task 7: Página da galeria + ligações de navegação

**Files:**
- Create: `src/app/dashboard/pecas/criar/page.tsx`
- Modify: `src/app/dashboard/pecas/page.tsx` (botão "Nova peça" → `/pecas/criar`)
- Modify: `src/app/dashboard/pecas/nova/page.tsx` (título "Nova triagem")

- [ ] **Step 1: Criar a página da galeria/wizard**

Create `src/app/dashboard/pecas/criar/page.tsx`:

```tsx
import { listClients, listRecentIntakes } from "@/lib/data/clients";
import { NovaPecaWizard } from "@/components/pecas/NovaPecaWizard";

export const dynamic = "force-dynamic";

export default async function CriarPecaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const [clients, intakes] = await Promise.all([
    listClients(),
    listRecentIntakes(200),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Nova peça
      </h1>
      <p className="mt-2 text-muted">
        Escolha o tipo, o cliente e a triagem que embasa a peça — depois o estilo
        e gere.
      </p>
      <div className="mt-8">
        <NovaPecaWizard
          clients={clients}
          intakes={intakes}
          initialClientId={cliente}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Apontar "Nova peça" (página Peças) para a galeria**

In `src/app/dashboard/pecas/page.tsx`, no `<Link>` do cabeçalho, trocar `href="/dashboard/pecas/nova"` por `href="/dashboard/pecas/criar"`. (É o link cujo texto é "Nova peça".)

- [ ] **Step 3: Relabelar o estúdio como "Nova triagem"**

In `src/app/dashboard/pecas/nova/page.tsx`, no `<h1>`, trocar o texto do ramo de criação de `"Nova peça"` para `"Nova triagem"`. A linha passa a ser:

```tsx
        {edit ? "Editar relato" : "Nova triagem"}
```

- [ ] **Step 4: Verificar lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros; build conclui; a rota `/dashboard/pecas/criar` aparece na tabela de rotas.

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/pecas/criar/page.tsx" "src/app/dashboard/pecas/page.tsx" "src/app/dashboard/pecas/nova/page.tsx"
git commit -m "feat(pecas): rota /pecas/criar (galeria) + Nova peça aponta p/ ela; estúdio vira Nova triagem"
```

---

## Task 8: Verificação end-to-end + merge

**Files:** nenhum (verificação).

- [ ] **Step 1: Suíte completa**

Run: `npx vitest run`
Expected: todos verdes (23 da B.1 + 3 de tipos + 2 novos de drafting = ~28 testes).

Run: `npm run lint && npm run build`
Expected: 0 erros; build conclui; rotas `/dashboard/pecas/criar` e `/dashboard/pecas/nova` presentes.

- [ ] **Step 2: Teste manual (contra a API real)**

1. Em `/dashboard/pecas` clique **"Nova peça"** → vai para `/dashboard/pecas/criar`.
2. Escolha um **tipo** (ex.: Recurso) → surge a seção **Cliente**. Escolha um cliente que tenha triagem → surge a seção **Embasamento**.
3. Se o cliente não tiver triagem, confirme o atalho "Fazer a triagem". Tendo, escolha uma triagem → aparece o bloco de **estilo** + **"Gerar peça"**.
4. (Opcional) escolha um autor/instrução, clique **"Gerar peça"** → editor gera. Confirme que a peça respeita o **tipo escolhido** (ex.: o cabeçalho/estrutura de Recurso, não a inicial sugerida).
5. Confirme no banco que `legal_drafts.tipo` ficou preenchido com o tipo da galeria.
6. Verifique que `/dashboard/pecas/nova` continua sendo o estúdio de triagem (título "Nova triagem") e que os atalhos "Nova triagem" (FAB, aba Triagens) seguem funcionando.

- [ ] **Step 3: Merge para produção**

```bash
git checkout main
git merge --no-ff feat/dashboard-advogados -m "Merge: galeria de tipos + wizard de criação de peça"
git push origin main
git checkout feat/dashboard-advogados
```

(Guard de segredos: `git diff --cached --name-only | grep -i env` deve ser vazio.)

---

## Self-Review

**Spec coverage (visão da galeria/wizard, msg #14 do usuário):**
- "galeria de tipos" → Task 2 (catálogo) + Task 6 (seção 1) + Task 7 (rota). ✓
- "escolher cliente" → Task 6 (seção 2). ✓
- "reusar uma triagem existente" → Task 6 (seção 3 lista as triagens do cliente). ✓
- "nova história" → atalho para o estúdio `/pecas/nova?cliente=` (Task 6); estúdio preservado e relabelado (Task 7). ✓
- "estilo" → reusa `EstiloPeca` (Task 6). ✓
- tipo escolhido influencia a peça → `tipo` gravado (Task 1/4) e `tipoOverride` na geração (Task 3/5). ✓

**Placeholder scan:** sem "TBD"/genéricos — código completo em cada passo. ✓

**Type consistency:**
- `legalRequisite(tipo: string, area: TriageResult["area"])` — Task 3; chamada interna em `draftMessages` com `(tipo, triage.area)`. ✓
- `draftMessages(triage, clientName, rawText, style?, tipoOverride?)` / `streamDraft(..., tipoOverride?)` — Task 3 (def) e Task 5 (uso `draft.tipo ?? undefined`). ✓
- `legal_drafts.tipo` (string|null) — Task 1 (coluna/typo) lida em Task 5 (`draft.tipo`) e gravada em Task 4. ✓
- `createDraftFromIntake` lê `tipo` via `formData.get("tipo")` — bate com `<input type="hidden" name="tipo" value={tipo}>` do wizard (Task 6). ✓
- `NovaPecaWizard({ clients: Client[], intakes: RecentIntake[], initialClientId? })` — Task 6 (def) e Task 7 (uso com `listClients`/`listRecentIntakes`). ✓
- `TIPOS_PECA`/`tipoPecaByKey` — Task 2; `TIPOS_PECA` usado em Task 6. ✓

---

## Próximo plano (restante da Parte B)

- **B.3 — Geração a partir de documento (Claude-PDF nativo)**: bucket `peca-anexos` (RLS como `case-documents`), upload, `documents?` em `draftMessages`/`streamDraft` (document content block, PDF base64), e a rota envia o PDF ao Claude. Habilita Recurso/Contestação a partir do PDF da decisão/inicial. Sem docling. (No wizard, vira uma 4ª opção de embasamento: "subir documento".)
