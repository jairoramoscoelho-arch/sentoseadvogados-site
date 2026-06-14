import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, listOpenIntakesByClient } from "@/lib/data/clients";
import { listDraftsByClient } from "@/lib/data/drafts";
import { IntakeList } from "@/components/clientes/IntakeList";
import { ContactLinks } from "@/components/clientes/ContactLinks";
import { formatDatePtBr, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, { label: string; cls: string }> = {
  rascunho: { label: "Rascunho", cls: "bg-cloud text-muted" },
  em_revisao: { label: "Em revisão", cls: "bg-gold-100 text-gold-700" },
  finalizada: { label: "Finalizada", cls: "bg-green-50 text-green-800" },
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [drafts, intakes] = await Promise.all([
    listDraftsByClient(id),
    listOpenIntakesByClient(id),
  ]);

  return (
    <div>
      <Link
        href="/dashboard/clientes"
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        ← Clientes
      </Link>

      <div className="mt-2 rounded-xl border border-line bg-paper p-5 shadow-soft">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          {client.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {client.type === "pf" ? "Pessoa física" : "Pessoa jurídica"}
          {client.document ? ` · ${client.document}` : ""}
        </p>
        <div className="mt-3">
          <ContactLinks phone={client.phone} email={client.email} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/pecas/nova?cliente=${client.id}`}
          className="inline-flex h-11 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Nova peça / triagem
        </Link>
      </div>

      {/* Peças — documentos gerados, cada um com seu próprio título (não "Triagem"). */}
      <h2 className="mt-10 font-serif text-xl font-semibold text-ink">Peças</h2>
      <div className="mt-4 flex flex-col gap-3">
        {drafts.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhuma peça gerada para este cliente ainda.
          </p>
        ) : (
          drafts.map((d) => {
            const b = statusBadge[d.status] ?? statusBadge.rascunho;
            return (
              <Link
                key={d.id}
                href={`/dashboard/pecas/${d.id}`}
                className="rounded-xl border border-line bg-paper p-4 shadow-soft transition-colors hover:border-green-700/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-ink">{d.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      b.cls,
                    )}
                  >
                    {b.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Atualizada em {formatDatePtBr(d.updated_at)}
                </p>
              </Link>
            );
          })
        )}
      </div>

      {/* Triagens — apenas as que ainda não viraram peça. */}
      <h2 className="mt-10 font-serif text-xl font-semibold text-ink">
        Triagens
      </h2>
      <div className="mt-4">
        <IntakeList intakes={intakes} clientId={id} />
      </div>
    </div>
  );
}
