import { listClients, listRecentIntakes } from "@/lib/data/clients";
import { NovaPecaWizard } from "@/components/pecas/NovaPecaWizard";

export const dynamic = "force-dynamic";

export default async function CriarPecaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const [clients, intakes] = await Promise.all([
    listClients(),
    listRecentIntakes(200),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Nova peça
      </h1>
      <p className="mt-2 text-muted">
        Escolha o tipo, o cliente e a triagem que embasa a peça — depois o estilo
        e gere.
      </p>
      <div className="mt-8">
        <NovaPecaWizard
          clients={clients}
          intakes={intakes}
          initialClientId={cliente}
        />
      </div>
    </div>
  );
}
