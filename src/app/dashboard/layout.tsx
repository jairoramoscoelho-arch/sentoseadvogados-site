import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/dal";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireSession();

  return (
    <div className="min-h-dvh bg-cloud">
      <DashboardSidebar
        profile={{ full_name: profile.full_name, role: profile.role }}
      />
      <main className="p-6 lg:ml-64 lg:p-10">{children}</main>
    </div>
  );
}
