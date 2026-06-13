import type { Metadata } from "next";
import { MapPin, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/interactive/ContactForm";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import {
  site,
  fullAddress,
  whatsappUrl,
  instagramUrl,
  mapsEmbedUrl,
  mapsDirectionsUrl,
} from "@/content/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com o Sento-Sé Advogados em Salvador. Av. Tancredo Neves, 2227, Salvador Prime. WhatsApp (71) 99351-0900.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fale conosco"
        title="Entre em contato"
        intro="Tire suas dúvidas ou agende um atendimento. Respondemos pelo canal de sua preferência."
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Contato", href: "/contato" },
        ]}
      />

      <section className="section-y">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Informações */}
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Informações de contato
            </h2>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Endereço</p>
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm leading-6 text-muted transition-colors hover:text-green-700"
                  >
                    {fullAddress}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Telefone / WhatsApp</p>
                  <a
                    href={`tel:${site.phone}`}
                    className="text-sm leading-6 text-muted transition-colors hover:text-green-700"
                  >
                    {site.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Atendimento</p>
                  <p className="text-sm leading-6 text-muted">
                    Presencial mediante agendamento e on-line.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-7 flex gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-50"
              >
                <InstagramIcon className="h-5 w-5" />
                Instagram
              </a>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-line">
              <iframe
                src={mapsEmbedUrl}
                title="Localização do escritório Sento-Sé Advogados no Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full"
              />
            </div>
          </div>

          {/* Formulário */}
          <div className="rounded-2xl border border-line bg-cream p-7 sm:p-9">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Envie uma mensagem
            </h2>
            <p className="mt-2 text-sm text-muted">
              Preencha o formulário e retornaremos o mais breve possível.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
