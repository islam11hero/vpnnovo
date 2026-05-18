import Link from "next/link";
import { Shield } from "lucide-react";


export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="rounded-xl bg-[#3B82F6] p-2">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-poppins text-2xl font-black tracking-tight text-slate-900">
            IPNOVA
          </span>
        </Link>
        <div className="hidden items-center gap-8 font-medium text-slate-600 md:flex">
          <a href="#features" className="transition-colors hover:text-[#3B82F6]">
            Features
          </a>
          <a
            href="#testimonials"
            className="transition-colors hover:text-[#3B82F6]"
          >
            Reviews
          </a>
          <a href="#pricing" className="transition-colors hover:text-[#3B82F6]">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className="hidden text-sm font-bold text-slate-400 transition-colors hover:text-slate-800 md:block"
          >
            Client Portal
          </Link>
          <a
            href="#pricing"
            className="rounded-full bg-slate-900 px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-[#3B82F6] hover:shadow-blue-500/30"
          >
            Get Shield
          </a>
        </div>
      </div>
    </nav>
  );
}
