import { getProfile } from "@/lib/auth/dal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UsersTable, type UserRow } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const me = await getProfile();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, email, role, active, created_at")
    .order("created_at", { ascending: true });

  const users = (data ?? []) as UserRow[];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Usuários
      </h1>
      <p className="mt-2 text-muted">
        Cadastre e gerencie os advogados associados do escritório.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <CreateUserForm />
        <UsersTable users={users} currentUserId={me?.id ?? ""} />
      </div>
    </div>
  );
}
