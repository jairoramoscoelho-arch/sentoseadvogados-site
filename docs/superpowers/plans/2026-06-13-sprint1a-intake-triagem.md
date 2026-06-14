# Sprint 1A — Intake + Triagem + Clientes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o advogado cadastre um cliente, registre a "história" dele (texto) e rode uma **triagem por IA** (Claude Opus 4.8) que classifica o caso (área, natureza, teses, tipo de peça sugerido e queries de jurisprudência) — a porta de entrada do Estúdio de Peças.

**Architecture:** Reaproveita a fundação F0/Sprint 0 (Supabase + RLS por papel, Server Actions, `useActionState`, padrões de form da Sprint 0). Nova tabela `intakes`. Camada de IA server-only (`src/lib/ai/`) com a chave resolvida pelo store de Sprint 0 (`getSecret("anthropic_api_key")`, DB→env). A triagem usa `client.messages.parse()` + `zodOutputFormat` (saída estruturada validada). Geração da peça e editor Tiptap ficam para o plano **1B**.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, Supabase (Postgres + RLS), `@anthropic-ai/sdk@0.104.1` (`messages.parse` + `helpers/zod`), zod v4, Vitest, Tailwind v4.

**Escopo desta fatia (1A):** tipos de DB · migração `0003_intakes` · `ai/anthropic` + `ai/triage` · CRUD mínimo de clientes (listar/criar/detalhe) · estúdio `/dashboard/pecas/nova` (cliente + história + triagem + salvar) · item "Peças" na sidebar. **Fora (1B):** `document_templates`, `legal_drafts`, geração streaming, editor Tiptap, casos CRUD completo, voz (1.5).

---

## File Structure

**Novos:**
- `src/types/db.ts` — tipos TS das tabelas (Client, Case, Intake, TriageResult).
- `supabase/migrations/0003_intakes.sql` — tabela `intakes` + RLS.
- `src/lib/ai/anthropic.ts` — factory do client Claude (chave via `getSecret`), server-only.
- `src/lib/ai/triage.ts` — schema zod da triagem + prompt + `triageStory()`.
- `src/lib/ai/triage.test.ts` — testes do schema (puro, sem API).
- `src/lib/data/clients.ts` — leituras de clientes (RLS), server-only.
- `src/app/dashboard/clientes/actions.ts` — `createClient` (Server Action).
- `src/app/dashboard/clientes/page.tsx` — lista + form (substitui o stub).
- `src/app/dashboard/clientes/[id]/page.tsx` — ficha do cliente.
- `src/components/clientes/{ClientsTable,ClientForm}.tsx`.
- `src/app/dashboard/pecas/page.tsx` — lista de intakes/peças (placeholder funcional).
- `src/app/dashboard/pecas/nova/page.tsx` — estúdio: cliente + história + triagem.
- `src/app/dashboard/pecas/nova/actions.ts` — `runTriage` + `saveIntake`.
- `src/components/pecas/IntakeStudio.tsx` — client component do fluxo de triagem.

**Modificados:**
- `src/components/dashboard/Sidebar.tsx` — item "Peças".

**Convenções:** consultar `node_modules/next/dist/docs/` (Server Actions/`useActionState`, `revalidatePath`) antes de codar. Espelhar exatamente os padrões de `src/components/admin/{UsersTable,CreateUserForm}.tsx` e `src/app/dashboard/admin/usuarios/actions.ts` (Sprint 0) para tabelas, forms e actions.

---

## Task 1: Tipos de banco (`src/types/db.ts`)

**Files:**
- Create: `src/types/db.ts`

- [ ] **Step 1: Criar o módulo de tipos**

```ts
// Tipos das tabelas do painel (espelham supabase/migrations). Mantidos à mão
// (sem geração automática) por simplicidade.

export type ClientType = "pf" | "pj";
export type CaseStatus = "ativo" | "suspenso" | "arquivado" | "encerrado";

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  document: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CaseRow {
  id: string;
  client_id: string;
  title: string;
  area: string | null;
  process_number: string | null;
  court: string | null;
  status: CaseStatus;
  responsible_id: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Intake {
  id: string;
  client_id: string;
  case_id: string | null;
  raw_text: string | null;
  audio_path: string | null;
  transcript: string | null;
  triage: unknown; // validado por TriageSchema (src/lib/ai/triage.ts)
  created_by: string | null;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/db.ts
git commit -m "feat(painel): tipos de DB (Client, Case, Intake)"
```

