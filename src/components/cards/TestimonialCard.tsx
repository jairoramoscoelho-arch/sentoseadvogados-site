import { Stars } from "@/components/ui/Stars";
import type { Testimonial } from "@/content/types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-xl bg-white/5 p-7 ring-1 ring-white/10">
      <Stars rating={testimonial.rating} />
      <blockquote className="mt-4 flex-1 text-sm leading-7 text-white/85">
        {testimonial.text}
      </blockquote>
      <figcaption className="mt-6 font-serif text-base font-semibold text-white">
        {testimonial.author}
      </figcaption>
    </figure>
  );
}
