"use client";

import Link from "next/link";
import type { Client } from "@/types/db";

export function ClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper p-6 text-sm text-muted shadow-soft">
        Nenhum cliente cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Contato</th>
            <th className="px-4 py-3 text-right font-medium">Ação</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-t border-line">
              <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
              <td className="px-4 py-3 text-muted">
                {c.type === "pf" ? "PF" : "PJ"}
              </td>
              <td className="px-4 py-3 text-muted">{c.email || c.phone || "—"}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/clientes/${c.id}`}
                  className="text-xs font-medium text-green-700 hover:text-green-800"
                >
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
