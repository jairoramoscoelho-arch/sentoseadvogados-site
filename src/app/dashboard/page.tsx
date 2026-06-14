import { requireSession } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export default async function DashboardHome() {
  const profile = await requireSession();

  const stats = [
    { label: "Clientes", value: "—" },
    { label: "Casos ativos", value: "—" },
    { label: "Prazos próximos", value: "—" },
    { label: "Documentos", value: "—" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Olá, {firstName(profile.full_name)}
      </h1>
      <p className="mt-2 text-muted">Bem-vindo ao painel do escritório.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-line bg-paper p-5 shadow-soft"
          >
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-ink">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-line bg-paper p-6 text-sm leading-6 text-muted">
        As próximas funcionalidades — gestão de clientes e casos, consulta
        processual (DataJud), documentos, prazos e relatórios — entram nas
        próximas etapas.
      </div>
    </div>
  );
}
