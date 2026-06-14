"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GenerateDraftButton } from "./GenerateDraftButton";
import {
  runTriage,
  saveIntake,
  type TriageActionState,
  type SaveIntakeState,
} from "@/app/dashboard/pecas/nova/actions";
import type { TriageResult } from "@/lib/ai/triage";
import type { Client } from "@/types/db";

const fieldBase =
  "w-full rounded-lg border bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1 border-line focus:border-green-700/40";

interface Props {
  clients: Client[];
  initialClientId?: string;
  /** Edição: id do relato existente. Criação: gerado no cliente (idempotência). */
  intakeId?: string;
  initialStory?: string;
  initialResult?: TriageResult;
  mode?: "create" | "edit";
}

export function IntakeStudio({
  clients,
  initialClientId,
  intakeId,
  initialStory,
  initialResult,
  mode = "create",
}: Props) {
  // Id estável: na criação, gerado uma vez no cliente → salvar é idempotente.
  const [id] = useState(() => intakeId ?? crypto.randomUUID());
  const [triageState, triageAction, triaging] = useActionState(
    runTriage,
    {} as TriageActionState,
  );
  const [saveState, saveAction, saving] = useActionState(
    saveIntake,
    {} as SaveIntakeState,
  );

  const result = triageState.result ?? initialResult ?? null;
  const effClientId = triageState.clientId ?? initialClientId ?? "";
  const effStory = triageState.story ?? initialStory ?? "";
  const clientName = clients.find((c) => c.id === effClientId)?.name;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Passo 1 — relato */}
      <form
        action={triageAction}
        className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft"
      >
        <p className="font-serif text-lg font-semibold text-ink">
          1. Relato do cliente
        </p>
        <div>
          <label
            htmlFor="clientId"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Cliente
          </label>
          {mode === "edit" ? (
            <>
              <p className="rounded-lg border border-line bg-cloud px-4 py-3 text-sm text-ink">
                {clientName ?? "—"}
              </p>
              <input type="hidden" name="clientId" value={initialClientId ?? ""} />
            </>
          ) : (
            <select
              id="clientId"
              name="clientId"
              defaultValue={initialClientId ?? ""}
              className={fieldBase}
              required
            >
              <option value="" disabled>
                Selecione…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label
            htmlFor="story"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            A história, nas palavras do cliente
          </label>
          <textarea
            id="story"
            name="story"
            rows={10}
            required
            defaultValue={initialStory ?? ""}
            placeholder="Ex.: Cliente trabalhou 2 anos sem registro e foi dispensado sem receber verbas…"
            className={cn(fieldBase, "resize-y")}
          />
        </div>
        {triageState.message && !triageState.ok && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {triageState.message}
          </p>
        )}
        <button
          type="submit"
          disabled={triaging}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-7 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {triaging && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {triaging
            ? "Analisando…"
            : result
              ? "Refazer triagem"
              : "Rodar triagem"}
        </button>
      </form>

      {/* Passo 2 — triagem */}
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft">
        <p className="font-serif text-lg font-semibold text-ink">
          2. Triagem (IA)
        </p>
        {!result && (
          <p className="text-sm text-muted">
            Rode a triagem para ver a classificação do caso.
          </p>
        )}
        {result && (
          <>
            <dl className="grid gap-3 text-sm">
              <Item label="Área" value={result.area} />
              <Item label="Natureza" value={result.natureza} />
              <Item label="Resumo" value={result.resumo} />
              <Item
                label="Cliente é"
                value={`${result.partes.cliente_polo} (contra ${result.partes.contraparte})`}
              />
              <Item label="Peça sugerida" value={result.tipo_peca_sugerido} />
              <div>
                <dt className="font-medium text-ink">Teses</dt>
                <ul className="mt-1 list-disc pl-5 text-muted">
                  {result.teses.map((t, i) => (
                    <li key={i}>
                      <span className="text-ink">{t.titulo}</span> — {t.fundamento}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <dt className="font-medium text-ink">Buscas de jurisprudência</dt>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {result.jurisprudence_queries.map((q, i) => (
                    <li
                      key={i}
                      className="rounded-full bg-cloud px-3 py-1 text-xs text-muted"
                    >
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
              {result.observacoes && (
                <Item label="Observações" value={result.observacoes} />
              )}
              {Array.isArray(result.documentos_necessarios) &&
                result.documentos_necessarios.length > 0 && (
                  <div>
                    <dt className="font-medium text-ink">Documentos a coletar</dt>
                    <ul className="mt-1 flex flex-col gap-1.5 text-muted">
                      {result.documentos_necessarios.map((d, i) => (
                        <li key={i}>
                          <span className="text-ink">
                            {d.essencial ? "★ " : "• "}
                            {d.documento}
                          </span>{" "}
                          — {d.motivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </dl>

            {saveState.message && !saveState.ok && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
              >
                {saveState.message}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <form action={saveAction}>
                <input type="hidden" name="clientId" value={effClientId} />
                <input type="hidden" name="story" value={effStory} />
                <input type="hidden" name="triage" value={JSON.stringify(result)} />
                <input type="hidden" name="intakeId" value={id} />
                <input type="hidden" name="mode" value={mode} />
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-green-700 px-6 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {saving
                    ? "Salvando…"
                    : mode === "edit"
                      ? "Salvar alterações"
                      : "Salvar relato + triagem"}
                </button>
              </form>
              {mode === "edit" ? (
                <GenerateDraftButton intakeId={id} area={result.area} />
              ) : (
                <button
                  type="button"
                  disabled
                  title="Salve o relato para gerar a peça"
                  className="inline-flex h-11 cursor-not-allowed items-center rounded-full border border-line px-6 text-sm font-medium text-muted opacity-70"
                >
                  Gerar peça
                </button>
              )}
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
