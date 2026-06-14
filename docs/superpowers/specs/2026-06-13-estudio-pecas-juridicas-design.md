# Estúdio de Peças Jurídicas — Design

> Spec da próxima fase do painel dos advogados do **Sento‑Sé & Advogados Associados** (Salvador/BA).
> Branch: `feat/dashboard-advogados`. Data: 2026‑06‑13.
> Stack base (F0, já entregue): Next.js 16 + React 19 + Tailwind v4 + Supabase (Auth/Postgres/Storage) + Server Actions, RLS por papel, migrações SQL versionadas.

---

## 1. Objetivo

Dar aos advogados associados um **estúdio para produzir peças jurídicas de alta qualidade**, partindo do **relato do cliente** (texto ou voz), enriquecido com **dados reais do processo (DataJud)** e **jurisprudência real dos tribunais**, redigido pelo **Claude Opus 4.8**, revisável num **editor rico**, e entregável por **cópia, DOCX, PDF e e‑mail (Resend)**. Inclui um **painel administrativo** onde o sócio gerencia **integrações (chaves de API)** e **associados**.

O estúdio nasce do **intake**: um cadastro rápido do cliente + a "história" que ele conta. A partir desse relato, uma **triagem por IA** classifica o caso e dispara o resto do fluxo (busca de jurisprudência, sugestão de tipo de peça, geração).

## 2. Decisões (fechadas com o cliente)

| Tema | Decisão |
|---|---|
| Motor de IA | **Claude Opus 4.8** (`@anthropic-ai/sdk`, streaming, adaptive thinking, `effort: high`). |
| Transcrição de voz (STT) | **OpenAI Whisper** como padrão, **plugável** (trocável no painel). |
| Jurisprudência | **Híbrido**: interface `JurisprudenceProvider` + adapters **grátis** (STJ, STF, TJBA, TRT5/TST) **agora**, e adapter **pago plugável** (Escavador/Digesto/"API Brasil") configurável pelo painel **depois**. |
| E‑mail | **Resend** (já é dependência) — corpo + anexo, remetente institucional verificado. |
| Chaves de API | **Híbrido `DB → .env`**: núcleo no `.env`/Vercel como padrão seguro; **override criptografado** gerido pelo sócio no painel. Segredos pagos futuros moram principalmente no painel. |
| Estilo de escrita | **Peças próprias** (o advogado sobe textos → IA extrai guia de estilo e usa como *few-shot*) **+ perfis de autores/doutrinadores seedados**. |
| Entrega | **Studio completo, em sprints** (Sprint 0 → 6). |

## 3. Papéis (já existentes na F0)

- `socio` — acesso total + **admin** (integrações, usuários). Sócio principal: `jairo.ramoscoelho@gmail.com`.
- `advogado` — usa o estúdio integralmente (intake, geração, export, e‑mail).
- `estagiario` — uso assistido (cria rascunhos; restrições de exclusão/envio conforme RLS existente `can_write`).

## 4. Arquitetura

Reusa integralmente a fundação F0 (Supabase, RLS, Server Actions, design tokens verde/dourado). Nada de portal do cliente — é interno ao escritório.

### 4.1. Rotas (App Router, `src/app/dashboard/`)

```
/dashboard/pecas                      # lista de peças (legal_drafts) — TanStack Table
/dashboard/pecas/nova                 # intake → triagem → estúdio (fluxo guiado)
/dashboard/pecas/[id]                 # editor + jurisprudência + export/e-mail
/dashboard/clientes                   # CRUD de clientes (hoje stub)
/dashboard/clientes/[id]              # ficha do cliente + casos + relatos
/dashboard/casos                      # CRUD de casos (hoje stub)
/dashboard/casos/[id]                 # caso + DataJud (dados + andamentos)
/dashboard/estilos                    # estilos de escrita (peças próprias + autores)
/dashboard/admin/usuarios             # gestão de associados (sócio)  [já linkado na sidebar]
/dashboard/admin/integracoes          # chaves de API (sócio)         [novo]
```

