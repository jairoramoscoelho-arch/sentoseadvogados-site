"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { clearSecret, setSecret, KNOWN_KEYS } from "@/lib/settings/store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface IntegrationActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Qual integração foi alvo — a UI usa para mostrar o resultado no card certo. */
  key?: string;
}

const setSchema = z.object({
  key: z.enum(KNOWN_KEYS),
  value: z.string().trim().min(1, "Informe a chave."),
});

const keyOnly = z.object({ key: z.enum(KNOWN_KEYS) });

async function audit(actorId: string, action: string, key: string) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("audit_logs").insert({
      actor_id: actorId,
      action,
      entity: "integration_settings",
      meta: { key },
    });
  } catch {
    // Auditoria nunca deve quebrar a ação principal.
  }
}

export async function setIntegration(
  _prev: IntegrationActionState,
  formData: FormData,
): Promise<IntegrationActionState> {
  const profile = await requireRole(["socio"]);
  const targetKey = String(formData.get("key") ?? "");

  const parsed = setSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString() ?? "form";
      if (!errors[k]) errors[k] = issue.message;
    }
    return { ok: false, message: "Verifique o campo.", errors, key: targetKey };
  }

  try {
    await setSecret(parsed.data.key, parsed.data.value, profile.id);
    await audit(profile.id, "integration.set", parsed.data.key);
    revalidatePath("/dashboard/admin/integracoes");
    return { ok: true, message: "Chave salva e criptografada.", key: parsed.data.key };
  } catch {
    return {
      ok: false,
      message:
        "Não foi possível salvar. Verifique a SETTINGS_ENCRYPTION_KEY no ambiente.",
      key: parsed.data.key,
    };
  }
}

export async function clearIntegration(
  _prev: IntegrationActionState,
  formData: FormData,
): Promise<IntegrationActionState> {
  const profile = await requireRole(["socio"]);
  const parsed = keyOnly.safeParse({ key: formData.get("key") });
  if (!parsed.success) return { ok: false, message: "Integração inválida." };

  try {
    await clearSecret(parsed.data.key);
    await audit(profile.id, "integration.clear", parsed.data.key);
    revalidatePath("/dashboard/admin/integracoes");
    return { ok: true, message: "Override removido.", key: parsed.data.key };
  } catch {
    return { ok: false, message: "Não foi possível remover.", key: parsed.data.key };
  }
}
