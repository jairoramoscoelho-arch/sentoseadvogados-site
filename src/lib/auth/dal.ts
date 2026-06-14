import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "socio" | "advogado" | "estagiario";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  oab: string | null;
  email: string | null;
  avatar_url: string | null;
  active: boolean;
}

/** Usuário autenticado (ou null). Memoizado por requisição. */
export const getUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Perfil (profiles) do usuário autenticado, com papel. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, oab, email, avatar_url, active")
    .eq("id", user.id)
    .single();
  return (data as Profile | null) ?? null;
});

/** Exige sessão ativa; redireciona para /login caso contrário. */
export async function requireSession(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || !profile.active) redirect("/login");
  return profile;
}

/** Exige um dos papéis informados; redireciona para /dashboard se não tiver. */
export async function requireRole(roles: Role[]): Promise<Profile> {
  const profile = await requireSession();
  if (!roles.includes(profile.role)) redirect("/dashboard");
  return profile;
}
