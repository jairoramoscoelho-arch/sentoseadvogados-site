import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraft } from "@/lib/data/drafts";
import { getClient } from "@/lib/data/clients";
import { DraftEditor } from "@/components/pecas/DraftEditor";

export const dynamic = "force-dynamic";

function statusLabel(s: string) {
  return s === "rascunho"
    ? "Rascunho"
    : s === "em_revisao"
      ? "Em revisão"
      : "Finalizada";
}

export default async function DraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ intake?: string }>;
}) {
  const { id } = await params;
  const { intake } = await searchParams;
  const draft = await getDraft(id);
  if (!draft) notFound();
  const client = await getClient(draft.client_id);

  return (
    <div className="max-w-3xl">
      {client && (
        <Link
          href={`/dashboard/clientes/${client.id}`}
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          ← {client.name}
        </Link>
      )}
      <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
        {draft.title}
      </h1>
      <p className="mt-1 text-muted">Peça jurídica · {statusLabel(draft.status)}</p>

      <div className="mt-8">
        <DraftEditor
          draftId={draft.id}
          initialHtml={draft.content_html ?? ""}
          initialStatus={draft.status}
          intakeId={intake ?? null}
        />
      </div>
    </div>
  );
}
