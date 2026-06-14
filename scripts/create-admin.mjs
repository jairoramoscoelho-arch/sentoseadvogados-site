import { createClient } from "@supabase/supabase-js";

// Cria um usuário no Supabase Auth (o trigger handle_new_user cria o profile).
// Uso: npm run db:create-admin -- <email> <senha> "[nome]" [papel]
//   papel: socio (padrão) | advogado | estagiario

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [email, password, fullName = "Administrador", role = "socio"] =
  process.argv.slice(2);

if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env.local.");
  process.exit(1);
}
if (!email || !password) {
  console.error(
    'Uso: npm run db:create-admin -- <email> <senha> "[nome]" [socio|advogado|estagiario]',
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName, role },
});

if (error) {
  console.error("Erro ao criar usuário:", error.message);
  process.exit(1);
}

console.log(`Usuário criado: ${email} (${role}) — id ${data.user.id}`);
