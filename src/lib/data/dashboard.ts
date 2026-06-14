import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DashboardStats {
  clientes: number;
  triagens: number;
  pecasEmRevisao: number;
  pecasFinalizadas: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();
  const [clientes, triagens, revisao, finalizada] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase.from("intakes").select("id", { count: "exact", head: true }),
    supabase
      .from("legal_drafts")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "em_revisao"),
    supabase
      .from("legal_drafts")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "finalizada"),
  ]);
  return {
    clientes: clientes.count ?? 0,
    triagens: triagens.count ?? 0,
    pecasEmRevisao: revisao.count ?? 0,
    pecasFinalizadas: finalizada.count ?? 0,
  };
}

export interface ActivityItem {
  kind: "triagem" | "peca";
  id: string;
  href: string;
  title: string;
  subtitle: string;
  at: string;
}

function embedName(
  c: { name: string } | { name: string }[] | null | undefined,
): string {
  const v = Array.isArray(c) ? c[0] : c;
  return v?.name ?? "—";
}

export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const supabase = await createSupabaseServerClient();
  const [intakes, drafts] = await Promise.all([
    supabase
      .from("intakes")
      .select("id, client_id, triage, created_at, clients(name)")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("legal_drafts")
      .select("id, title, created_at, clients(name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items: ActivityItem[] = [];

  for (const r of (intakes.data ?? []) as Array<{
    id: string;
    client_id: string;
    triage: unknown;
    created_at: string;
    clients: { name: string } | { name: string }[] | null;
  }>) {
    const area = (r.triage as { area?: string } | null)?.area;
    items.push({
      kind: "triagem",
      id: r.id,
      href: `/dashboard/clientes/${r.client_id}/relato/${r.id}`,
      title: `Triagem — ${embedName(r.clients)}`,
      subtitle: area ? `Área: ${area}` : "Triagem",
      at: r.created_at,
    });
  }
  for (const r of (drafts.data ?? []) as Array<{
    id: string;
    title: string;
    created_at: string;
    clients: { name: string } | { name: string }[] | null;
  }>) {
    items.push({
      kind: "peca",
      id: r.id,
      href: `/dashboard/pecas/${r.id}`,
      title: r.title,
      subtitle: `Peça · ${embedName(r.clients)}`,
      at: r.created_at,
    });
  }

  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  return items.slice(0, limit);
}
