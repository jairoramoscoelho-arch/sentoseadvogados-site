import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LawyerCard } from "@/components/cards/LawyerCard";
import { getLawyers, getInterns } from "@/lib/content";

export const metadata: Metadata = {
  title: "Equipe",
  description:
    "Conheça a equipe do Sento-Sé Advogados: advogados com sólida formação acadêmica (mestrado e doutorado) e atuação nas áreas trabalhista, cível, do consumidor e médica.",
  alternates: { canonical: "/equipe" },
};

export default function EquipePage() {
  const lawyers = getLawyers();
  const interns = getInterns();

  return (
    <>
      <PageHeader
        eyebrow="Quem cuida do seu caso"
        title="Nossa Equipe"
        intro="Profissionais qualificados e em constante aperfeiçoamento, com formação acadêmica que inclui pós-graduações, mestrado e doutorado."
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Equipe", href: "/equipe" },
        ]}
      />

      <section className="section-y">
        <Container>
          <SectionHeading eyebrow="Advogados" title="Sócio e advogados" />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer.slug} lawyer={lawyer} />
            ))}
          </div>
        </Container>
      </section>

      {interns.length > 0 && (
        <section className="section-y bg-cream">
          <Container>
            <SectionHeading
              eyebrow="Apoio"
              title="Equipe de estágio"
              intro="Estudantes de Direito que integram nossos núcleos e contribuem para o atendimento e o acompanhamento das demandas."
            />
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {interns.map((lawyer) => (
                <LawyerCard key={lawyer.slug} lawyer={lawyer} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
