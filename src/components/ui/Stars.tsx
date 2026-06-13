import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-0.5 text-gold-500", className)}
      role="img"
      aria-label={`${rating} de 5 estrelas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < rating ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
