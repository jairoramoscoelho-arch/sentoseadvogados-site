import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { PracticeAreaCard } from "@/components/cards/PracticeAreaCard";
import { LawyerCard } from "@/components/cards/LawyerCard";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { PostCard } from "@/components/cards/PostCard";
import { MotionReveal } from "@/components/interactive/MotionReveal";
import {
  getAreas,
  getLawyers,
  getTestimonials,
  getRecentPosts,
} from "@/lib/content";
import { whatsappUrl } from "@/content/site";

const trust = [
  "Equipe com mestrado e doutorado",
  "Atendimento presencial e on-line",
  "No Edifício Salvador Prime",
];

const diferenciais = [
  "Equipe com sólida formação acadêmica (mestrado e doutorado)",
  "Atendimento próximo, claro e personalizado",
  "Atuação preventiva e contenciosa",
  "Sede no principal centro empresarial de Salvador",
];

export default function Home() {
  const areas = getAreas();
  const lawyers = getLawyers();
  const testimonials = getTestimonials();
  const posts = getRecentPosts(3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <Image
          src={logo}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/2 hidden h-[130%] w-auto -translate-y-1/2 opacity-[0.04] lg:block"
        />
        <Container className="relative grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
              Sento-Sé &amp; Advogados Associados · Salvador — BA
            </p>
            <h1 className="mt-5 max-w-xl text-balance font-serif text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Advocacia séria, próxima e comprometida com o seu resultado.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Atuação destacada em Direito Trabalhista, Cível, do Consumidor e
              Médico, com ética, assertividade e foco em resultados efetivos
              para pessoas e empresas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={whatsappUrl} variant="primary" size="lg">
                Fale conosco
              </Button>
              <Button href="/areas" variant="outline" size="lg">
                Áreas de atuação
              </Button>
            </div>
            <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {trust.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-ink/70"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-green-700"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-lift ring-1 ring-green-900/10">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/img/equipe.jpg"
                  alt="Equipe do escritório Sento-Sé Advogados, em Salvador"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl bg-paper p-4 shadow-card sm:block">
              <Stars rating={5} />
              <p className="mt-1 text-xs font-medium text-muted">
                Avaliações de clientes
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ÁREAS */}
      <section className="section-y">
        <Container>
          <MotionReveal>
            <SectionHeading
              number="01"
              eyebrow="Áreas de Atuação"
              title="Onde podemos ajudar você"
              intro="Atuamos de forma personalizada em cada área, buscando a solução mais adequada e segura para o seu caso."
            />
          </MotionReveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area, i) => (
              <MotionReveal key={area.slug} delay={i * 70}>
                <PracticeAreaCard area={area} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* QUEM SOMOS */}
      <section className="section-y bg-cream">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <MotionReveal className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl shadow-card ring-1 ring-green-900/10">
              <div className="relative aspect-[5/4]">
                <Image
                  src="/img/equipe-grupo.png"
                  alt="Advogados e advogadas do escritório Sento-Sé"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </MotionReveal>
          <MotionReveal className="order-1 lg:order-2">
            <SectionHeading
              number="02"
              eyebrow="Quem Somos"
              title="Experiência e dedicação a serviço do seu caso"
            />
            <p className="mt-5 text-base leading-7 text-muted">
              O Sento-Sé &amp; Advogados Associados está localizado no principal
              centro empresarial de Salvador. Com atuação destacada nas áreas
              trabalhista, cível e consumerista, tem como missão oferecer
              serviços advocatícios com ética, assertividade e resultados
              efetivos. Nossa equipe é formada por profissionais qualificados e
              em constante aperfeiçoamento.
            </p>
            <ul className="mt-6 grid gap-3">
              {diferenciais.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-green-700"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-6 text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href="/quem-somos" variant="outline">
                Conheça o escritório
              </Button>
            </div>
          </MotionReveal>
        </Container>
      </section>

      {/* EQUIPE */}
      <section className="section-y">
        <Container>
          <MotionReveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                number="03"
                eyebrow="Equipe"
                title="Profissionais que cuidam do seu caso"
                className="max-w-2xl"
              />
              <Button href="/equipe" variant="ghost" className="hidden sm:inline-flex">
                Ver equipe completa
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </MotionReveal>
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {lawyers.map((lawyer, i) => (
              <MotionReveal key={lawyer.slug} delay={(i % 3) * 70}>
                <LawyerCard lawyer={lawyer} />
              </MotionReveal>
            ))}
          </div>
          <div className="mt-8 sm:hidden">
            <Button href="/equipe" variant="outline" className="w-full">
              Ver equipe completa
            </Button>
          </div>
        </Container>
      </section>

      {/* DEPOIMENTOS */}
      <section className="section-y bg-green-800">
        <Container>
          <MotionReveal>
            <SectionHeading
              number="04"
              eyebrow="Depoimentos"
              title="O que dizem nossos clientes"
              tone="onDark"
            />
          </MotionReveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <MotionReveal key={testimonial.id} delay={i * 70}>
                <TestimonialCard testimonial={testimonial} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* BLOG */}
      <section className="section-y bg-cream">
        <Container>
          <MotionReveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                number="05"
                eyebrow="Blog"
                title="Conteúdo e atualidades"
                className="max-w-2xl"
              />
              <Button href="/blog" variant="ghost" className="hidden sm:inline-flex">
                Ver todos os artigos
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </MotionReveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {posts.map((post, i) => (
              <MotionReveal key={post.slug} delay={i * 70}>
                <PostCard post={post} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="bg-green-900">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Precisa de orientação jurídica?
            </h2>
            <p className="mt-4 max-w-lg text-white/70">
              Conte com uma equipe experiente e atenciosa. Entre em contato e
              entenda como podemos ajudar no seu caso.
            </p>
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
