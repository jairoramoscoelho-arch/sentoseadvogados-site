"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createUser,
  type UserActionState,
} from "@/app/dashboard/admin/usuarios/actions";

const initial: UserActionState = {};

const fieldBase =
  "w-full rounded-lg border bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1";

function fieldClass(hasError?: boolean) {
  return cn(
    fieldBase,
    hasError ? "border-red-400" : "border-line focus:border-green-700/40",
  );
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const err = state.errors ?? {};

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="flex h-fit flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft"
    >
      <p className="font-serif text-lg font-semibold text-ink">Novo associado</p>

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

      <Field label="Nome completo" name="full_name" error={err.full_name} />
      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="off"
        error={err.email}
      />
      <Field
        label="Senha provisória"
        name="password"
        type="password"
        autoComplete="new-password"
        error={err.password}
      />

      <div>
        <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-ink">
          Papel
        </label>
        <select
          id="role"
          name="role"
          defaultValue="advogado"
          className={fieldClass()}
        >
          <option value="advogado">Advogado</option>
          <option value="estagiario">Estagiário</option>
          <option value="socio">Sócio</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-7 text-sm font-medium text-white transition duration-200 ease-out hover:bg-green-800 motion-safe:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {pending ? "Criando…" : "Criar associado"}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}

function Field({ label, name, type = "text", autoComplete, error }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={fieldClass(Boolean(error))}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
