import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AreaIcon } from "@/components/icons/AreaIcon";
import type { PracticeArea } from "@/content/types";

export function PracticeAreaCard({ area }: { area: PracticeArea }) {
  return (
    <Link
      href={`/areas/${area.slug}`}
      className="group relative flex flex-col rounded-xl border border-line bg-paper p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-700/30 hover:shadow-card"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-4xl leading-none tabular-nums text-gold-500">
          {String(area.order).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="mb-1 h-px flex-1 bg-line" />
        <AreaIcon
          name={area.icon}
          className="h-5 w-5 shrink-0 text-green-700"
        />
      </div>
      <h3 className="mt-6 font-serif text-xl text-ink">{area.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{area.summary}</p>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-green-700">
        Saiba mais
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
