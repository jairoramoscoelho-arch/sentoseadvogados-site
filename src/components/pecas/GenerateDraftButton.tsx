"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createDraftFromIntake } from "@/app/dashboard/pecas/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-medium text-green-900 transition-colors hover:bg-gold-600 disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? "Criando peça…" : "Gerar peça"}
    </button>
  );
}

/** Cria a peça a partir do relato (intake) e leva ao editor para gerar. */
export function GenerateDraftButton({ intakeId }: { intakeId: string }) {
  return (
    <form action={createDraftFromIntake}>
      <input type="hidden" name="intakeId" value={intakeId} />
      <Submit />
    </form>
  );
}
