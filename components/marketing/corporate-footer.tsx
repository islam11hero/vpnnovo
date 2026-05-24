import Link from "next/link";
import { Building, Mail, Shield } from "lucide-react";

const SOLUTIONS = [
  { label: "GCC Pricing", href: "/gcc" },
  { label: "China Pricing", href: "/china" },
  { label: "Ad Verification", href: "/#use-cases" },
  { label: "Brand Protection", href: "/#use-cases" },
  { label: "Remote Workforce ZTNA", href: "/#use-cases" },
  { label: "Enterprise Sales", href: "/sales" },
] as const;

const LEGAL = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Acceptable Use Policy", href: "/aup" },
] as const;

/** Corporate footer for public marketing & legal pages only (via `(public)` layout). */
export function CorporateFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 px-6 pt-16 pb-10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Shield className="h-7 w-7 text-cyan-400" aria-hidden />
              <span className="font-poppins text-xl font-black text-white">IPNOVA</span>
            </Link>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-500">
              Global network infrastructure for enterprise data intelligence, ad
              verification, and secure distributed workforce access.
            </p>
            <div className="mt-6 flex items-start gap-2 text-sm text-slate-500">
              <Building className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
              <address className="not-italic leading-relaxed">
                IPNOVA Technologies Ltd.
                <br />
                Kemp House, 152-160 City Road
                <br />
                London, EC1V 2NX, United Kingdom
              </address>
            </div>
          </div>

          <nav aria-labelledby="footer-solutions">
            <h3
              id="footer-solutions"
              className="mb-4 text-sm font-bold tracking-wide text-white"
            >
              Solutions
            </h3>
            <ul className="space-y-2.5">
              {SOLUTIONS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-500 transition hover:text-cyan-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h3
              id="footer-legal"
              className="mb-4 text-sm font-bold tracking-wide text-white"
            >
              Legal
            </h3>
            <ul className="space-y-2.5">
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-500 transition hover:text-cyan-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h3
              id="footer-company"
              className="mb-4 text-sm font-bold tracking-wide text-white"
            >
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:abuse@ipnova.com"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-cyan-400"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  abuse@ipnova.com
                </a>
                <p className="mt-1 text-xs text-slate-600">Abuse &amp; compliance desk</p>
              </li>
              <li>
                <a
                  href="mailto:support@ipnova.com"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-cyan-400"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  support@ipnova.com
                </a>
              </li>
              <li>
                <Link
                  href="/sales"
                  className="text-sm font-medium text-slate-500 transition hover:text-cyan-400"
                >
                  Enterprise Sales
                </Link>
              </li>
              <li>
                <Link
                  href="/portal"
                  className="text-sm font-medium text-slate-500 transition hover:text-cyan-400"
                >
                  Client Portal
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-slate-800 pt-8 text-center text-xs font-medium text-slate-600">
          © {year} IPNOVA Technologies Ltd. All rights reserved. Network intelligence
          services subject to Terms, Privacy, Refund, and Acceptable Use policies.
        </p>
      </div>
    </footer>
  );
}
