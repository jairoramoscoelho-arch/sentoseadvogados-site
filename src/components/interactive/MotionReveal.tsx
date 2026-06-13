"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso da animação em ms (para escalonar itens). */
  delay?: number;
}

/**
 * Revela o conteúdo com fade + leve subida ao entrar na viewport.
 * Respeita prefers-reduced-motion (via variantes motion-safe) e usuários
 * sem JavaScript (regra `@media (scripting: none)` em globals.css).
 */
export function MotionReveal({ children, className, delay = 0 }: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
        visible
          ? "opacity-100 motion-safe:translate-y-0"
          : "opacity-100 motion-safe:opacity-0 motion-safe:translate-y-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
