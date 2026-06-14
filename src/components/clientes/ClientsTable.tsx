"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { ContactLinks } from "./ContactLinks";
import type { Client } from "@/types/db";

/** Lista de clientes em cartões (duas linhas) — legível também no mobile. */
export function ClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper p-6 text-sm text-muted shadow-soft">
        Nenhum cliente cadastrado ainda.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {clients.map((c) => (
        <li
          key={c.id}
          className="rounded-xl border border-line bg-paper p-4 shadow-soft transition-colors hover:border-green-700/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{c.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {c.type === "pf" ? "Pessoa física" : "Pessoa jurídica"}
                {c.document ? ` · ${c.document}` : ""}
              </p>
            </div>
            <Link
              href={`/dashboard/clientes/${c.id}`}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 text-xs font-medium text-green-700 transition-colors hover:bg-cloud"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Ver
            </Link>
          </div>
          <div className="mt-2.5">
            <ContactLinks phone={c.phone} email={c.email} className="text-xs" />
          </div>
        </li>
      ))}
    </ul>
  );
}
