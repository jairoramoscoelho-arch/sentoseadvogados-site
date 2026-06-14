"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { ClientsTable } from "./ClientsTable";
import type { Client } from "@/types/db";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Lista de clientes com busca instantânea (nome / documento / e-mail / telefone). */
export function ClientsBrowser({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");
  const nq = norm(query.trim());
  const filtered = nq
    ? clients.filter((c) =>
        norm([c.name, c.document, c.email, c.phone].filter(Boolean).join(" ")).includes(nq),
      )
    : clients;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, documento, e-mail…"
          aria-label="Buscar clientes"
          className="w-full rounded-lg border border-line bg-paper py-3 pl-10 pr-10 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:border-green-700/40 focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {nq && (
        <p className="text-xs text-muted">
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
        </p>
      )}

      <ClientsTable clients={filtered} />
    </div>
  );
}
