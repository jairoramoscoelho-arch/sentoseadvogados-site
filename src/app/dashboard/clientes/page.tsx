import { listClients } from "@/lib/data/clients";
import { ClientsBrowser } from "@/components/clientes/ClientsBrowser";
import { NewClientModal } from "@/components/clientes/NewClientModal";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await listClients();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Clientes
        </h1>
        <NewClientModal />
      </div>
      <p className="mt-2 text-muted">
        Busque e gerencie os clientes do escritório.
      </p>
      <div className="mt-8">
        <ClientsBrowser clients={clients} />
      </div>
    </div>
  );
}
