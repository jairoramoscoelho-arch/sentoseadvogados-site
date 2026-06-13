import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "dark" = sobre fundo claro (texto verde); "light" = sobre fundo escuro. */
  variant?: "dark" | "light";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  const light = variant === "light";
  return (
    <Link
      href="/"
      aria-label="Sento-Sé Advogados — Página inicial"
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center",
          light && "rounded-md bg-cream p-1.5",
        )}
      >
        <Image src={logo} alt="" className="h-9 w-auto sm:h-10" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-lg font-semibold tracking-tight",
            light ? "text-white" : "text-green-800",
          )}
        >
          Sento-Sé
        </span>
        <span
          className={cn(
            "mt-1 text-[0.625rem] font-medium uppercase tracking-[0.2em]",
            light ? "text-white/60" : "text-muted",
          )}
        >
          Advogados Associados
        </span>
      </span>
    </Link>
  );
}
