"use client";

import { useActionState, useState } from "react";
import {
  deleteIntake,
  type DeleteIntakeState,
} from "@/app/dashboard/clientes/actions";

/** Botão de excluir relato com confirmação em dois toques (sem confirm() nativo). */
export function DeleteIntakeButton({
  intakeId,
  clientId,
}: {
  intakeId: string;
  clientId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(
    deleteIntake,
    {} as DeleteIntakeState,
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-red-600 transition-colors hover:text-red-700"
      >
        Excluir
      </button>
    );
  }

  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="intakeId" value={intakeId} />
      <input type="hidden" name="clientId" value={clientId} />
      <span className="text-muted">Excluir relato?</span>
      <button
        type="submit"
        disabled={pending}
        className="text-red-600 transition-colors hover:text-red-700 disabled:opacity-60"
      >
        {pending ? "Excluindo…" : "Confirmar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-muted transition-colors hover:text-ink"
      >
        Cancelar
      </button>
      {state.error && <span className="text-red-600">{state.error}</span>}
    </form>
  );
}
