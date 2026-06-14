import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, listIntakesByClient } from "@/lib/data/clients";
import { formatDatePtBr } from "@/lib/utils";

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

  return (
    <div>
      <Link
        href="/dashboard/clientes"
        className="text-sm text-muted hover:text-ink"
      >
        ← Clientes
      </Link>
      <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
        {client.name}
      </h1>
      <p className="mt-1 text-muted">
        {client.type === "pf" ? "Pessoa física" : "Pessoa jurídica"}
        {client.document ? ` · ${client.document}` : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/pecas/nova?cliente=${client.id}`}
          className="inline-flex h-11 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white hover:bg-green-800"
        >
          Nova peça / triagem
        </Link>
      </div>

      <h2 className="mt-10 font-serif text-xl font-semibold text-ink">
        Relatos &amp; triagens
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {intakes.length === 0 && (
          <p className="text-sm text-muted">Nenhum relato registrado ainda.</p>
        )}
        {intakes.map((i) => {
          const t = i.triage as {
            area?: string;
            tipo_peca_sugerido?: string;
          } | null;
          return (
            <div
              key={i.id}
              className="rounded-xl border border-line bg-paper p-4 shadow-soft"
            >
              <p className="text-xs text-muted">{formatDatePtBr(i.created_at)}</p>
              <p className="mt-1 text-sm text-ink">
                {t?.area
                  ? `Área: ${t.area} · ${t.tipo_peca_sugerido ?? ""}`
                  : "Triagem pendente"}
              </p>
              {i.raw_text && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{i.raw_text}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
