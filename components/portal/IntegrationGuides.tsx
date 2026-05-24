import { ChevronDown, Code2, Globe, Smartphone } from "lucide-react";

const GUIDES = [
  {
    id: "mobile",
    icon: Smartphone,
    emoji: "📱",
    title: "Mobile & PC (v2rayNG / V2Box)",
    body: (
      <p className="text-sm font-medium leading-relaxed text-slate-400">
        Copy your Subscription Link above. Open the app and select{" "}
        <strong className="text-white">
          Update Subscription from Clipboard
        </strong>
        . Connect — your traffic routes through our clean Spanish egress.
      </p>
    ),
  },
  {
    id: "adspower",
    icon: Globe,
    emoji: "🕵️‍♂️",
    title: "AdsPower / Anti-Detect Browsers",
    body: (
      <p className="text-sm font-medium leading-relaxed text-slate-400">
        We support local SOCKS5 routing. Import your link into{" "}
        <strong className="text-white">v2rayN</strong> (PC) or{" "}
        <strong className="text-white">Nekoray</strong>. Enable system proxy.
        In AdsPower, set Proxy to{" "}
        <strong className="text-white">Socks5</strong>, IP{" "}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-cyan-300">
          127.0.0.1
        </code>
        , Port{" "}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-cyan-300">
          10808
        </code>
        . This guarantees 0% DNS leaks.
      </p>
    ),
  },
  {
    id: "scrapers",
    icon: Code2,
    emoji: "💻",
    title: "Python / Node.js Scrapers",
    body: (
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-slate-400">
          Route HTTP clients through the local SOCKS5 tunnel exposed by v2rayN /
          Nekoray after importing your subscription:
        </p>
        <pre className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-5 text-left text-sm leading-relaxed text-emerald-300 shadow-inner">
          <code>{`import requests

proxies = {
    "http": "socks5://127.0.0.1:10808",
    "https": "socks5://127.0.0.1:10808",
}
res = requests.get("https://api.ipify.org", proxies=proxies)
print(res.text)  # Should show your Spanish egress IP`}</code>
        </pre>
        <p className="text-xs font-medium text-slate-500">
          Node.js: use <code className="font-mono">socks-proxy-agent</code> with
          the same <code className="font-mono">127.0.0.1:10808</code> endpoint.
        </p>
      </div>
    ),
  },
] as const;

type IntegrationGuidesProps = {
  embedded?: boolean;
};

export function IntegrationGuides({ embedded = false }: IntegrationGuidesProps) {
  const isDark = embedded;

  return (
    <section
      className={
        isDark
          ? "rounded-2xl border border-slate-800 bg-slate-950/60 p-6 md:p-8"
          : "rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
      }
    >
      {!embedded ? (
        <>
          <h2 className="mb-2 font-poppins text-xl font-bold text-slate-900">
            Integration &amp; Setup Guides
          </h2>
          <p className="mb-6 text-sm font-medium text-slate-500">
            Built for developers, scrapers, and anti-detect browser workflows.
          </p>
        </>
      ) : (
        <h3 className="mb-6 font-poppins text-lg font-bold text-white">
          Integration &amp; Setup Guides
        </h3>
      )}
      <div className="space-y-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <details
              key={guide.id}
              className={
                isDark
                  ? "group rounded-2xl border border-slate-800 bg-slate-900/50 open:border-cyan-500/20 open:bg-slate-900"
                  : "group rounded-2xl border border-slate-200 bg-slate-50/50 open:bg-white open:shadow-sm"
              }
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 font-bold transition-colors [&::-webkit-details-marker]:hidden ${
                  isDark
                    ? "text-white hover:bg-slate-800/80"
                    : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3 text-sm md:text-base">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                      isDark ? "border border-slate-700 bg-slate-950" : "bg-[#3B82F6]/10"
                    }`}
                  >
                    {guide.emoji}
                  </span>
                  <Icon
                    className={`hidden h-5 w-5 sm:block ${isDark ? "text-cyan-400" : "text-[#3B82F6]"}`}
                  />
                  {guide.title}
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div
                className={`border-t px-5 pb-5 pt-4 ${isDark ? "border-slate-800" : "border-slate-100"}`}
              >
                {guide.body}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
