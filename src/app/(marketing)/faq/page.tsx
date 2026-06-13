import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/interactive/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageLd } from "@/lib/jsonld";
import { getFaqs } from "@/lib/content";
import { whatsappUrl } from "@/content/site";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description:
    "Perguntas frequentes sobre o Sento-Sé Advogados: áreas de atuação, localização em Salvador, agendamento de consulta, atendimento on-line e mais.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const faqs = getFaqs();

  return (
    <>
      <JsonLd data={faqPageLd(faqs)} />
      <PageHeader
        eyebrow="Tire suas dúvidas"
        title="Perguntas frequentes"
        intro="Reunimos respostas para as dúvidas mais comuns. Se precisar de mais informações, fale diretamente com a nossa equipe."
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Perguntas frequentes", href: "/faq" },
        ]}
      />

      <section className="section-y">
        <Container width="narrow">
          <h2 className="sr-only">Lista de perguntas frequentes</h2>
          <FAQAccordion items={faqs} />

          <div className="mt-10 rounded-2xl bg-cream p-8 text-center">
            <p className="font-serif text-xl font-semibold text-ink">
              Não encontrou o que procurava?
            </p>
            <p className="mt-2 text-sm text-muted">
              Fale com o nosso escritório e tire suas dúvidas diretamente com a
              equipe.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href={whatsappUrl} variant="primary">
                Falar no WhatsApp
              </Button>
              <Button href="/contato" variant="outline">
                Página de contato
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
