import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type ContainerProps<T extends ElementType> = {
  as?: T;
  width?: "default" | "wide" | "narrow";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "width">;

const widths = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export function Container<T extends ElementType = "div">({
  as,
  width = "default",
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("mx-auto w-full px-5 sm:px-8", widths[width], className)}
      {...props}
    />
  );
}
