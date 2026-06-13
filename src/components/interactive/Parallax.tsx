"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ParallaxProps {
  /** Intensidade do deslocamento (px por px de distância ao centro da viewport). */
  speed?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Aplica parallax vertical ao elemento conforme o scroll. Atualiza o transform
 * diretamente no DOM via rAF (sem re-render) e respeita prefers-reduced-motion.
 */
export function Parallax({ speed = 0.1, className, children }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