Novo item na sidebar: **"Peças"** (ícone `FileText`) e **"Estilos"** (ícone `PenLine`). "Integrações" entra no bloco admin (sócio).

### 4.2. Camadas de serviço (`src/lib/`)

```
src/lib/
  ai/
    anthropic.ts        # factory do cliente Claude (resolve chave DB→env); streaming helpers
    drafting.ts         # buildSystemPrompt + generateDraft (streaming) por tipo de peça
    triage.ts           # história → classificação estruturada (output_config.format)
    style.ts            # extrai "guia de estilo" de peças enviadas pelo advogado
    prompts/            # system prompts + diretrizes por tipo de peça e por área
  stt/
    transcribe.ts       # interface STTProvider + provider Whisper (OpenAI); plugável
  datajud/
    client.ts           # consulta Elasticsearch público por tribunal (chave já no .env)
    map.ts              # resposta DataJud → campos do caso + process_movements
  jurisprudence/
    provider.ts         # interface JurisprudenceProvider + registry
    providers/{stj,stf,tjba,trt5,escavador}.ts
    search.ts           # orquestra multi-fonte + dedup + cache + filtro por relator/órgão
  settings/
    store.ts            # get/set credenciais; resolução DB→env; status mascarado
    crypto.ts           # AES-256-GCM (chave em SETTINGS_ENCRYPTION_KEY)
  export/
    docx.ts             # editor → DOCX
    pdf.ts              # editor → PDF (serverless)
  email.ts              # (existente) estendido p/ enviar peça com anexo via Resend
```

## 5. Modelo de dados (migrações aditivas)

Cada sprint entrega sua migração SQL versionada em `supabase/migrations/`, aplicada por `npm run db:migrate`. RLS em todas as tabelas, reaproveitando os helpers existentes (`is_member`, `is_socio`, `can_write`, `app_role`).

**`integration_settings`** (Sprint 0) — credenciais geridas pelo sócio.
- `key text primary key` (ex.: `anthropic_api_key`, `openai_api_key`, `escavador_api_key`, `resend_api_key`).
- `value_encrypted text not null` (IV + authTag + ciphertext, base64).
- `updated_by uuid`, `updated_at timestamptz`.
- **RLS: nega tudo a `authenticated`.** Todo acesso é server-side via service role; o painel usa Server Action que checa `is_socio()` e devolve apenas **status mascarado** (`key`, `is_set`, `updated_at`).

**`document_templates`** (Sprint 1) — tipos de peça (ver §11). `id`, `key`, `name`, `area` (slug das áreas do escritório), `category` (inicial/recurso/resposta/extrajudicial/parecer), `structure jsonb` (seções), `prompt_guidance text`, `active bool`, `is_builtin bool`. Seedada; sócio pode acrescentar.

**`legal_drafts`** (Sprint 1) — a peça.
- `id`, `client_id` (req.), `case_id` (opcional), `template_id`, `title`, `status` enum `draft_status` (`rascunho`,`em_revisao`,`finalizada`), `content_html text`, `model_used text`, `style_id` (opcional), `created_by`, `assigned_to`, timestamps, `deleted_at`.

**`legal_draft_versions`** (Sprint 1) — histórico.
- `id`, `draft_id`, `version_no int`, `content_html`, `origin` (`geracao`|`edicao`|`regeneracao`), `created_by`, `created_at`, `note`.

**`intakes`** (Sprint 1) — o relato e a triagem.
- `id`, `client_id`, `case_id` (opcional), `raw_text text` (história digitada), `audio_path text` (Storage, quando voz), `transcript text`, `triage jsonb` (saída estruturada da IA: `area`, `natureza`, `teses[]`, `tipo_peca_sugerido`, `jurisprudence_queries[]`, `partes`, `resumo`), `created_by`, `created_at`.

**`cases` (extensão, Sprint 2)** — `datajud jsonb`, `datajud_synced_at timestamptz`. Andamentos continuam em `process_movements` (já existe).

