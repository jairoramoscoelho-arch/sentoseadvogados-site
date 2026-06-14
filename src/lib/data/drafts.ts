import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LegalDraft, DraftStatus } from "@/types/db";

const DRAFT_COLS =
  "id, client_id, case_id, intake_id, template_id, title, status, content_html, model_used, style_id, style_authors, style_instruction, tipo, created_by, assigned_to, created_at, updated_at, deleted_at";

export async function getDraft(id: string): Promise<LegalDraft | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("legal_drafts")
    .select(DRAFT_COLS)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return (data as LegalDraft | null) ?? null;
}

export interface DraftListItem {
  id: string;
  title: string;
  status: DraftStatus;
  client_id: string;
  client_name: string;
  updated_at: string;
}

export async function listDrafts(limit = 50): Promise<DraftListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("legal_drafts")
    .select("id, title, status, client_id, updated_at, clients(name)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);
  const rows = (data ?? []) as unknown as Array<{
    id: string;
    title: string;
    status: DraftStatus;
    client_id: string;
    updated_at: string;
    clients: { name: string } | { name: string }[] | null;
  }>;
  return rows.map((r) => {
    const c = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      client_id: r.client_id,
      client_name: c?.name ?? "—",
      updated_at: r.updated_at,
    };
  });
}

/** Peça resumida para a ficha do cliente (sem nome do cliente — já estamos nele). */
export interface ClientDraft {
  id: string;
  title: string;
  status: DraftStatus;
  updated_at: string;
}

export async function listDraftsByClient(clientId: string): Promise<ClientDraft[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("legal_drafts")
    .select("id, title, status, updated_at")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  return (data ?? []) as ClientDraft[];
}

/** Ids das triagens que já viraram peça (para escondê-las da aba Triagens). */
export async function consumedIntakeIds(): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("legal_drafts")
    .select("intake_id")
    .is("deleted_at", null)
    .not("intake_id", "is", null);
  return new Set(
    ((data ?? []) as Array<{ intake_id: string | null }>)
      .map((d) => d.intake_id)
      .filter((v): v is string => Boolean(v)),
  );
}

export async function listVersionNumbers(draftId: string): Promise<number[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("legal_draft_versions")
    .select("version_no")
    .eq("draft_id", draftId);
  return ((data ?? []) as Array<{ version_no: number }>).map((r) => r.version_no);
}