---

## Task 2: Migração `0003_intakes`

**Files:**
- Create: `supabase/migrations/0003_intakes.sql`

- [ ] **Step 1: Escrever a migração (segue convenções da 0001)**

```sql
-- =====================================================================
-- Sprint 1A — intakes (relato do cliente + resultado da triagem por IA)
-- =====================================================================
create table public.intakes (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  case_id     uuid references public.cases(id) on delete set null,
  raw_text    text,
  audio_path  text,
  transcript  text,
  triage      jsonb,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
create index intakes_client_idx on public.intakes (client_id);

alter table public.intakes enable row level security;
create policy "intakes_select" on public.intakes for select to authenticated using (public.is_member());
create policy "intakes_insert" on public.intakes for insert to authenticated with check (public.can_write());
create policy "intakes_update" on public.intakes for update to authenticated using (public.can_write()) with check (public.can_write());
create policy "intakes_delete" on public.intakes for delete to authenticated using (public.is_socio());
```

- [ ] **Step 2: Aplicar a migração**

Run: `npm run db:migrate`
Expected: `• 0001_init.sql — já aplicada, pulando`, `• 0002_... — já aplicada, pulando`, `Aplicando 0003_intakes.sql... ok`, `Migrações em dia.`

- [ ] **Step 3: Confirmar RLS (SQL editor do Supabase ou pg)**

Run (no SQL editor): `select count(*) from pg_policies where tablename='intakes';`
Expected: `4`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0003_intakes.sql
git commit -m "feat(painel): migração intakes (relato + triagem)"
```

---

## Task 3: Factory do client Anthropic (`src/lib/ai/anthropic.ts`)

**Files:**
- Create: `src/lib/ai/anthropic.ts`

- [ ] **Step 1: Criar a factory (chave resolvida pelo store da Sprint 0)**

```ts
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getSecret } from "@/lib/settings/store";

/** Lançada quando a chave da Anthropic não está configurada (nem no painel nem no env). */
export class AnthropicNotConfiguredError extends Error {
  constructor() {
    super("Chave da Anthropic não configurada. Configure em Administração → Integrações.");
    this.name = "AnthropicNotConfiguredError";
  }
}

/** Modelo padrão do estúdio. */
export const STUDIO_MODEL = "claude-opus-4-8";

/** Cria um client Claude com a chave resolvida (painel → env). Server-only. */
export async function createAnthropicClient(): Promise<Anthropic> {
  const apiKey = await getSecret("anthropic_api_key");
  if (!apiKey) throw new AnthropicNotConfiguredError();
  return new Anthropic({ apiKey });
}
```

- [ ] **Step 2: Verificar tipos (build parcial)**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | head -n 20`
Expected: sem erros em `src/lib/ai/anthropic.ts`. (Se `tsc` reclamar de outros arquivos do projeto não relacionados, ignore; foque no arquivo novo.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/anthropic.ts
git commit -m "feat(ai): factory do client Anthropic (chave via store DB->env)"
```

---

## Task 4: Schema + prompt + função da triagem (`src/lib/ai/triage.ts`)

**Files:**
- Create: `src/lib/ai/triage.ts`
- Test: `src/lib/ai/triage.test.ts`

- [ ] **Step 1: Escrever o teste do schema (falha primeiro)**

```ts
// src/lib/ai/triage.test.ts
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
    const { resumo, ...incompleto } = valid;
    expect(() => TriageSchema.parse(incompleto)).toThrow();
  });
});
```

- [ ] **Step 2: Rodar o teste (deve falhar — módulo não existe)**

Run: `npx vitest run src/lib/ai/triage.test.ts`
Expected: FAIL — `Cannot find module './triage'`.

- [ ] **Step 3: Implementar `triage.ts`**

```ts
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
```

> **Nota (zod v4):** se o compilador acusar incompatibilidade de tipos entre `zod@4` e `zodOutputFormat`, trocar por JSON schema cru: `output_config: { effort: "medium", format: { type: "json_schema", name: "triagem", schema: <jsonschema> } }` e validar com `TriageSchema.parse(JSON.parse(textBlock))`. Manter o `TriageSchema` como fonte da verdade de validação.

- [ ] **Step 4: Rodar os testes (devem passar)**

Run: `npx vitest run src/lib/ai/triage.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/triage.ts src/lib/ai/triage.test.ts
git commit -m "feat(ai): triagem do relato (schema zod + prompt + messages.parse)"
```

---

## Task 5: Leituras de clientes (`src/lib/data/clients.ts`)

**Files:**
- Create: `src/lib/data/clients.ts`

- [ ] **Step 1: Implementar (client RLS-scoped)**

```ts
import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Client, Intake } from "@/types/db";

