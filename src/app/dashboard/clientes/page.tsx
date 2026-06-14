import { listClients } from "@/lib/data/clients";
import { ClientForm } from "@/components/clientes/ClientForm";
import { ClientsTable } from "@/components/clientes/ClientsTable";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await listClients();
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Clientes
      </h1>
      <p className="mt-2 text-muted">
        Cadastre e consulte os clientes do escritório.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <ClientForm />
        <ClientsTable clients={clients} />
      </div>
    </div>
  );
}
