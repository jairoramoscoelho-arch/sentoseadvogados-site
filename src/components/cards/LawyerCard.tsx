import Link from "next/link";
import Image from "next/image";
import { initials } from "@/lib/utils";
import type { Lawyer } from "@/content/types";

export function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <Link href={`/equipe/${lawyer.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
        {lawyer.photo ? (
          <Image
            src={lawyer.photo}
            alt={lawyer.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-700 to-green-900">
            <span
              aria-hidden="true"
              className="font-serif text-4xl font-semibold text-gold-400"
            >
              {initials(lawyer.name)}
            </span>
          </div>
        )}
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-ink transition-colors group-hover:text-green-800">
        {lawyer.name}
      </h3>
      <p className="text-sm text-muted">{lawyer.role}</p>
    </Link>
  );
}
