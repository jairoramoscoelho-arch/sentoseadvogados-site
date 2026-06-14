"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearIntegration,
  setIntegration,
  type IntegrationActionState,
} from "@/app/dashboard/admin/integracoes/actions";
import type { IntegrationStatus } from "@/lib/settings/store";

const initial: IntegrationActionState = {};

const fieldBase =
  "w-full rounded-lg border bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1";

export function IntegrationForm({ status }: { status: IntegrationStatus }) {
  const [setState, setAction, setPending] = useActionState(
    setIntegration,
    initial,
  );
  const [clearState, clearAction, clearPending] = useActionState(
    clearIntegration,
    initial,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (setState.ok && setState.key === status.key) formRef.current?.reset();
  }, [setState, status.key]);

  const badge =
    status.source === "db"
      ? { text: "configurada (painel)", cls: "bg-green-50 text-green-800" }
      : status.source === "env"
        ? { text: "configurada (.env)", cls: "bg-cloud text-muted" }
        : { text: "não configurada", cls: "bg-cloud text-muted" };

  const result =
    setState.key === status.key && setState.message
      ? setState
      : clearState.key === status.key && clearState.message
        ? clearState
        : null;

  const valueError =
    setState.key === status.key ? setState.errors?.value : undefined;

  return (
    <div className="rounded-xl border border-line bg-paper p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-lg font-semibold text-ink">
            {status.label}
          </p>
          <p className="mt-1 text-sm text-muted">{status.description}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
            badge.cls,
          )}
        >
          •••• {badge.text}
        </span>
      </div>

      {status.updatedAt && (
        <p className="mt-2 text-xs text-muted">
          Atualizada em {new Date(status.updatedAt).toLocaleString("pt-BR")}
        </p>
      )}

      {result?.message && (
        <p
          role={result.ok ? "status" : "alert"}
          className={cn(
            "mt-3 rounded-lg px-3 py-2 text-sm font-medium",
            result.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700",
          )}
        >
          {result.message}
        </p>
      )}

      <form
        ref={formRef}
        action={setAction}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="key" value={status.key} />
        <div className="flex-1">
          <label
            htmlFor={`val-${status.key}`}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            {status.source === "db" ? "Nova chave (rotacionar)" : "Chave"}
          </label>
          <input
            id={`val-${status.key}`}
            name="value"
            type="password"
            autoComplete="off"
            placeholder="cole a chave aqui"
            aria-invalid={valueError ? true : undefined}
            className={cn(
              fieldBase,
              valueError ? "border-red-400" : "border-line focus:border-green-700/40",
            )}
          />
        </div>
        <button
          type="submit"
          disabled={setPending}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-green-700 px-6 text-sm font-medium text-white transition duration-200 ease-out hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {setPending && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {status.source === "db" ? "Rotacionar" : "Salvar"}
        </button>
      </form>

      {status.source === "db" && (
        <form action={clearAction} className="mt-2">
          <input type="hidden" name="key" value={status.key} />
          <button
            type="submit"
            disabled={clearPending}
            className="text-xs font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-60"
          >
            {clearPending ? "Removendo…" : "Remover override do painel"}
          </button>
        </form>
      )}
    </div>
  );
}
