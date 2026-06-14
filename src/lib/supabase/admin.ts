import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client do Supabase com a SERVICE ROLE — ignora RLS. Uso EXCLUSIVO no servidor
 * (Server Actions, Server Components, route handlers) para operações que o
 * cliente autenticado não pode fazer (ex.: criar usuários, ler segredos).
 *
 * `import "server-only"` no topo quebra o build se algum Client Component tentar
 * importar este módulo. Nunca exporte a chave nem o client para o navegador.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin: faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no ambiente.",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