**`jurisprudence_results`** (Sprint 3) — cache de julgados.
- `id`, `source` (`stj`|`stf`|`tjba`|`trt5`|`escavador`), `tribunal`, `orgao_julgador`, `relator`, `ementa text`, `inteiro_teor_url text`, `decision_date date`, `query text`, `raw jsonb`, `fetched_at`.

**`draft_jurisprudence`** (Sprint 3) — junção peça↔julgado selecionado. `draft_id`, `jurisprudence_id`, `relevance int`, `included bool`.

**`writing_styles`** (Sprint 6) — estilos. `id`, `name`, `type` (`autor`|`proprio`), `area` (opcional), `style_guide text` (extraído/curado), `owner_id` (null = compartilhado), `created_by`, `created_at`.

**`writing_style_samples`** (Sprint 6) — exemplos. `id`, `style_id`, `content text` (ou `storage_path`), `source`.

Novos buckets de Storage privados: `intake-audio` (áudios do relato) e `style-samples` (peças enviadas para estilo) — RLS análoga ao bucket `case-documents`.

## 6. Fluxos principais

### 6.1. Intake → triagem (Sprint 1; voz na Sprint 1.5)
1. Advogado abre `/dashboard/pecas/nova`. Cadastra/seleciona o **cliente** (form rápido: nome, tipo PF/PJ, documento, contato).
2. **Conta a história**: digita o relato **ou** grava por voz (MediaRecorder → upload `intake-audio` → `stt/transcribe.ts` (Whisper) → transcript).
3. **Triagem por IA** (`ai/triage.ts`): Claude lê o relato e retorna saída **estruturada** (`output_config.format` json_schema): área, natureza, teses possíveis, tipo de peça sugerido, *queries* de jurisprudência, partes, resumo. Persistida em `intakes.triage`.
4. O advogado confirma/ajusta a triagem → nasce o **caso** (e o rascunho).

### 6.2. Enriquecimento DataJud (Sprint 2)
- Se o caso tem nº de processo, `datajud/client.ts` consulta o Elasticsearch público do tribunal correto (TJBA, TRT5, STJ, STF…), e `map.ts` preenche **partes, classe, assunto, órgão julgador** e popula `process_movements`. Falha não bloqueia: degradação graciosa.

### 6.3. Jurisprudência (Sprint 3)
- `jurisprudence/search.ts` roda as *queries* da triagem nos providers ativos, faz dedup e cacheia em `jurisprudence_results`. O advogado **seleciona** os julgados relevantes (vão para `draft_jurisprudence`).
- **Perfil do julgador (ponto 2 do cliente):** quando há órgão julgador/relator (via DataJud), a busca filtra **pelos julgados daquele relator/câmara/turma** na matéria, para alinhar o recurso ao que aquele julgador costuma acolher.

### 6.4. Geração (Sprint 1; reforçada nas seguintes)
- `ai/drafting.ts` monta o system prompt (papel de redator forense; estrutura da peça pelo `document_template`; **requisitos legais** — ex. art. 319 CPC na inicial; o que os julgadores valorizam: subsunção fato‑norma clara, pedidos certos, citações corretas) e injeta: triagem + dados DataJud + jurisprudência selecionada + perfil do julgador + **estilo de escrita** escolhido. Gera em **streaming** (`max_tokens` ~64000) direto no editor. **Disclaimer obrigatório** de revisão humana.

### 6.5. Edição → entrega (Sprints 1 e 4)
- Editor **Tiptap** (conteúdo HTML; versionado em `legal_draft_versions`).
- **Copiar** (rich text), **DOCX** (`export/docx.ts`), **PDF** (`export/pdf.ts`, serverless — `@react-pdf/renderer` recomendado; Puppeteer/Chromium como alternativa de fidelidade), **E‑mail** (Resend, corpo + anexo).

## 7. Integrações externas & settings store

