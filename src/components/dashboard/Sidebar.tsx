"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  FileBarChart,
  FileText,
  Settings,
  KeyRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { logout } from "@/app/dashboard/actions";
import type { Role } from "@/lib/auth/dal";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/pecas", label: "Peças", icon: FileText },
  { href: "/dashboard/casos", label: "Casos", icon: Briefcase },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileBarChart },
];

const roleLabel: Record<Role, string> = {
  socio: "Sócio",
  advogado: "Advogado",
  estagiario: "Estagiário",
};

export function DashboardSidebar({
  profile,
}: {
  profile: { full_name: string; role: Role };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const adminNav: NavItem[] = [
    { href: "/dashboard/admin/integracoes", label: "Integrações", icon: KeyRound },
    { href: "/dashboard/admin/usuarios", label: "Usuários", icon: Settings },
  ];

  const items =
    profile.role === "socio" ? [...baseNav, ...adminNav] : baseNav;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navList = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const userFooter = (
    <div className="border-t border-white/10 pt-4">
      <p className="px-3 text-sm font-medium text-white">{profile.full_name}</p>
      <p className="px-3 text-xs text-white/50">{roleLabel[profile.role]}</p>
      <form action={logout} className="mt-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          Sair
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-green-900 p-5 lg:flex">
        <div className="mb-6">
          <Logo variant="light" />
        </div>
        {navList}
        {userFooter}
      </aside>

      {/* Barra superior (mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper px-4 py-3 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-green-800 hover:bg-green-50"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Drawer (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-green-900/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-green-900 p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo variant="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            {navList}
            {userFooter}
          </div>
        </div>
      )}
    </>
  );
}
