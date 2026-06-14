"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface UserActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const createSchema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
  role: z.enum(["socio", "advogado", "estagiario"]),
});

export async function createUser(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await requireRole(["socio"]);

  const parsed = createSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString() ?? "form";
      if (!errors[k]) errors[k] = issue.message;
    }
    return { ok: false, message: "Verifique os campos destacados.", errors };
  }

  // O trigger handle_new_user cria o profile a partir do user_metadata —
  // NÃO inserir em profiles aqui (duplicaria a PK).
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    },
  });

  if (error) {
    const dup = /already|registered|exists|duplicate/i.test(error.message);
    return {
      ok: false,
      message: dup
        ? "Já existe um usuário com esse e-mail."
        : "Não foi possível criar o associado.",
    };
  }

  revalidatePath("/dashboard/admin/usuarios");
  return { ok: true, message: "Associado criado com sucesso." };
}

const toggleSchema = z.object({
  id: z.string().uuid(),
  active: z.enum(["true", "false"]),
});

export async function setUserActive(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const me = await requireRole(["socio"]);

  const parsed = toggleSchema.safeParse({
    id: formData.get("id"),
    active: formData.get("active"),
  });
  if (!parsed.success) return { ok: false, message: "Requisição inválida." };

  // Anti-lockout: o sócio não pode desativar a própria conta.
  if (parsed.data.id === me.id && parsed.data.active === "false") {
    return { ok: false, message: "Você não pode desativar a própria conta." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ active: parsed.data.active === "true" })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, message: "Não foi possível atualizar." };

  revalidatePath("/dashboard/admin/usuarios");
  return { ok: true, message: "Atualizado." };
}
