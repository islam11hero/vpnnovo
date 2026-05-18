import Link from "next/link";
import { Shield } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#3B82F6] p-2 shadow-sm shadow-blue-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-poppins text-lg font-black tracking-tight text-slate-900">
              IPNOVA
            </span>
          </Link>
        </div>
      </header>
      <main className="px-4 py-6 lg:px-6 lg:py-8">{children}</main>
    </div>
  );
}
