"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative py-1 text-sm font-medium transition-colors",
        active ? "text-green-800" : "text-ink/70 hover:text-green-800",
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-gold-500 transition-all duration-200",
          active ? "w-full" : "w-0 group-hover:w-full",
        )}
      />
    </Link>
  );
}
