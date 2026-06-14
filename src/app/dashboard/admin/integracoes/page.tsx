import { listIntegrationStatus } from "@/lib/settings/store";
import { IntegrationForm } from "@/components/admin/IntegrationForm";

export const dynamic = "force-dynamic";

export default async function IntegracoesPage() {
  const statuses = await listIntegrationStatus();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Integrações
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Chaves de API usadas pelo estúdio. As salvas aqui ficam criptografadas no
        banco e têm prioridade sobre o <code className="text-sm">.env</code>. O
        valor nunca é exibido de volta.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        {statuses.map((status) => (
          <IntegrationForm key={status.key} status={status} />
        ))}
      </div>
    </div>
  );
}
