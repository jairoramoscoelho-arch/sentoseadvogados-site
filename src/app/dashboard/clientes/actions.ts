"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireSession } from "@/lib/auth/dal";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ClientActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente."),
  type: z.enum(["pf", "pj"]),
  document: z.string().trim().max(40).optional(),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(4000).optional(),
});

export async function createClientAction(
  _prev: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const profile = await requireSession();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString() ?? "form";
      if (!errors[k]) errors[k] = issue.message;
    }
    return { ok: false, message: "Verifique os campos.", errors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").insert({
    name: parsed.data.name,
    type: parsed.data.type,
    document: parsed.data.document ?? null,
    email: parsed.data.email || null,
    phone: parsed.data.phone ?? null,
    notes: parsed.data.notes ?? null,
    created_by: profile.id,
  });
  if (error) return { ok: false, message: "Não foi possível salvar o cliente." };

  revalidatePath("/dashboard/clientes");
  return { ok: true, message: "Cliente cadastrado." };
}

export interface DeleteIntakeState {
  error?: string;
}

const deleteSchema = z.object({
  intakeId: z.string().uuid(),
  clientId: z.string().uuid(),
});

export async function deleteIntake(
  _prev: DeleteIntakeState,
  formData: FormData,
): Promise<DeleteIntakeState> {
  await requireRole(["socio", "advogado"]);
  const parsed = deleteSchema.safeParse({
    intakeId: formData.get("intakeId"),
    clientId: formData.get("clientId"),
  });
  if (!parsed.success) return { error: "Requisição inválida." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("intakes")
    .delete()
    .eq("id", parsed.data.intakeId);
  if (error) return { error: "Não foi possível excluir o relato." };

  revalidatePath(`/dashboard/clientes/${parsed.data.clientId}`);
  redirect(`/dashboard/clientes/${parsed.data.clientId}`);
}
