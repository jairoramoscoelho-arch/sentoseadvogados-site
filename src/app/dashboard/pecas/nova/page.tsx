import { listClients } from "@/lib/data/clients";
import { IntakeStudio } from "@/components/pecas/IntakeStudio";

export const dynamic = "force-dynamic";

export default async function NovaPecaPage({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  const { cliente } = await searchParams;
  const clients = await listClients();
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Nova peça</h1>
      <p className="mt-2 text-muted">Comece pelo relato do cliente — a IA classifica o caso e prepara o caminho da peça.</p>
      <div className="mt-8">
        <IntakeStudio clients={clients} initialClientId={cliente} />
      </div>
    </div>
  );
}
