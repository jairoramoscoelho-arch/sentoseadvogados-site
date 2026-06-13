import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-green-700 text-white hover:bg-green-800",
  accent: "bg-gold-500 text-green-900 hover:bg-gold-600",
  outline:
    "border border-green-700/25 text-green-800 hover:border-green-700/50 hover:bg-green-50",
  ghost: "text-green-800 hover:bg-green-50",
  light: "bg-white text-green-800 shadow-soft hover:bg-cream",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm", // 44px de altura — alvo de toque
  lg: "h-12 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps | "href"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, ...domProps } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const href = (domProps as { href?: string }).href;
  if (href) {
    const external = href.startsWith("http");
    return (
      <Link
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(domProps as ButtonAsLink)}
      />
    );
  }

  return (
    <button className={classes} {...(domProps as ComponentPropsWithoutRef<"button">)} />
  );
}
