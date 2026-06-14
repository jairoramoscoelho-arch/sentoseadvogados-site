import Link from "next/link";
import { KeyRound, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const sections = [
  {
    href: "/dashboard/admin/integracoes",
    label: "Integrações",
    description: "Chaves de API (Claude, Whisper, e-mail e serviços futuros).",
    icon: KeyRound,
  },
  {
    href: "/dashboard/admin/usuarios",
    label: "Usuários",
    description: "Cadastre e gerencie os advogados associados.",
    icon: Users,
  },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Administração
      </h1>
      <p className="mt-2 text-muted">Configurações restritas ao sócio.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-xl border border-line bg-paper p-5 shadow-soft transition-colors hover:border-green-700/30"
            >
              <Icon className="h-6 w-6 text-green-700" aria-hidden="true" />
              <p className="mt-3 font-serif text-lg font-semibold text-ink">
                {s.label}
              </p>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
