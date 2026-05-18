import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, FileText, Scale, ShieldCheck } from "lucide-react";

const LEGAL_NAV = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refund" },
  { href: "/aup", label: "AUP" },
  { href: "/sales", label: "Sales" },
] as const;

type LegalPageShellProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalPageShell({
  title,
  description,
  icon: Icon,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            IPNOVA Home
          </Link>
          <nav className="flex flex-wrap gap-2" aria-label="Legal documents">
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-4">
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            <Icon className="h-7 w-7 text-cyan-400" aria-hidden />
          </div>
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
              <Scale className="h-3.5 w-3.5" aria-hidden />
              Legal &amp; Compliance
            </p>
            <h1 className="font-poppins text-3xl font-black text-white md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-400">{description}</p>
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Last updated: {lastUpdated}
              <span className="text-slate-700">·</span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" aria-hidden />
              Enterprise policy document
            </p>
          </div>
        </div>
      </div>

      <article className="prose prose-slate prose-invert mx-auto max-w-4xl px-6 py-16 prose-headings:font-poppins prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
        {children}
      </article>
    </div>
  );
}
