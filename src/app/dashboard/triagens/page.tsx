import Link from "next/link";
import { listOpenIntakes } from "@/lib/data/clients";
import { formatDatePtBr } from "@/lib/utils";

export const dynamic = "force-dynamic";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function TriagensPage() {
  // Apenas triagens que ainda não viraram peça — ao gerar a peça, ela sai daqui.
  const intakes = await listOpenIntakes(100);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Triagens
        </h1>
        <Link
          href="/dashboard/pecas/nova"
          className="inline-flex h-11 shrink-0 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Nova triagem
        </Link>
      </div>
      <p className="mt-2 text-muted">
        Atendimentos: a história do cliente e o diagnóstico da IA (área, teses,
        tipo de peça e documentos a coletar).
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {intakes.length === 0 && (
          <p className="text-sm text-muted">
            Nenhuma triagem ainda. Comece em &ldquo;Nova triagem&rdquo;.
          </p>
        )}
        {intakes.map((i) => {
          const t = i.triage as {
            area?: string;
            tipo_peca_sugerido?: string;
          } | null;
          return (
            <Link
              key={i.id}
              href={`/dashboard/clientes/${i.client_id}/relato/${i.id}`}
              className="rounded-xl border border-line bg-paper p-4 shadow-soft transition-colors hover:border-green-700/20"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-ink">{i.client_name}</p>
                <p className="shrink-0 text-xs text-muted">
                  {formatDatePtBr(i.created_at)}
                </p>
              </div>
              <p className="mt-1 text-sm text-ink">
                {t?.area
                  ? `${cap(t.area)}${t.tipo_peca_sugerido ? ` · ${t.tipo_peca_sugerido}` : ""}`
                  : "Triagem pendente"}
              </p>
              {i.raw_text && (
                <p className="mt-1 line-clamp-1 text-sm text-muted">{i.raw_text}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
