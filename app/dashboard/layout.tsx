import Link from "next/link";
import { Fingerprint, Shield } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="font-poppins text-lg font-black tracking-tight text-white">
              IPNOVA
            </span>
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-bold tracking-widest text-cyan-500/90 uppercase sm:flex">
            <Fingerprint className="h-3.5 w-3.5" />
            OPSEC Security Vault
          </span>
        </div>
      </header>
      <main className="px-4 py-6 lg:px-6 lg:py-8">{children}</main>
    </div>
  );
}
