import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  href: string;
}

export function Breadcrumbs({
  items,
  tone = "default",
}: {
  items: Crumb[];
  tone?: "default" | "onDark";
}) {
  const onDark = tone === "onDark";
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5",
                    onDark ? "text-white/30" : "text-line",
                  )}
                  aria-hidden="true"
                />
              )}
              {last ? (
                <span
                  aria-current="page"
                  className={onDark ? "text-white/80" : "text-ink/70"}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    onDark
                      ? "text-white/55 hover:text-gold-400"
                      : "text-muted hover:text-green-700",
                  )}
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