- **Resolução de credenciais (`settings/store.ts`)**: ao precisar de uma chave, lê `integration_settings` (decifra server-side) → se ausente, cai no `process.env`. Um provider de jurisprudência/STT está "disponível" se a chave estiver setada em **qualquer** das duas fontes.
- **Criptografia (`settings/crypto.ts`)**: AES‑256‑GCM, chave‑mestra `SETTINGS_ENCRYPTION_KEY` (32 bytes, base64) no `.env`. Armazena `iv:authTag:ciphertext`. Alternativa considerada: Supabase Vault (pgsodium) — adiada por simplicidade/portabilidade.
- **Painel `/dashboard/admin/integracoes`**: lista chaves conhecidas, mostra status mascarado (`•••• configurada` / `não configurada`), permite setar/rotacionar/limpar (Server Action, service role, após `is_socio()`). Nunca devolve o valor ao navegador.
- **DataJud**: chave já no `.env` (`DATAJUD_API_KEY`); endpoints públicos por tribunal.
- **Whisper/OpenAI**: chave `openai_api_key` (painel ou `.env`). STT isolado da camada Claude — sem conflito de provider (a Anthropic não transcreve áudio).

## 8. Segurança / LGPD

- A **história do cliente** é dado sensível: trafega para o STT (Whisper) e para a Anthropic. Registrar **nota de tratamento + consentimento** no intake; avaliar retenção/anonimização com o cliente antes de produção.
- Segredos **sempre criptografados** no DB (nunca texto puro); `integration_settings` inacessível ao cliente; leitura/decifra só no servidor.
- Scraping de jurisprudência: **rate-limit + cache + respeito a robots**; **JusBrasil fora** (ToS/bloqueio). Adapters próprios só para STJ/STF/TJBA/TRT5.
- **Auditoria** (`audit_logs`, já existe) em: gerar, regenerar, exportar, enviar e-mail, alterar integrações, criar usuário.
- Disclaimer de revisão humana visível em toda peça gerada ("a IA pode errar citações; confira antes de protocolar").

## 9. Tratamento de erros

- Streaming com timeouts/retry do SDK; tratar `stop_reason: "refusal"`; `max_tokens` alto + streaming para peças longas.
- DataJud e jurisprudência são **opcionais ao gerar**: falha → gera sem o enriquecimento e avisa.
- STT: se falhar/indisponível, cai para entrada por texto.
- Export PDF/DOCX e e‑mail com erros tratados e mensagens claras.

## 10. Testes

- Vitest (a instalar) para: `settings/crypto` (round-trip e resolução DB→env), `triage` (validação do schema de saída), mapeamento DataJud, dedup de jurisprudência, montagem do prompt. Testes de integração leves nos Server Actions críticos.

## 11. Tipos de peça seedados (alinhados às áreas do escritório)

Trabalhista, Cível, Consumidor, Médico/Saúde — exemplos do advogado mapeiam aqui (trabalhador lesado → Trabalhista; voo/fraude de cartão → Consumidor; etc.).

- **Petição inicial** (cível/consumidor/trabalhista) — requisitos do art. 319 CPC / 840 CLT.
- **Contestação / Defesa**.
- **Réplica**.
- **Recurso** (Apelação; Recurso Ordinário trabalhista; Recurso Especial/Extraordinário) — foco do ponto 2 (alinhar ao julgador).
- **Agravo de Instrumento**.
- **Embargos de Declaração**.
- **Contrarrazões**.
- **Notificação extrajudicial**.
- **Minuta/Parecer livre** (estrutura aberta).

Sócio pode acrescentar tipos pelo painel (futuro).

## 12. Estilos de escrita (ponto 3)

- **Peças próprias**: advogado sobe textos (`style-samples`); `ai/style.ts` extrai um **guia de estilo** (tom, vocabulário, estrutura) e guarda trechos como *few-shot*. Ao gerar, o estilo escolhido entra no prompt.
- **Autores seedados**: alguns perfis de doutrinadores/autores por área, com `style_guide` curado; Claude aproxima o tom.
- Seleção de estilo é **por peça** (campo `legal_drafts.style_id`).

## 13. Variáveis de ambiente novas

