"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createClientAction,
  type ClientActionState,
} from "@/app/dashboard/clientes/actions";

const initial: ClientActionState = {};

const fieldBase =
  "w-full rounded-lg border bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1";

const fieldClass = (e?: boolean) =>
  cn(fieldBase, e ? "border-red-400" : "border-line focus:border-green-700/40");

export function ClientForm() {
  const [state, action, pending] = useActionState(createClientAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  const err = state.errors ?? {};

  return (
    <form
      ref={ref}
      action={action}
      noValidate
      className="flex h-fit flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft"
    >
      <p className="font-serif text-lg font-semibold text-ink">Novo cliente</p>

      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium",
            state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
          Nome / Razão social
        </label>
        <input
          id="name"
          name="name"
          className={fieldClass(Boolean(err.name))}
          aria-invalid={err.name ? true : undefined}
        />
        {err.name && <p className="mt-1.5 text-xs text-red-600">{err.name}</p>}
      </div>

      <div>
        <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-ink">
          Tipo
        </label>
        <select id="type" name="type" defaultValue="pf" className={fieldClass()}>
          <option value="pf">Pessoa física</option>
          <option value="pj">Pessoa jurídica</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="document"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          CPF / CNPJ
        </label>
        <input id="document" name="document" className={fieldClass()} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={fieldClass(Boolean(err.email))}
        />
        {err.email && <p className="mt-1.5 text-xs text-red-600">{err.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
          Telefone
        </label>
        <input id="phone" name="phone" className={fieldClass()} />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className={cn(fieldClass(), "resize-y")}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-7 text-sm font-medium text-white transition duration-200 ease-out hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {pending ? "Salvando…" : "Cadastrar cliente"}
      </button>
    </form>
  );
}
