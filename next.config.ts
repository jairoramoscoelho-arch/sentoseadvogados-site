import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Permite que arquivos .mdx sejam importados/compilados (blog em src/content/blog).
  // Mantém ts/tsx/js/jsx para que as páginas normais continuem funcionando.
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
};

// Sem plugins remark/rehype (mantém compatibilidade com Turbopack, padrão no Next 16).
// Frontmatter é feito via `export const metadata` dentro de cada .mdx.
const withMDX = createMDX({});

export default withMDX(nextConfig);
