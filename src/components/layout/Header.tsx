import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { MobileNav } from "./MobileNav";
import { navItems } from "@/content/nav";
import { whatsappUrl } from "@/content/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6 sm:h-20">
        <Logo />

        <nav
          aria-label="Principal"
          className="hidden items-center gap-8 lg:flex"
        >
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href={whatsappUrl} variant="primary" size="sm">
            Fale conosco
          </Button>
        </div>

        <MobileNav items={navItems} />
      </Container>
    </header>
  );
}