```
ANTHROPIC_API_KEY=            # núcleo (override pelo painel possível)
SETTINGS_ENCRYPTION_KEY=      # 32 bytes base64 — cifra de integration_settings
OPENAI_API_KEY=               # Whisper (override pelo painel possível)
# (futuro, plugável pelo painel) ESCAVADOR_API_KEY / DIGESTO_API_KEY / etc.
```

## 14. Roteiro de Sprints

> Cada sprint vira um plano de implementação próprio (writing-plans) e um conjunto de migrações.

- **Sprint 0 — Fundação de integrações & admin**
  - `integration_settings` + `settings/crypto` + `settings/store` (resolução DB→env).
  - `/dashboard/admin/integracoes` (status mascarado, set/rotacionar) — sócio.
  - `/dashboard/admin/usuarios`: criar/gerir associados in-app (Server Action, service role).
  - Instalar `@anthropic-ai/sdk`; adicionar `ANTHROPIC_API_KEY` + `SETTINGS_ENCRYPTION_KEY` + `OPENAI_API_KEY` ao `.env.local`.
  - **Fix**: `.env.local` tem `supabase_db_url` (minúsculo) mas `scripts/db-migrate.mjs` lê `SUPABASE_DB_URL` — padronizar.

- **Sprint 1 — Núcleo: intake (texto) + triagem + clientes/casos + geração + editor**
  - CRUD de clientes e casos (hoje stubs).
  - `document_templates` (seed), `legal_drafts`, `legal_draft_versions`, `intakes`.
  - `ai/anthropic`, `ai/triage` (saída estruturada), `ai/drafting` (streaming) + prompts.
  - Estúdio `/dashboard/pecas/nova` → editor Tiptap em `/dashboard/pecas/[id]` + **copiar**. **Entrega o valor central.**

- **Sprint 1.5 — Voz no intake**
  - MediaRecorder + bucket `intake-audio` + `stt/transcribe` (Whisper) → transcript → triagem.

- **Sprint 2 — DataJud**
  - `datajud/client` + `map`; auto-preenchimento de dados do processo + andamentos na ficha do caso e no intake.

- **Sprint 3 — Jurisprudência (híbrida) + perfil do julgador**
  - Interface `JurisprudenceProvider` + adapters grátis (STJ, STF, TJBA, TRT5) + adapter pago plugável (Escavador) via settings.
  - Busca/seleção no estúdio; filtro por relator/órgão; injeção dos precedentes e do perfil do julgador no prompt.

- **Sprint 4 — Exportação + E‑mail**
  - DOCX, PDF (serverless) e envio via Resend (corpo + anexo). Status e auditoria de export/envio.

- **Sprint 5 — Polimento (impeccable)**
  - UX/visual do estúdio (skill *impeccable*), acessibilidade, estados de streaming/carregamento, estados vazios, responsivo. Testes onde fizer sentido.

- **Sprint 6 — Estilos de escrita**
  - `writing_styles` + `writing_style_samples` + bucket `style-samples`; upload de peças próprias + `ai/style`; autores seedados; seleção de estilo por peça.

## 15. Notas de implementação

- **Next 16 deste projeto difere do conhecido** (ver `AGENTS.md`): consultar `node_modules/next/dist/docs/` antes de escrever código de cada sprint.
- Seguir os padrões da F0: Server Components + Server Actions, RLS, `force-dynamic` no dashboard, design tokens (`paper`/`cloud`/`ink`/`muted`/`line`, verde/dourado, Fraunces+Inter).
- Claude: adaptive thinking + `effort: high`, streaming, `output_config.format` para a triagem, `max_tokens` ~64000 nas peças.

## 16. Riscos / questões em aberto

- **Cobertura de jurisprudência grátis** (TJBA/TRT5 por scraping) é parcial e frágil — mitigada pela arquitetura plugável (paga depois).
- **LGPD**: confirmar com o cliente a política de retenção/consentimento antes de produção.
- **PDF serverless**: validar `@react-pdf/renderer` vs Chromium na Sprint 4 conforme fidelidade necessária.
- **Remetente Resend**: depende de domínio próprio + verificação (pendência de conteúdo já registrada na memória do projeto).
