import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getIntake } from "@/lib/data/clients";
import { formatDatePtBr } from "@/lib/utils";
import { DeleteIntakeButton } from "@/components/clientes/DeleteIntakeButton";
import { GenerateDraftButton } from "@/components/pecas/GenerateDraftButton";
import type { TriageResult } from "@/lib/ai/triage";

export const dynamic = "force-dynamic";

export default async function RelatoPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const [client, intake] = await Promise.all([getClient(id), getIntake(intakeId)]);
  if (!client || !intake || intake.client_id !== id) notFound();

  const t = intake.triage as TriageResult | null;

  return (
    <div className="max-w-3xl">
      <Link
        href={`/dashboard/clientes/${id}`}
        className="text-sm text-muted transition-colors hover:text-ink"
      >
        ← {client.name}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Triagem
          </h1>
          <p className="mt-1 text-muted">{formatDatePtBr(intake.created_at)}</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href={`/dashboard/pecas/nova?intake=${intake.id}`}
            className="text-green-700 transition-colors hover:text-green-800"
          >
            Editar
          </Link>
          <DeleteIntakeButton intakeId={intake.id} clientId={id} />
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-line bg-paper p-5 shadow-soft">
        <h2 className="font-serif text-lg font-semibold text-ink">
          A história do cliente
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
          {intake.raw_text || "—"}
        </p>
      </section>

      {t ? (
        <section className="mt-6 rounded-xl border border-line bg-paper p-5 shadow-soft">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Triagem (IA)
          </h2>
          <dl className="mt-3 grid gap-3 text-sm">
            <Field label="Área" value={t.area} />
            <Field label="Natureza" value={t.natureza} />
            <Field label="Resumo" value={t.resumo} />
            <Field
              label="Cliente é"
              value={`${t.partes.cliente_polo} (contra ${t.partes.contraparte})`}
            />
            <Field label="Peça sugerida" value={t.tipo_peca_sugerido} />
            <div>
              <dt className="font-medium text-ink">Teses</dt>
              <ul className="mt-1 list-disc pl-5 text-muted">
                {t.teses.map((te, i) => (
                  <li key={i}>
                    <span className="text-ink">{te.titulo}</span> — {te.fundamento}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <dt className="font-medium text-ink">Buscas de jurisprudência</dt>
              <ul className="mt-1 flex flex-wrap gap-2">
                {t.jurisprudence_queries.map((q, i) => (
                  <li
                    key={i}
                    className="rounded-full bg-cloud px-3 py-1 text-xs text-muted"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            {t.observacoes && <Field label="Observações" value={t.observacoes} />}
          </dl>
        </section>
      ) : (
        <p className="mt-6 text-sm text-muted">
          Triagem não disponível para este relato.
        </p>
      )}

      <div className="mt-6">
        <GenerateDraftButton intakeId={intake.id} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-ink">{label}</dt>
      <dd className="text-muted">{value}</dd>
    </div>
  );
}
