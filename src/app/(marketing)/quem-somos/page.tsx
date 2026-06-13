import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Target, Award } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionReveal } from "@/components/interactive/MotionReveal";
import { whatsappUrl, fullAddress } from "@/content/site";

export const metadata: Metadata = {
  title: "Quem Somos",
  description:
    "O Sento-Sé & Advogados Associados é um escritório de advocacia em Salvador, com atuação trabalhista, cível, do consumidor e médica. Ética, assertividade e resultados efetivos.",
  alternates: { canonical: "/quem-somos" },
};

const valores = [
  {
    icon: ShieldCheck,
    title: "Ética",
    text: "Atuação pautada pela transparência, pela responsabilidade e pelo respeito ao cliente em todas as etapas.",
  },
  {
    icon: Target,
    title: "Assertividade",
    text: "Estratégias claras e objetivas, com orientação precisa e foco na melhor solução para cada caso.",
  },
  {
    icon: Award,
    title: "Resultados efetivos",
    text: "Compromisso com a entrega de resultados concretos, unindo rigor técnico e dedicação ao atendimento.",
  },
];

export default function QuemSomosPage() {
  return (
    <>
      <PageHeader
        eyebrow="O escritório"
        title="Experiência e dedicação a serviço do seu caso"
        intro="Um escritório de advocacia no principal centro empresarial de Salvador, com atuação destacada nas áreas trabalhista, cível, consumerista e médica."
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Quem Somos", href: "/quem-somos" },
        ]}
      />

      {/* História */}
      <section className="section-y">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <MotionReveal>
            <div className="overflow-hidden rounded-2xl shadow-card ring-1 ring-green-900/10">
              <div className="relative aspect-[5/4]">
                <Image
                  src="/img/equipe.jpg"
                  alt="Equipe do escritório Sento-Sé Advogados"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </MotionReveal>
          <MotionReveal>
            <SectionHeading
              number="01"
              eyebrow="Sobre nós"
              title="Sento-Sé & Advogados Associados"
            />
            <div className="mt-5 space-y-4 text-base leading-7 text-muted">
              <p>
                O Sento-Sé &amp; Advogados Associados está localizado no
                principal centro empresarial de Salvador, na Avenida Tancredo
                Neves, no Edifício Salvador Prime, no bairro Caminho das
                Árvores.
              </p>
              <p>
                Com atuação destacada nas áreas trabalhista, cível e
                consumerista, o escritório tem como missão oferecer serviços
                advocatícios com ética, assertividade e entregar resultados
                efetivos ao cliente.
              </p>
              <p>
                Nossa equipe é composta por profissionais qualificados, em
                constante processo de aperfeiçoamento, com formação acadêmica que
                inclui pós-graduações, mestrado e doutorado.
              </p>
            </div>
          </MotionReveal>
        </Container>
      </section>

      {/* Valores */}
      <section className="section-y bg-cream">
        <Container>
          <SectionHeading
            number="02"
            eyebrow="Nossos valores"
            title="O que orienta o nosso trabalho"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {valores.map((v) => (
              <MotionReveal key={v.title}>
                <div className="flex h-full flex-col rounded-xl border border-line bg-paper p-7 shadow-soft">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <v.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-semibold text-ink">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{v.text}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-green-900">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Fale com o nosso escritório
            </h2>
            <p className="mt-4 max-w-lg text-white/70">{fullAddress}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button href={whatsappUrl} variant="accent" size="lg">
              Falar no WhatsApp
            </Button>
            <Button href="/contato" variant="light" size="lg">
              Página de contato
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
