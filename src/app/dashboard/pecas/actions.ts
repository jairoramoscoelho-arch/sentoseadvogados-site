"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClient, getIntake } from "@/lib/data/clients";
import { getDraft, listVersionNumbers } from "@/lib/data/drafts";
import { computeNextVersionNo } from "@/lib/data/version";
import { TriageSchema } from "@/lib/ai/triage";
import { STUDIO_MODEL } from "@/lib/ai/anthropic";

const createSchema = z.object({
  intakeId: z.string().uuid(),
  styleAuthors: z.array(z.string()).default([]),
  styleInstruction: z.string().max(2000).optional(),
  tipo: z.string().max(120).optional(),
});

export async function createDraftFromIntake(formData: FormData): Promise<void> {
  const profile = await requireSession();
  const parsed = createSchema.safeParse({
    intakeId: formData.get("intakeId"),
    styleAuthors: formData.getAll("styleAuthors").map((v) => String(v)),
    styleInstruction: (formData.get("styleInstruction") as string) || undefined,
    tipo: (formData.get("tipo") as string) || undefined,
  });
  if (!parsed.success) redirect("/dashboard/pecas");

  const intake = await getIntake(parsed.data.intakeId);
  if (!intake) redirect("/dashboard/pecas");

  const triage = TriageSchema.safeParse(intake.triage);
  const client = await getClient(intake.client_id);
  const tipo =
    parsed.data.tipo?.trim() ||
    (triage.success ? triage.data.tipo_peca_sugerido : "Peça jurídica");
  const title = `${tipo}${client ? ` — ${client.name}` : ""}`;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("legal_drafts")
    .insert({
      client_id: intake.client_id,
      case_id: intake.case_id,
      intake_id: intake.id,
      tipo: parsed.data.tipo?.trim() || null,
      style_authors: parsed.data.styleAuthors,
      style_instruction:
        parsed.data.styleAuthors.length > 0
          ? null
          : parsed.data.styleInstruction ?? null,
      title,
      status: "rascunho",
      model_used: STUDIO_MODEL,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error || !data) redirect(`/dashboard/clientes/${intake.client_id}`);

  redirect(`/dashboard/pecas/${data.id}?intake=${parsed.data.intakeId}`);
}

export interface SaveDraftState {
  ok?: boolean;
  message?: string;
}

const saveSchema = z.object({
  draftId: z.string().uuid(),
  contentHtml: z.string().min(1),
  status: z.enum(["rascunho", "em_revisao", "finalizada"]).optional(),
  origin: z.enum(["geracao", "edicao", "regeneracao"]).default("edicao"),
  note: z.string().optional(),
});

export async function saveDraft(
  _prev: SaveDraftState,
  formData: FormData,
): Promise<SaveDraftState> {
  const profile = await requireSession();
  const parsed = saveSchema.safeParse({
    draftId: formData.get("draftId"),
    contentHtml: formData.get("contentHtml"),
    status: formData.get("status") || undefined,
    origin: formData.get("origin") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const supabase = await createSupabaseServerClient();
  const update: Record<string, unknown> = { content_html: parsed.data.contentHtml };
  if (parsed.data.status) update.status = parsed.data.status;
  const { error: upErr } = await supabase
    .from("legal_drafts")
    .update(update)
    .eq("id", parsed.data.draftId);
  if (upErr) return { ok: false, message: "Não foi possível salvar a peça." };

  const versionNo = computeNextVersionNo(await listVersionNumbers(parsed.data.draftId));
  const { error: vErr } = await supabase.from("legal_draft_versions").insert({
    draft_id: parsed.data.draftId,
    version_no: versionNo,
    content_html: parsed.data.contentHtml,
    origin: parsed.data.origin,
    created_by: profile.id,
    note: parsed.data.note ?? null,
  });

  revalidatePath(`/dashboard/pecas/${parsed.data.draftId}`);

  // Salvar manual (não a gravação automática pós-geração) → volta à ficha do cliente.
  if (parsed.data.origin !== "geracao") {
    const draft = await getDraft(parsed.data.draftId);
    if (draft) redirect(`/dashboard/clientes/${draft.client_id}`);
  }

  if (vErr) {
    // Corrida benigna no version_no (unique) — o conteúdo já foi salvo.
    return { ok: true, message: "Peça salva (recarregue para o histórico)." };
  }
  return { ok: true, message: "Peça salva." };
}
