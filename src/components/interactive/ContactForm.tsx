"use client";

import { useActionState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { submitContact } from "@/app/(marketing)/contato/actions";
import { initialContactState } from "@/lib/contact";

const fieldBase =
  "w-full rounded-lg border bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-500/60";

function fieldClass(hasError?: boolean) {
  return cn(
    fieldBase,
    hasError ? "border-red-400" : "border-line focus:border-green-700/40",
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialContactState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const tsRef = useRef<HTMLInputElement>(null);

  // Marca o instante de carregamento (checagem anti-bot por tempo).
  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
  }, []);

  // Limpa o formulário após o envio bem-sucedido.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      if (tsRef.current) tsRef.current.value = String(Date.now());
    }
  }, [state.ok]);

  const err = state.errors ?? {};

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium",
            state.ok
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </p>
      )}

      {/* Honeypot — invisível para humanos */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Não preencha este campo</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input ref={tsRef} type="hidden" name="_ts" defaultValue="" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nome"
          name="name"
          required
          autoComplete="name"
          error={err.name}
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          error={err.email}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Telefone / WhatsApp"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          error={err.phone}
        />
        <Field label="Assunto" name="subject" error={err.subject} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
          Mensagem <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={err.message ? true : undefined}
          aria-describedby={err.message ? "message-error" : undefined}
          className={cn(fieldClass(Boolean(err.message)), "resize-y")}
        />
        {err.message && (
          <p id="message-error" className="mt-1.5 text-xs text-red-600">
            {err.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-green-700 px-7 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mensagem"}
      </button>

      <p className="text-xs text-muted">
        Ao enviar, você concorda em ser contatado pelo escritório. Não
        compartilhamos seus dados.
      </p>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text";
  error?: string;
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  inputMode,
  error,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
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
