import { listClients, getIntake } from "@/lib/data/clients";
import { IntakeStudio } from "@/components/pecas/IntakeStudio";
import type { TriageResult } from "@/lib/ai/triage";

export const dynamic = "force-dynamic";

export default async function NovaPecaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; intake?: string }>;
}) {
  const { cliente, intake } = await searchParams;
  const clients = await listClients();

  let edit: {
    intakeId: string;
    initialClientId: string;
    initialStory: string;
    initialResult?: TriageResult;
  } | null = null;

  if (intake) {
    const existing = await getIntake(intake);
    if (existing) {
      edit = {
        intakeId: existing.id,
        initialClientId: existing.client_id,
        initialStory: existing.raw_text ?? "",
        initialResult: (existing.triage as TriageResult) ?? undefined,
      };
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        {edit ? "Editar relato" : "Nova triagem"}
      </h1>
      <p className="mt-2 text-muted">
        {edit
          ? "Ajuste a história e refaça a triagem se quiser — as alterações atualizam este relato."
          : "Comece pelo relato do cliente — a IA classifica o caso e prepara o caminho da peça."}
      </p>
      <div className="mt-8">
        {edit ? (
          <IntakeStudio
            clients={clients}
            mode="edit"
            intakeId={edit.intakeId}
            initialClientId={edit.initialClientId}
            initialStory={edit.initialStory}
            initialResult={edit.initialResult}
          />
        ) : (
          <IntakeStudio clients={clients} initialClientId={cliente} />
        )}
      </div>
    </div>
  );
}
