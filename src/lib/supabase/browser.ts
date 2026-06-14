import { createBrowserClient } from "@supabase/ssr";

/** Client do Supabase para uso no navegador (Client Components). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
