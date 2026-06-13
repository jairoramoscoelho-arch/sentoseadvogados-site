import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPostingLd, breadcrumbLd } from "@/lib/jsonld";
import { getPostBySlug, getPostSlugs } from "@/lib/content";
import { formatDatePtBr } from "@/lib/utils";
import { whatsappUrl } from "@/content/site";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

function formatAuthors(authors: string[]): string {
  if (authors.length <= 1) return authors[0] ?? "";
  return `${authors.slice(0, -1).join(", ")} e ${authors[authors.length - 1]}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: post.authors,
      ...(post.cover ? { images: [post.cover] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { default: Content } = await import(`@/content/blog/${slug}.mdx`);

  const crumbs = [
    { name: "Início", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <article>
      <JsonLd data={blogPostingLd(post)} />
      <JsonLd data={breadcrumbLd(crumbs)} />
      <header className="relative isolate overflow-hidden bg-green-900 text-white">
        <div
          aria-hidden="true"
          className="grain-overlay pointer-events-none absolute inset-0"
        />
        <Container width="narrow" className="relative py-12 lg:py-16">
          <div className="mb-6">
            <Breadcrumbs items={crumbs} tone="onDark" />
          </div>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="rounded-full bg-white/10 px-2.5 py-1 font-medium text-gold-400">
              {post.category}
            </span>
            <time dateTime={post.date}>{formatDatePtBr(post.date)}</time>
          </div>
          <h1 className="mt-4 font-serif text-[clamp(1.875rem,1.4rem+2.2vw,3rem)] font-semibold leading-[1.1] tracking-tight text-white">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-white/60">
            Por {formatAuthors(post.authors)}
          </p>
        </Container>
      </header>

      {post.cover && (
        <Container width="narrow" className="pt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={post.cover}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 48rem"
              className="object-cover"
            />
          </div>
        </Container>
      )}

      <Container width="narrow" className="py-12">
        <Content />
      </Container>

      {/* CTA */}
      <Container width="narrow" className="pb-16">
        <div className="rounded-2xl bg-green-900 p-8 text-center sm:p-10">
          <h2 className="font-serif text-2xl font-semibold text-white">
            Precisa de orientação jurídica?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
            Fale com a nossa equipe e entenda como podemos ajudar no seu caso.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={whatsappUrl} variant="accent">
              Falar no WhatsApp
            </Button>
            <Button href="/contato" variant="light">
              Página de contato
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <Button href="/blog" variant="ghost">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para o blog
          </Button>
        </div>
      </Container>
    </article>
  );
}
