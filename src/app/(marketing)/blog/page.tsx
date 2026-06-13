import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PostCard } from "@/components/cards/PostCard";
import { MotionReveal } from "@/components/interactive/MotionReveal";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos e atualidades do Sento-Sé Advogados sobre Direito Trabalhista, Cível, do Consumidor e temas jurídicos de interesse de pessoas e empresas.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <PageHeader
        eyebrow="Conteúdo"
        title="Blog"
        intro="Artigos e atualidades jurídicas escritas pela nossa equipe."
        breadcrumbs={[
          { name: "Início", href: "/" },
          { name: "Blog", href: "/blog" },
        ]}
      />

      <section className="section-y">
        <Container>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <MotionReveal key={post.slug}>
                <PostCard post={post} />
              </MotionReveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
