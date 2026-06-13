import Link from "next/link";
import Image from "next/image";
import { formatDatePtBr } from "@/lib/utils";
import type { BlogMeta } from "@/content/types";

export function PostCard({ post }: { post: BlogMeta }) {
  const href = `/blog/${post.slug}`;
  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative block aspect-[16/10] w-full overflow-hidden rounded-xl"
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.cover ? (
          <Image
            src={post.cover}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-700 to-green-900">
            <span className="font-serif text-lg text-gold-400">
              {post.category}
            </span>
          </div>
        )}
      </Link>
      <div className="mt-4 flex items-center gap-3 text-xs text-muted">
        <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
          {post.category}
        </span>
        <time dateTime={post.date}>{formatDatePtBr(post.date)}</time>
      </div>
      <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-green-800">
        <Link href={href}>{post.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
        {post.excerpt}
      </p>
    </article>
  );
}
