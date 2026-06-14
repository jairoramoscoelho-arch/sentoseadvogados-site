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
