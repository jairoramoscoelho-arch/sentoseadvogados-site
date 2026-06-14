import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumedIntakeIds } from "./drafts";
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

const INTAKE_COLS =
  "id, client_id, case_id, raw_text, audio_path, transcript, triage, created_by, created_at";

export async function listIntakesByClient(clientId: string): Promise<Intake[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("intakes")
    .select(INTAKE_COLS)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Intake[];
}

/** Triagens do cliente que ainda não viraram peça (para a ficha do cliente). */
export async function listOpenIntakesByClient(clientId: string): Promise<Intake[]> {
  const [intakes, consumed] = await Promise.all([
    listIntakesByClient(clientId),
    consumedIntakeIds(),
  ]);
  return intakes.filter((i) => !consumed.has(i.id));
}

export async function getIntake(id: string): Promise<Intake | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("intakes")
    .select(INTAKE_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data as Intake | null) ?? null;
}

export interface RecentIntake {
  id: string;
  client_id: string;
  client_name: string;
  raw_text: string | null;
  triage: unknown;
  created_at: string;
}

/** Relatos/triagens recentes de todos os clientes (para a página Peças). */
export async function listRecentIntakes(limit = 50): Promise<RecentIntake[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("intakes")
    .select("id, client_id, raw_text, triage, created_at, clients(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Supabase tipa o embed como array; numa FK to-one o runtime é objeto.
  const rows = (data ?? []) as unknown as Array<{
    id: string;
    client_id: string;
    raw_text: string | null;
    triage: unknown;
    created_at: string;
    clients: { name: string } | { name: string }[] | null;
  }>;

  return rows.map((r) => {
    const c = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    return {
      id: r.id,
      client_id: r.client_id,
      client_name: c?.name ?? "—",
      raw_text: r.raw_text,
      triage: r.triage,
      created_at: r.created_at,
    };
  });
}

/** Triagens recentes que ainda não viraram peça (para a aba Triagens). */
export async function listOpenIntakes(limit = 100): Promise<RecentIntake[]> {
  const [recent, consumed] = await Promise.all([
    listRecentIntakes(limit * 2),
    consumedIntakeIds(),
  ]);
  return recent.filter((i) => !consumed.has(i.id)).slice(0, limit);
}
