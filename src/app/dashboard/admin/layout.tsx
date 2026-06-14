import { requireRole } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

/** Gate único da área admin: só o sócio entra (demais papéis → /dashboard). */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["socio"]);
  return <>{children}</>;
}
