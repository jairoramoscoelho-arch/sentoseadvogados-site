import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { navItems } from "@/content/nav";
import { getAreas } from "@/lib/content";
import {
  site,
  fullAddress,
  whatsappUrl,
  instagramUrl,
  mapsDirectionsUrl,
} from "@/content/site";

export function Footer() {
  const areas = getAreas();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-green-900 text-white/80">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        {/* Marca + social */}
        <div className="lg:col-span-4">
          <Logo variant="light" />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Advocacia em Salvador com atuação em Direito Trabalhista, Cível, do
            Consumidor e Médico. Ética, assertividade e resultados efetivos.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Navegação */}
        <nav aria-label="Rodapé — navegação" className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Navegação
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/faq"
                className="text-white/70 transition-colors hover:text-white"
              >
                Perguntas frequentes
              </Link>
            </li>
          </ul>
        </nav>

        {/* Áreas */}
        <nav aria-label="Rodapé — áreas de atuação" className="lg:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Áreas de Atuação
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {areas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {area.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contato */}
        <div className="lg:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Contato
          </h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin
                className="mt-0.5 h-5 w-5 shrink-0 text-gold-400"
                aria-hidden="true"
              />
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-6 text-white/70 transition-colors hover:text-white"
              >
                {fullAddress}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone
                className="mt-0.5 h-5 w-5 shrink-0 text-gold-400"
                aria-hidden="true"
              />
              <a
                href={`tel:${site.phone}`}
                className="text-white/70 transition-colors hover:text-white"
              >
                {site.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. Todos os direitos reservados.
          </p>
          <p className="max-w-xl sm:text-right">
            Conteúdo de caráter meramente informativo, em conformidade com o
            Código de Ética e Disciplina e o Provimento nº 205/2021 da OAB.
          </p>
        </Container>
      </div>
    </footer>
  );
}
