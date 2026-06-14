"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, type LoginState } from "./actions";

const initial: LoginState = {};

const fieldClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:border-green-700/40 focus:outline-none focus:ring-2 focus:ring-gold-500";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <div className="rounded-2xl bg-paper p-8 shadow-lift">
      <h1 className="font-serif text-2xl font-semibold text-ink">
        Acesso da equipe
      </h1>
      <p className="mt-1 text-sm text-muted">
        Área restrita aos advogados do escritório.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
        {state.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {state.error}
          </p>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-7 text-sm font-medium text-white transition duration-200 ease-out hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
