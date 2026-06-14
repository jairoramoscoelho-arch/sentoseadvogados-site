"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { triageStory, TriageSchema, type TriageResult } from "@/lib/ai/triage";
import { AnthropicNotConfiguredError } from "@/lib/ai/anthropic";

export interface TriageActionState {
  ok?: boolean;
  message?: string;
  result?: TriageResult;
  story?: string;
  clientId?: string;
}

const runSchema = z.object({
  clientId: z.string().uuid("Selecione um cliente."),
  story: z
    .string()
    .trim()
    .min(20, "Descreva a história com ao menos 20 caracteres."),
});

export async function runTriage(
  _prev: TriageActionState,
  formData: FormData,
): Promise<TriageActionState> {
  await requireSession();
  const parsed = runSchema.safeParse({
    clientId: formData.get("clientId"),
    story: formData.get("story"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  try {
    const result = await triageStory(parsed.data.story);
    return { ok: true, result, story: parsed.data.story, clientId: parsed.data.clientId };
  } catch (e) {
    if (e instanceof AnthropicNotConfiguredError) {
      return { ok: false, message: e.message };
    }
    return { ok: false, message: "Falha ao rodar a triagem. Tente novamente." };
  }
}

export interface SaveIntakeState {
  ok?: boolean;
  message?: string;
}

const saveSchema = z.object({
  clientId: z.string().uuid(),
  story: z.string().trim().min(1),
  triage: z.string().min(2), // JSON serializado
  intakeId: z.string().uuid(), // id gerado no cliente (create) ou existente (edit)
  mode: z.enum(["create", "edit"]),
});

export async function saveIntake(
  _prev: SaveIntakeState,
  formData: FormData,
): Promise<SaveIntakeState> {
  const profile = await requireSession();
  const parsed = saveSchema.safeParse({
    clientId: formData.get("clientId"),
    story: formData.get("story"),
    triage: formData.get("triage"),
    intakeId: formData.get("intakeId"),
    mode: formData.get("mode"),
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  let triage: TriageResult;
  try {
    triage = TriageSchema.parse(JSON.parse(parsed.data.triage));
  } catch {
    return { ok: false, message: "Triagem inválida." };
  }

  const supabase = await createSupabaseServerClient();

  if (parsed.data.mode === "edit") {
    const { error } = await supabase
      .from("intakes")
      .update({ raw_text: parsed.data.story, triage })
      .eq("id", parsed.data.intakeId);
    if (error) return { ok: false, message: "Não foi possível salvar as alterações." };
  } else {
    // Idempotente: o id vem do cliente; um eventual clique/submit duplicado
    // cai em ON CONFLICT DO NOTHING e NÃO cria um segundo relato.
    const { error } = await supabase.from("intakes").upsert(
      {
        id: parsed.data.intakeId,
        client_id: parsed.data.clientId,
        raw_text: parsed.data.story,
        triage,
        created_by: profile.id,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) return { ok: false, message: "Não foi possível salvar o relato." };
  }

  revalidatePath(`/dashboard/clientes/${parsed.data.clientId}`);
  // Leva à visão do relato salvo (fecha o loop e impede re-salvar a mesma tela).
  redirect(`/dashboard/clientes/${parsed.data.clientId}/relato/${parsed.data.intakeId}`);
}
