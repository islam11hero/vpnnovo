import { Check, X } from "lucide-react";

const ROWS = [
  { feature: "Pay with crypto (BTC/USDT)", ipnova: true, typical: false },
  { feature: "No email required — Order ID portal", ipnova: true, typical: false },
  { feature: "Proxy marketplace + VPN vault", ipnova: true, typical: false },
  { feature: "Free trial without card", ipnova: true, typical: "limited" as const },
  { feature: "VLESS Reality stealth", ipnova: true, typical: true },
] as const;

function Cell({ value }: { value: boolean | "limited" }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400">
        <Check className="h-4 w-4" aria-hidden />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (value === "limited") {
    return <span className="text-xs font-bold text-amber-400">Sometimes</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-slate-600">
      <X className="h-4 w-4" aria-hidden />
      <span className="sr-only">No</span>
    </span>
  );
}

export function ComparisonStrip() {
  return (
    <section
      className="px-6 py-16"
      aria-labelledby="comparison-heading"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="comparison-heading"
          className="mb-8 text-center font-poppins text-2xl font-black text-white md:text-3xl"
        >
          Why teams switch to IPNOVA
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3 text-center text-cyan-400">IPNOVA</th>
                <th className="px-4 py-3 text-center">Typical VPN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ROWS.map((row) => (
                <tr key={row.feature} className="bg-slate-950/60">
                  <td className="px-4 py-3.5 font-medium text-slate-300">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Cell value={row.ipnova} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Cell value={row.typical} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
