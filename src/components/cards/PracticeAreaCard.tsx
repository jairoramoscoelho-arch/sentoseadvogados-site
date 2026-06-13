import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AreaIcon } from "@/components/icons/AreaIcon";
import type { PracticeArea } from "@/content/types";

// Estilizado para seção escura (usado na home, sobre fundo verde).
export function PracticeAreaCard({ area }: { area: PracticeArea }) {
  return (
    <Link
      href={`/areas/${area.slug}`}
      className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-500/40 hover:bg-white/[0.06]"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-4xl leading-none tabular-nums text-gold-400">
          {String(area.order).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="mb-1 h-px flex-1 bg-white/15" />
        <AreaIcon name={area.icon} className="h-5 w-5 shrink-0 text-gold-400" />
      </div>
      <h3 className="mt-6 font-serif text-xl text-white">{area.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-white/55">
        {area.summary}
      </p>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gold-400">
        Saiba mais
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
