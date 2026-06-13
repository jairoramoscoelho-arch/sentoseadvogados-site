import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

/**
 * Componentes globais de MDX. Mapeiam os elementos gerados pelo markdown dos
 * posts (em `src/content/blog/*.mdx`) para a tipografia do design system.
 * Obrigatório para o `@next/mdx` funcionar com o App Router.
 */
const components: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-12 mb-4 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-10 mb-3 font-serif text-xl font-semibold tracking-tight text-ink"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-5 text-[1.0625rem] leading-8 text-ink/80" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-5 list-disc space-y-2 pl-6 text-ink/80 marker:text-gold-600" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 text-ink/80 marker:text-gold-600" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-8" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-6 border-l-2 border-gold-500 pl-5 font-serif text-lg italic text-ink/90"
      {...props}
    />
  ),
  a: ({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) => {
    const external = href.startsWith("http");
    return (
      <Link
        href={href}
        className="font-medium text-green-700 underline decoration-gold-500/60 underline-offset-2 transition-colors hover:text-green-800"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
  },
  img: (props: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img className="my-8 w-full rounded-lg" loading="lazy" {...props} />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
