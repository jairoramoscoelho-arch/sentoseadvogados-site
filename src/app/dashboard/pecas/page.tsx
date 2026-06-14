import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PecasPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Peças</h1>
        <Link href="/dashboard/pecas/nova" className="inline-flex h-11 items-center rounded-full bg-green-700 px-6 text-sm font-medium text-white hover:bg-green-800">Nova peça</Link>
      </div>
      <p className="mt-2 text-muted">Inicie uma nova peça pelo relato do cliente. A geração com IA entra na próxima etapa.</p>
    </div>
  );
}
