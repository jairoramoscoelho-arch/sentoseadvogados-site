import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client do Supabase para uso no servidor (Server Components, Server Actions,
 * Route Handlers). Lê/grava a sessão nos cookies. `cookies()` é async no Next 16.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component (cookies somente-leitura):
            // ignorável — o proxy.ts é responsável por renovar a sessão.
          }
        },
      },
    },
  );
}
