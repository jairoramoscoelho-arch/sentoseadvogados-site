"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Users, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/dashboard/pecas/nova", label: "Nova triagem", icon: ClipboardList },
  { href: "/dashboard/clientes", label: "Novo cliente", icon: Users },
];

/**
 * Ação rápida flutuante do painel: um "+" fixo no canto inferior que abre e
 * fecha na vertical, com atalhos para criar peça e cadastrar cliente (também
 * disponíveis na sidebar). z-index: backdrop 30 / FAB 40 — abaixo do drawer
 * mobile (50). Movimento em ease-out-expo; reduced-motion é neutralizado
 * globalmente em globals.css (transições instantâneas).
 */
export function DashboardFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Some na tela de triagem (nova) e no editor da peça (/pecas/[id]) — lá o foco
  // é a escrita; o "+" só distrai (e cobre o box de edição).
  if (pathname?.startsWith("/dashboard/pecas/")) return null;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default bg-green-900/10"
        />
      )}

      {/* pointer-events-none no container: só o botão e as ações abertas captam
          cliques — assim a área (invisível) das ações não bloqueia o conteúdo. */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <ul className="flex flex-col items-end gap-3" aria-hidden={!open}>
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <li
                key={action.href}
                style={{ transitionDelay: open ? `${i * 45}ms` : "0ms" }}
                className={cn(
                  "flex items-center gap-3 transition-[opacity,transform] duration-300 [transition-timing-function:var(--ease-out-expo)]",
                  open
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0",
                )}
              >
                <span className="rounded-full bg-paper px-3 py-1.5 text-sm font-medium text-ink shadow-card">
                  {action.label}
                </span>
                <Link
                  href={action.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  aria-label={action.label}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-paper text-green-800 shadow-lift transition-colors hover:bg-cream"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar ações rápidas" : "Ações rápidas"}
          className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-white shadow-lift transition-colors duration-300 [transition-timing-function:var(--ease-out-expo)] hover:bg-green-800 motion-safe:active:scale-95"
        >
          <Plus
            className={cn(
              "h-7 w-7 transition-transform duration-300 [transition-timing-function:var(--ease-out-expo)]",
              open && "rotate-45",
            )}
            aria-hidden="true"
          />
        </button>
      </div>
    </>
  );
}
