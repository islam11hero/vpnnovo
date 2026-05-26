import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type MarketingVisualProps = {
  src: string;
  alt: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  accent?: "cyan" | "violet" | "emerald";
  priority?: boolean;
};

const ACCENT_STYLES = {
  cyan: {
    border: "border-cyan-500/30 hover:border-cyan-500/50",
    link: "text-cyan-400 group-hover:text-cyan-300",
  },
  violet: {
    border: "border-violet-500/30 hover:border-violet-500/50",
    link: "text-violet-400 group-hover:text-violet-300",
  },
  emerald: {
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    link: "text-emerald-400 group-hover:text-emerald-300",
  },
} as const;

export function MarketingVisual({
  src,
  alt,
  title,
  description,
  cta,
  accent = "cyan",
  priority = false,
}: MarketingVisualProps) {
  const styles = ACCENT_STYLES[accent];

  const inner = (
    <article
      className={`group overflow-hidden rounded-2xl border bg-slate-950/80 transition ${styles.border}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent"
          aria-hidden
        />
      </div>
      <div className="p-5 md:p-6">
        <h3 className="font-poppins text-lg font-bold text-white md:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
          {description}
        </p>
        {cta ? (
          <span
            className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${styles.link}`}
          >
            {cta.label}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        ) : null}
      </div>
    </article>
  );

  if (cta) {
    return (
      <Link
        href={cta.href}
        className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
