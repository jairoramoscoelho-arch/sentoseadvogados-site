import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Client, Intake } from "@/types/db";

const CLIENT_COLS =
  "id, name, type, document, email, phone, notes, created_by, created_at, updated_at, deleted_at";

export async function listClients(): Promise<Client[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("clients")
    .select(CLIENT_COLS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("clients")
    .select(CLIENT_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data as Client | null) ?? null;
}

export async function listIntakesByClient(clientId: string): Promise<Intake[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("intakes")
    .select(
      "id, client_id, case_id, raw_text, audio_path, transcript, triage, created_by, created_at",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Intake[];
}
