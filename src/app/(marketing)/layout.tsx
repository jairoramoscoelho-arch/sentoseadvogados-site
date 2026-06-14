import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ScrollProgress } from "@/components/interactive/ScrollProgress";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationLd, webSiteLd } from "@/lib/jsonld";

/** Layout do site institucional (marketing): chrome, SEO e barra de progresso. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only rounded-md focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-green-800 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <JsonLd data={organizationLd()} />
      <JsonLd data={webSiteLd()} />
      <ScrollProgress />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
