import Link from "next/link";
import { listDrafts } from "@/lib/data/drafts";
import { formatDatePtBr, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, { label: string; cls: string }> = {
  rascunho: { label: "Rascunho", cls: "bg-cloud text-muted" },
  em_revisao: { label: "Em revisão", cls: "bg-gold-100 text-gold-700" },
  finalizada: { label: "Finalizada", cls: "bg-green-50 text-green-800" },
};

export default async function PecasPage() {
  const drafts = await listDrafts();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Peças
        </h1>
        <Link
          href="/dashboard/pecas/nova"
          className="inline-flex h-11 shrink-0 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Nova peça
        </Link>
      </div>
      <p className="mt-2 text-muted">
        As peças jurídicas geradas pelo escritório.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {drafts.length === 0 && (
          <p className="text-sm text-muted">
            Nenhuma peça gerada ainda. Faça uma triagem e gere a peça.
          </p>
        )}
        {drafts.map((d) => {
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
                {d.client_name} · atualizada em {formatDatePtBr(d.updated_at)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
