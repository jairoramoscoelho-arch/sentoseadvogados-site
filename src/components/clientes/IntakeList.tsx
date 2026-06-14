"use client";

import Link from "next/link";
import { formatDatePtBr } from "@/lib/utils";
import { DeleteIntakeButton } from "./DeleteIntakeButton";
import type { Intake } from "@/types/db";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Lista de relatos/triagens de um cliente, cada um com Abrir / Editar / Excluir. */
export function IntakeList({
  intakes,
  clientId,
}: {
  intakes: Intake[];
  clientId: string;
}) {
  if (intakes.length === 0) {
    return (
      <p className="text-sm text-muted">Nenhum relato registrado ainda.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {intakes.map((i) => {
        const t = i.triage as {
          area?: string;
          tipo_peca_sugerido?: string;
        } | null;
        return (
          <div
            key={i.id}
            className="rounded-xl border border-line bg-paper p-4 shadow-soft transition-colors hover:border-green-700/20"
          >
            <p className="text-xs text-muted">{formatDatePtBr(i.created_at)}</p>
            <p className="mt-1 text-sm font-medium text-ink">
              {t?.area
                ? `${cap(t.area)}${t.tipo_peca_sugerido ? ` · ${t.tipo_peca_sugerido}` : ""}`
                : "Triagem pendente"}
            </p>
            {i.raw_text && (
              <p className="mt-1 line-clamp-2 text-sm text-muted">{i.raw_text}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
              <Link
                href={`/dashboard/clientes/${clientId}/relato/${i.id}`}
                className="text-green-700 transition-colors hover:text-green-800"
              >
                Abrir
              </Link>
              <Link
                href={`/dashboard/pecas/nova?intake=${i.id}`}
                className="text-green-700 transition-colors hover:text-green-800"
              >
                Editar
              </Link>
              <DeleteIntakeButton intakeId={i.id} clientId={clientId} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
