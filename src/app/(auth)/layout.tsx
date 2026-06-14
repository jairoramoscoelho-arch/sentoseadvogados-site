import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-green-900 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo variant="light" />
        </div>
        {children}
      </div>
    </div>
  );
}
