import Link from "next/link";
import { Shield } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="font-poppins text-lg font-black tracking-tight text-white">
              IPNOVA
            </span>
          </Link>
          <Link
            href="/pricing"
            className="hidden text-xs font-bold text-slate-400 transition hover:text-cyan-400 sm:inline"
          >
            Upgrade plan
          </Link>
        </div>
      </header>
      <main className="px-4 py-6 lg:px-6 lg:py-8">{children}</main>
    </div>
  );
}
