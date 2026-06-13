import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Número decorativo (ex.: "01"). Lido como decorativo por leitores de tela. */
  number?: string;
  /** Eyebrow / categoria curta acima do título. */
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  /** Tag do título. Padrão h2. */
  as?: "h1" | "h2";
  /** "onDark" ajusta as cores para fundos escuros. */
  tone?: "default" | "onDark";
  id?: string;
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  number,
  eyebrow,
  title,
  intro,
  align = "left",
  as: Tag = "h2",
  tone = "default",
  id,
  className,
  titleClassName,
}: SectionHeadingProps) {
  const centered = align === "center";
  const onDark = tone === "onDark";
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {(eyebrow || number) && (
        <div className="flex items-center gap-2.5 text-sm">
          <span
            aria-hidden="true"
            className={cn(
              "font-serif text-lg leading-none",
              onDark ? "text-gold-400" : "text-gold-500",
            )}
          >
            §
          </span>
          {number && (
            <span
              aria-hidden="true"
              className={cn(
                "font-serif tabular-nums",
                onDark ? "text-gold-400" : "text-gold-600",
              )}
            >
              {number}
            </span>
          )}
          {eyebrow && (
            <span
              className={cn(
                "font-medium",
                onDark ? "text-white/90" : "text-green-800",
              )}
            >
              {eyebrow}
            </span>
          )}
        </div>
      )}

      <Tag
        id={id}
        className={cn(
          "max-w-3xl text-balance font-serif font-semibold tracking-tight",
          onDark ? "text-white" : "text-ink",
          Tag === "h1"
            ? "text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] leading-[1.05]"
            : "text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-[1.1]",
          titleClassName,
        )}
      >
        {title}
      </Tag>

      {intro && (
        <p
          className={cn(
            "max-w-2xl text-lg leading-8",
            onDark ? "text-white/70" : "text-muted",
            centered && "mx-auto",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