const CLIENT_COLS = "id, name, type, document, email, phone, notes, created_by, created_at, updated_at, deleted_at";

export async function listClients(): Promise<Client[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("clients")
    .select(CLIENT_COLS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("clients").select(CLIENT_COLS).eq("id", id).maybeSingle();
  return (data as Client | null) ?? null;
}

export async function listIntakesByClient(clientId: string): Promise<Intake[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("intakes")
    .select("id, client_id, case_id, raw_text, audio_path, transcript, triage, created_by, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Intake[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/data/clients.ts
git commit -m "feat(painel): leituras de clientes/intakes (RLS)"
```

---

## Task 6: Action de criar cliente (`clientes/actions.ts`)

**Files:**
- Create: `src/app/dashboard/clientes/actions.ts`

> Espelha `src/app/dashboard/admin/usuarios/actions.ts` (Sprint 0): `"use server"`, `requireSession`, zod, `{ ok, message, errors? }`, `revalidatePath`.

- [ ] **Step 1: Implementar**

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ClientActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente."),
  type: z.enum(["pf", "pj"]),
  document: z.string().trim().max(40).optional(),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(4000).optional(),
});

export async function createClientAction(
  _prev: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const profile = await requireSession();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString() ?? "form";
      if (!errors[k]) errors[k] = issue.message;
    }
    return { ok: false, message: "Verifique os campos.", errors };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").insert({
    name: parsed.data.name,
    type: parsed.data.type,
    document: parsed.data.document ?? null,
    email: parsed.data.email || null,
    phone: parsed.data.phone ?? null,
    notes: parsed.data.notes ?? null,
    created_by: profile.id,
  });
  if (error) return { ok: false, message: "Não foi possível salvar o cliente." };
  revalidatePath("/dashboard/clientes");
  return { ok: true, message: "Cliente cadastrado." };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/clientes/actions.ts
git commit -m "feat(painel): action de cadastro de cliente"
```

---

## Task 7: UI de clientes — form, tabela e página de lista

**Files:**
- Create: `src/components/clientes/ClientForm.tsx`
- Create: `src/components/clientes/ClientsTable.tsx`
- Modify (substitui o stub): `src/app/dashboard/clientes/page.tsx`

- [ ] **Step 1: `ClientForm.tsx`** — espelhar `src/components/admin/CreateUserForm.tsx` (mesmas classes `fieldBase`/`Field`/banner/`Loader2`, `useActionState(createClientAction)`, `reset()` no sucesso). Campos: `name` (obrigatório), `type` (select pf/pj, default pf), `document`, `email`, `phone`, `notes` (textarea). Importar de `@/app/dashboard/clientes/actions`.

```tsx
"use client";
import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClientAction, type ClientActionState } from "@/app/dashboard/clientes/actions";

const initial: ClientActionState = {};
const fieldBase =
  "w-full rounded-lg border bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1";
const fieldClass = (e?: boolean) => cn(fieldBase, e ? "border-red-400" : "border-line focus:border-green-700/40");

export function ClientForm() {
  const [state, action, pending] = useActionState(createClientAction, initial);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  const err = state.errors ?? {};
  return (
    <form ref={ref} action={action} noValidate className="flex h-fit flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft">
      <p className="font-serif text-lg font-semibold text-ink">Novo cliente</p>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={cn("rounded-lg px-3 py-2 text-sm font-medium", state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>{state.message}</p>
      )}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">Nome / Razão social</label>
        <input id="name" name="name" className={fieldClass(Boolean(err.name))} aria-invalid={err.name ? true : undefined} />
        {err.name && <p className="mt-1.5 text-xs text-red-600">{err.name}</p>}
      </div>
      <div>
        <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-ink">Tipo</label>
        <select id="type" name="type" defaultValue="pf" className={fieldClass()}>
          <option value="pf">Pessoa física</option>
          <option value="pj">Pessoa jurídica</option>
        </select>
      </div>
      <div>
        <label htmlFor="document" className="mb-1.5 block text-sm font-medium text-ink">CPF / CNPJ</label>
        <input id="document" name="document" className={fieldClass()} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">E-mail</label>
        <input id="email" name="email" type="email" className={fieldClass(Boolean(err.email))} />
        {err.email && <p className="mt-1.5 text-xs text-red-600">{err.email}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">Telefone</label>
        <input id="phone" name="phone" className={fieldClass()} />
      </div>
      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">Observações</label>
        <textarea id="notes" name="notes" rows={3} className={cn(fieldClass(), "resize-y")} />
      </div>
      <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-7 text-sm font-medium text-white transition duration-200 ease-out hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {pending ? "Salvando…" : "Cadastrar cliente"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: `ClientsTable.tsx`** — tabela simples (espelha `UsersTable.tsx`), client component, link para a ficha.

```tsx
"use client";
import Link from "next/link";
import type { Client } from "@/types/db";

export function ClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return <div className="rounded-xl border border-line bg-paper p-6 text-sm text-muted shadow-soft">Nenhum cliente cadastrado ainda.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Contato</th>
            <th className="px-4 py-3 text-right font-medium">Ação</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-t border-line">
              <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
              <td className="px-4 py-3 text-muted">{c.type === "pf" ? "PF" : "PJ"}</td>
              <td className="px-4 py-3 text-muted">{c.email || c.phone || "—"}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/dashboard/clientes/${c.id}`} className="text-xs font-medium text-green-700 hover:text-green-800">Abrir</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Página de lista** (substitui o stub) — server component, `force-dynamic`, layout em 2 colunas (form + tabela) como `usuarios/page.tsx`.

```tsx
import { listClients } from "@/lib/data/clients";
import { ClientForm } from "@/components/clientes/ClientForm";
import { ClientsTable } from "@/components/clientes/ClientsTable";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await listClients();
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Clientes</h1>
      <p className="mt-2 text-muted">Cadastre e consulte os clientes do escritório.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <ClientForm />
        <ClientsTable clients={clients} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: verde, rota `/dashboard/clientes` como dinâmica.

- [ ] **Step 5: Commit**

```bash
git add src/components/clientes/ src/app/dashboard/clientes/page.tsx
git commit -m "feat(painel): clientes — lista + cadastro"
```

---

## Task 8: Ficha do cliente (`clientes/[id]/page.tsx`)

**Files:**
- Create: `src/app/dashboard/clientes/[id]/page.tsx`

- [ ] **Step 1: Implementar** (server component; `params` é Promise no Next 16 — `await params`).

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, listIntakesByClient } from "@/lib/data/clients";
import { formatDatePtBr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const intakes = await listIntakesByClient(id);

  return (
    <div>
      <Link href="/dashboard/clientes" className="text-sm text-muted hover:text-ink">← Clientes</Link>
      <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">{client.name}</h1>
      <p className="mt-1 text-muted">{client.type === "pf" ? "Pessoa física" : "Pessoa jurídica"}{client.document ? ` · ${client.document}` : ""}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/dashboard/pecas/nova?cliente=${client.id}`} className="inline-flex h-11 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white hover:bg-green-800">Nova peça / triagem</Link>
      </div>

      <h2 className="mt-10 font-serif text-xl font-semibold text-ink">Relatos & triagens</h2>
      <div className="mt-4 flex flex-col gap-3">
        {intakes.length === 0 && <p className="text-sm text-muted">Nenhum relato registrado ainda.</p>}
        {intakes.map((i) => {
          const t = i.triage as { area?: string; tipo_peca_sugerido?: string } | null;
          return (
            <div key={i.id} className="rounded-xl border border-line bg-paper p-4 shadow-soft">
              <p className="text-xs text-muted">{formatDatePtBr(i.created_at)}</p>
              <p className="mt-1 text-sm text-ink">{t?.area ? `Área: ${t.area} · ${t.tipo_peca_sugerido ?? ""}` : "Triagem pendente"}</p>
              {i.raw_text && <p className="mt-1 line-clamp-2 text-sm text-muted">{i.raw_text}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build + Commit**

Run: `npm run build` (verde).
```bash
git add src/app/dashboard/clientes/[id]/page.tsx
git commit -m "feat(painel): ficha do cliente com relatos/triagens"
```

---

## Task 9: Actions do estúdio (`pecas/nova/actions.ts`)

**Files:**
- Create: `src/app/dashboard/pecas/nova/actions.ts`

- [ ] **Step 1: Implementar `runTriage` e `saveIntake`**

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { triageStory, TriageSchema, type TriageResult } from "@/lib/ai/triage";
import { AnthropicNotConfiguredError } from "@/lib/ai/anthropic";

export interface TriageActionState {
  ok?: boolean;
  message?: string;
  result?: TriageResult;
  story?: string;
  clientId?: string;
}

const runSchema = z.object({
  clientId: z.string().uuid("Selecione um cliente."),
  story: z.string().trim().min(20, "Descreva a história com ao menos 20 caracteres."),
});

export async function runTriage(
  _prev: TriageActionState,
  formData: FormData,
): Promise<TriageActionState> {
  await requireSession();
  const parsed = runSchema.safeParse({ clientId: formData.get("clientId"), story: formData.get("story") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  try {
    const result = await triageStory(parsed.data.story);
    return { ok: true, result, story: parsed.data.story, clientId: parsed.data.clientId };
  } catch (e) {
    if (e instanceof AnthropicNotConfiguredError) {
      return { ok: false, message: e.message };
    }
    return { ok: false, message: "Falha ao rodar a triagem. Tente novamente." };
  }
}

export interface SaveIntakeState { ok?: boolean; message?: string; intakeId?: string }

const saveSchema = z.object({
  clientId: z.string().uuid(),
  story: z.string().trim().min(1),
  triage: z.string().min(2), // JSON serializado
});

export async function saveIntake(
  _prev: SaveIntakeState,
  formData: FormData,
): Promise<SaveIntakeState> {
  const profile = await requireSession();
  const parsed = saveSchema.safeParse({
    clientId: formData.get("clientId"),
    story: formData.get("story"),
    triage: formData.get("triage"),
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  let triage: TriageResult;
  try {
    triage = TriageSchema.parse(JSON.parse(parsed.data.triage));
  } catch {
    return { ok: false, message: "Triagem inválida." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("intakes")
    .insert({ client_id: parsed.data.clientId, raw_text: parsed.data.story, triage, created_by: profile.id })
    .select("id")
    .single();
  if (error) return { ok: false, message: "Não foi possível salvar o relato." };

  revalidatePath(`/dashboard/clientes/${parsed.data.clientId}`);
  return { ok: true, message: "Relato e triagem salvos.", intakeId: data.id as string };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/pecas/nova/actions.ts
git commit -m "feat(estudio): actions de triagem e salvar intake"
```

---

## Task 10: Estúdio — UI do intake/triagem

**Files:**
- Create: `src/components/pecas/IntakeStudio.tsx`
- Create: `src/app/dashboard/pecas/nova/page.tsx`

- [ ] **Step 1: `IntakeStudio.tsx`** (client) — recebe a lista de clientes; passo 1: seleciona cliente + escreve história + "Rodar triagem" (`useActionState(runTriage)`); passo 2: ao receber `result`, renderiza a triagem (área, natureza, resumo, partes, teses, tipo de peça, queries) e um form de "Salvar" (`useActionState(saveIntake)`) com `clientId`, `story` e `triage` (JSON em hidden). Botão "Gerar peça" aparece **desabilitado** com tooltip "em breve (Sprint 1B)".

```tsx
"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { runTriage, saveIntake, type TriageActionState, type SaveIntakeState } from "@/app/dashboard/pecas/nova/actions";
import type { Client } from "@/types/db";

const fieldBase =
  "w-full rounded-lg border bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1 border-line focus:border-green-700/40";

export function IntakeStudio({ clients, initialClientId }: { clients: Client[]; initialClientId?: string }) {
  const [triageState, triageAction, triaging] = useActionState(runTriage, {} as TriageActionState);
  const [saveState, saveAction, saving] = useActionState(saveIntake, {} as SaveIntakeState);
  const result = triageState.result;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Passo 1 — relato */}
      <form action={triageAction} className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft">
        <p className="font-serif text-lg font-semibold text-ink">1. Relato do cliente</p>
        <div>
          <label htmlFor="clientId" className="mb-1.5 block text-sm font-medium text-ink">Cliente</label>
          <select id="clientId" name="clientId" defaultValue={initialClientId ?? ""} className={fieldBase} required>
            <option value="" disabled>Selecione…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="story" className="mb-1.5 block text-sm font-medium text-ink">A história, nas palavras do cliente</label>
          <textarea id="story" name="story" rows={10} required placeholder="Ex.: Cliente trabalhou 2 anos sem registro e foi dispensado sem receber verbas…" className={cn(fieldBase, "resize-y")} />
        </div>
        {triageState.message && !triageState.ok && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{triageState.message}</p>
        )}
        <button type="submit" disabled={triaging} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-7 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60">
          {triaging && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {triaging ? "Analisando…" : "Rodar triagem"}
        </button>
      </form>

      {/* Passo 2 — triagem */}
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft">
        <p className="font-serif text-lg font-semibold text-ink">2. Triagem (IA)</p>
        {!result && <p className="text-sm text-muted">Rode a triagem para ver a classificação do caso.</p>}
        {result && (
          <>
            <dl className="grid gap-3 text-sm">
              <Item label="Área" value={result.area} />
              <Item label="Natureza" value={result.natureza} />
              <Item label="Resumo" value={result.resumo} />
              <Item label="Cliente é" value={`${result.partes.cliente_polo} (contra ${result.partes.contraparte})`} />
              <Item label="Peça sugerida" value={result.tipo_peca_sugerido} />
              <div>
                <dt className="font-medium text-ink">Teses</dt>
                <ul className="mt-1 list-disc pl-5 text-muted">
                  {result.teses.map((t, i) => <li key={i}><span className="text-ink">{t.titulo}</span> — {t.fundamento}</li>)}
                </ul>
              </div>
              <div>
                <dt className="font-medium text-ink">Buscas de jurisprudência</dt>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {result.jurisprudence_queries.map((q, i) => <li key={i} className="rounded-full bg-cloud px-3 py-1 text-xs text-muted">{q}</li>)}
                </ul>
              </div>
              {result.observacoes && <Item label="Observações" value={result.observacoes} />}
            </dl>

            {saveState.message && (
              <p role={saveState.ok ? "status" : "alert"} className={cn("rounded-lg px-3 py-2 text-sm font-medium", saveState.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>{saveState.message}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <form action={saveAction}>
                <input type="hidden" name="clientId" value={triageState.clientId ?? ""} />
                <input type="hidden" name="story" value={triageState.story ?? ""} />
                <input type="hidden" name="triage" value={JSON.stringify(result)} />
                <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-full bg-green-700 px-6 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {saving ? "Salvando…" : "Salvar relato + triagem"}
                </button>
              </form>
              <button type="button" disabled title="Em breve (Sprint 1B)" className="inline-flex h-11 cursor-not-allowed items-center rounded-full border border-line px-6 text-sm font-medium text-muted opacity-70">
                Gerar peça (em breve)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-ink">{label}</dt>
      <dd className="text-muted">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Página `/dashboard/pecas/nova`** (server) — carrega clientes, lê `?cliente=` (searchParams é Promise no Next 16).

```tsx
import { listClients } from "@/lib/data/clients";
import { IntakeStudio } from "@/components/pecas/IntakeStudio";

export const dynamic = "force-dynamic";

export default async function NovaPecaPage({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  const { cliente } = await searchParams;
  const clients = await listClients();
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Nova peça</h1>
      <p className="mt-2 text-muted">Comece pelo relato do cliente — a IA classifica o caso e prepara o caminho da peça.</p>
      <div className="mt-8">
        <IntakeStudio clients={clients} initialClientId={cliente} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: verde, rotas `/dashboard/pecas/nova` dinâmicas.

- [ ] **Step 4: Commit**

```bash
git add src/components/pecas/ src/app/dashboard/pecas/nova/
git commit -m "feat(estudio): intake + triagem por IA na tela /pecas/nova"
```

---

## Task 11: Lista de peças (placeholder) + Sidebar

**Files:**
- Create: `src/app/dashboard/pecas/page.tsx`
- Modify: `src/components/dashboard/Sidebar.tsx`

- [ ] **Step 1: `pecas/page.tsx`** — lista simples com botão "Nova peça" (em 1A lista os intakes recentes; pode evoluir em 1B).

```tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PecasPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Peças</h1>
        <Link href="/dashboard/pecas/nova" className="inline-flex h-11 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white hover:bg-green-800">Nova peça</Link>
      </div>
      <p className="mt-2 text-muted">Inicie uma nova peça pelo relato do cliente. A geração com IA entra na próxima etapa.</p>
    </div>
  );
}
```

- [ ] **Step 2: Sidebar** — adicionar "Peças" ao `baseNav` (após "Clientes"), ícone `FileText`. Importar `FileText` de `lucide-react` e inserir `{ href: "/dashboard/pecas", label: "Peças", icon: FileText }` no array `baseNav`.

- [ ] **Step 3: Build + Commit**

Run: `npm run build` (verde).
```bash
git add src/app/dashboard/pecas/page.tsx src/components/dashboard/Sidebar.tsx
git commit -m "feat(estudio): item Peças na sidebar + lista inicial"
```

---

## Task 12: Verificação end-to-end

- [ ] **Step 1: Suíte de testes + lint + build**

Run: `npm test && npm run lint && npm run build`
Expected: testes do crypto (5) + triage (3) passam; lint limpo; build verde.

- [ ] **Step 2: Verificação real da triagem (integração — gasta alguns centavos)**

Pré-requisito: `ANTHROPIC_API_KEY` configurada (via painel de Integrações ou `.env.local`). Criar `scripts/_verify-triage.mjs` (temporário) que importa nada do app (o app é server-only/TS) — em vez disso, faça a verificação **pela UI**: `npm run dev`, logar, ir em `/dashboard/clientes`, cadastrar um cliente teste, abrir a ficha → "Nova peça / triagem", colar um relato (ex.: "Trabalhei 3 anos numa loja sem carteira assinada e fui mandado embora sem receber nada") e clicar "Rodar triagem".
Expected: retorna área `trabalhista`, natureza coerente, teses com fundamentos (ex.: reconhecimento de vínculo, verbas rescisórias), tipo de peça "Petição inicial", e queries de jurisprudência. Clicar "Salvar relato + triagem" → aparece na ficha do cliente.

- [ ] **Step 3: Verificar persistência (SQL editor)**

Run: `select id, client_id, triage->>'area' as area, created_at from public.intakes order by created_at desc limit 3;`
Expected: a linha do intake salvo, com `area` preenchida.

- [ ] **Step 4: Tratamento de erro sem chave**

Se a chave da Anthropic não estiver configurada, "Rodar triagem" deve mostrar a mensagem "Chave da Anthropic não configurada. Configure em Administração → Integrações." (não um erro genérico/quebrado).

- [ ] **Step 5: Commit final / push** (quando aprovado)

```bash
git push origin feat/dashboard-advogados
```

---

## Notas de implementação
- **Next 16:** `params`/`searchParams` são **Promises** — sempre `await`. Server Actions com `"use server"`; `revalidatePath` de `next/cache`. Conferir `node_modules/next/dist/docs/` se algo divergir.
- **RLS:** clientes/intakes usam o client autenticado (`createSupabaseServerClient`), não o service-role. `can_write()` (sócio/advogado) cobre insert; estagiário só lê (o form de cadastro falhará para estagiário por RLS — aceitável em 1A; tratar UX depois se necessário).
- **Chave da IA:** resolvida por `getSecret("anthropic_api_key")` (painel → env). A triagem falha graciosamente com `AnthropicNotConfiguredError`.
- **Custo/latência:** triagem em `effort: "medium"` + adaptive thinking; ajustável. Para reduzir custo, baixar para `low` ou desabilitar thinking.
- **1B (próximo plano):** `document_templates` + `legal_drafts`/`versions` + engine de geração (streaming via Route Handler `messages.stream().toReadableStream()`) + editor Tiptap + copiar/exportar.
