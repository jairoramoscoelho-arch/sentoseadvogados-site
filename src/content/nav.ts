export interface NavItem {
  href: string;
  label: string;
}

/** Navegação principal (header + menu mobile). */
export const navItems: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/areas", label: "Áreas de Atuação" },
  { href: "/equipe", label: "Equipe" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];
