import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, listIntakesByClient } from "@/lib/data/clients";
import { IntakeList } from "@/components/clientes/IntakeList";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const intakes = await listIntakesByClient(id);

  const contato = [client.email, client.phone].filter(Boolean).join(" · ");

  return (
    <div>
      <Link
        href="/dashboard/clientes"
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        ← Clientes
      </Link>
      <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
        {client.name}
      </h1>
      <p className="mt-1 text-muted">
        {client.type === "pf" ? "Pessoa física" : "Pessoa jurídica"}
        {client.document ? ` · ${client.document}` : ""}
        {contato ? ` · ${contato}` : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/pecas/nova?cliente=${client.id}`}
          className="inline-flex h-11 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Nova peça / triagem
        </Link>
      </div>

      <h2 className="mt-10 font-serif text-xl font-semibold text-ink">
        Triagens
      </h2>
      <div className="mt-4">
        <IntakeList intakes={intakes} clientId={id} />
      </div>
    </div>
  );
}
