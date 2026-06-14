"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createDraftFromIntake } from "@/app/dashboard/pecas/actions";
import { EstiloPeca } from "./EstiloPeca";
import type { TriageArea } from "@/lib/ai/triage";

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

/** Cria a peça a partir do relato (intake), com estilo opcional, e leva ao editor. */
export function GenerateDraftButton({
  intakeId,
  area,
}: {
  intakeId: string;
  area?: TriageArea;
}) {
  return (
    <form
      action={createDraftFromIntake}
      className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 shadow-soft"
    >
      <input type="hidden" name="intakeId" value={intakeId} />
      <EstiloPeca area={area} />
      <Submit />
    </form>
  );
}
