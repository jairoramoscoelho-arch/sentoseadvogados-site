import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { requireSession } from "@/lib/auth/dal";
import { getDashboardStats, getRecentActivity } from "@/lib/data/dashboard";
import { formatDatePtBr } from "@/lib/utils";

export const dynamic = "force-dynamic";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export default async function DashboardHome() {
  const profile = await requireSession();
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ]);

  const cards = [
    { label: "Clientes", value: stats.clientes, href: "/dashboard/clientes" },
    { label: "Triagens", value: stats.triagens, href: "/dashboard/triagens" },
    { label: "Peças em revisão", value: stats.pecasEmRevisao, href: "/dashboard/pecas" },
    { label: "Peças finalizadas", value: stats.pecasFinalizadas, href: "/dashboard/pecas" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Olá, {firstName(profile.full_name)}
      </h1>
      <p className="mt-2 text-muted">Visão geral do escritório.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/pecas/nova"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" /> Nova triagem
        </Link>
        <Link
          href="/dashboard/clientes"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-green-700/25 px-5 text-sm font-medium text-green-800 transition-colors hover:bg-green-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo cliente
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-line bg-paper p-5 shadow-soft transition-colors hover:border-green-700/20"
          >
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-ink">
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-serif text-xl font-semibold text-ink">
        Atividade recente
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {activity.length === 0 && (
          <p className="text-sm text-muted">
            Nada por aqui ainda. Comece com uma nova triagem ou cadastre um
            cliente.
          </p>
        )}
        {activity.map((a) => (
          <Link
            key={`${a.kind}-${a.id}`}
            href={a.href}
            className="flex items-center justify-between gap-4 rounded-lg border border-line bg-paper px-4 py-3 shadow-soft transition-colors hover:border-green-700/20"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{a.title}</p>
              <p className="truncate text-xs text-muted">{a.subtitle}</p>
            </div>
            <span className="shrink-0 text-xs text-muted">
              {formatDatePtBr(a.at)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
