import {
  Cloud,
  Fingerprint,
  Globe,
  Lock,
  Network,
  ShieldCheck,
} from "lucide-react";

const CAPABILITIES = [
  {
    icon: Network,
    title: "Zero-Trust Network Access (ZTNA)",
    body: "Enforce least-privilege connectivity with identity-bound sessions, device posture checks, and per-application segmentation—without exposing your corporate LAN to the public internet.",
    tags: ["Identity-Aware", "Micro-Segmentation", "Policy Engine"],
  },
  {
    icon: Globe,
    title: "Global Dedicated Private Nodes",
    body: "Provision isolated egress capacity on dedicated infrastructure in EU, US, and APAC regions. Predictable latency for SaaS, ERP, and internal tooling accessed by remote staff.",
    tags: ["Dedicated IPs", "Regional PoPs", "SLA-Backed"],
  },
  {
    icon: Lock,
    title: "AES-256 Encrypted Tunnels",
    body: "All corporate traffic transits modern TLS 1.3 and AES-256-GCM protected channels. Cryptographic agility is maintained for regulated industries and vendor security questionnaires.",
    tags: ["TLS 1.3", "Perfect Forward Secrecy", "FIPS-Aligned"],
  },
  {
    icon: Fingerprint,
    title: "Threat Protection & Posture",
    body: "Continuous monitoring for anomalous session behavior, credential abuse, and lateral movement indicators. Security teams receive actionable signals—not noise.",
    tags: ["Anomaly Detection", "Session Telemetry", "SOC Integration"],
  },
  {
    icon: Cloud,
    title: "Secure Remote Workforce Access",
    body: "Replace legacy remote-access appliances with a cloud-native control plane. Onboard contractors and distributed employees in minutes with centralized revocation.",
    tags: ["SSO-Ready", "Instant Revoke", "Audit Logs"],
  },
  {
    icon: ShieldCheck,
    title: "Compliance-Ready Operations",
    body: "Published legal policies, abuse desk, and transparent billing through Stripe. Built for enterprises undergoing vendor risk review and payment-processor underwriting.",
    tags: ["GDPR", "DPA Available", "Abuse Desk"],
  },
] as const;

export function EnterpriseCapabilities() {
  return (
    <section
      id="capabilities"
      className="border-y border-slate-800/80 bg-slate-950 px-6 py-24"
      aria-labelledby="capabilities-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 max-w-3xl">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Enterprise platform
          </p>
          <h2
            id="capabilities-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            Built for security teams, not consumer apps.
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-400">
            IPNOVA delivers Zero-Trust connectivity, encrypted transport, and
            dedicated infrastructure—aligned with how modern CISOs procure network
            security.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-md transition hover:border-cyan-500/30"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <item.icon className="h-6 w-6 text-cyan-400" aria-hidden />
              </div>
              <h3 className="mb-3 font-poppins text-xl font-bold text-white">
                {item.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-slate-400">
                {item.body}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-bold text-slate-300"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
