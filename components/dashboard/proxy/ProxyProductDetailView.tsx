"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { PROXY_CATEGORY_LABELS } from "@/lib/proxy-catalog";
import { calcProxyOrderQuote } from "@/lib/proxy-order-pricing";
import {
  getProxyProductDetail,
  type ProxyAddon,
  type ProxyPricingTier,
} from "@/lib/proxy-product-config";

const DURATION_OPTIONS = [7, 30, 90] as const;

type Props = {
  productId: string;
  vaultOrderId: string;
  onBack: () => void;
};

function TierRow({
  tier,
  selected,
  unitLabel,
  onSelect,
}: {
  tier: ProxyPricingTier;
  selected: boolean;
  unitLabel: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
        selected
          ? "border-cyan-500/50 bg-cyan-500/10"
          : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-cyan-400 bg-cyan-500" : "border-slate-600"
        }`}
      >
        {selected ? <Check className="h-3 w-3 text-slate-950" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-white">{tier.name}</span>
          {tier.badge ? (
            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-black text-cyan-400 uppercase">
              {tier.badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{tier.description}</span>
        <span className="mt-2 block text-sm font-bold text-cyan-300">
          ${tier.unitPriceUsd}
          <span className="font-medium text-slate-500">
            /{tier.unitLabel ?? unitLabel}
          </span>
          {tier.minQty > 1 ? (
            <span className="font-medium text-slate-600">
              {" "}
              · min {tier.minQty}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function AddonRow({
  addon,
  checked,
  onToggle,
}: {
  addon: ProxyAddon;
  checked: boolean;
  onToggle: () => void;
}) {
  const priceLabel =
    addon.priceUsd === 0
      ? "Included"
      : addon.priceType === "flat"
        ? `+$${addon.priceUsd}`
        : addon.priceType === "per_unit"
          ? `+$${addon.priceUsd}/unit`
          : `+$${addon.priceUsd}/mo`;

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition ${
        checked
          ? "border-cyan-500/40 bg-cyan-500/5"
          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-bold text-white">{addon.name}</span>
          <span className="text-xs font-bold text-cyan-400">{priceLabel}</span>
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{addon.description}</span>
      </span>
    </label>
  );
}

export function ProxyProductDetailView({
  productId,
  vaultOrderId,
  onBack,
}: Props) {
  const detail = getProxyProductDetail(productId);
  const [tierId, setTierId] = useState(detail?.tiers[0]?.id ?? "");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(detail?.tiers[0]?.defaultQty ?? 1);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [geoRequest, setGeoRequest] = useState("");
  const [userNote, setUserNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const tier = detail?.tiers.find((t) => t.id === tierId) ?? detail?.tiers[0];

  const quote = useMemo(() => {
    if (!detail || !tier) {
      return { quantity: 0, subtotalUsd: 0, addonsUsd: 0, totalUsd: 0 };
    }
    const addons = detail.addons.filter((a) => addonIds.includes(a.id));
    return calcProxyOrderQuote({
      product: detail.product,
      tier,
      quantity,
      durationDays,
      addons,
    });
  }, [detail, tier, quantity, durationDays, addonIds]);

  if (!detail || !tier) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Product not found.{" "}
        <button type="button" onClick={onBack} className="text-cyan-400 hover:underline">
          Back to catalog
        </button>
      </div>
    );
  }

  const { product } = detail;
  const showDuration =
    !product.unitLabel.toLowerCase().includes("gb") &&
    !product.unitLabel.toLowerCase().includes("request");

  const selectTier = (t: ProxyPricingTier) => {
    setTierId(t.id);
    setQuantity(t.defaultQty);
  };

  const toggleAddon = (id: string) => {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submit = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/proxy/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            tierId: tier.id,
            addonIds,
            quantity,
            durationDays,
            geoRequest,
            clientNote: userNote,
            vaultOrderId,
          }),
        });
        const data = (await res.json()) as {
          invoice_url?: string;
          error?: string;
        };
        if (!res.ok || !data.invoice_url) {
          toast.error(data.error ?? "Checkout failed");
          return;
        }
        toast.success("Redirecting to crypto checkout…");
        window.location.href = data.invoice_url;
      } catch {
        toast.error("Network error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catalog
      </button>

      <header className="border-b border-slate-800 pb-6">
        <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-500/80 uppercase">
          {PROXY_CATEGORY_LABELS[product.category]}
        </p>
        <h2 className="mt-1 font-poppins text-2xl font-bold text-white">
          {product.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          {product.description}
        </p>
        <p className="mt-2 text-xs font-medium text-slate-500">{product.protocol}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {detail.useCases.map((u) => (
            <li
              key={u}
              className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[11px] font-medium text-slate-400"
            >
              {u}
            </li>
          ))}
        </ul>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h3 className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
              Pricing tier
            </h3>
            <div className="space-y-2">
              {detail.tiers.map((t) => (
                <TierRow
                  key={t.id}
                  tier={t}
                  selected={t.id === tier.id}
                  unitLabel={product.unitLabel}
                  onSelect={() => selectTier(t)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
              Optional add-ons
            </h3>
            <div className="space-y-2">
              {detail.addons.map((addon) => (
                <AddonRow
                  key={addon.id}
                  addon={addon}
                  checked={addonIds.includes(addon.id)}
                  onToggle={() => toggleAddon(addon.id)}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Quantity ({tier.unitLabel ?? product.unitLabel})
              <input
                type="number"
                min={tier.minQty}
                max={tier.maxQty}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
              />
            </label>

            {showDuration ? (
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Billing period
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="block text-xs font-bold text-slate-500 uppercase sm:col-span-2">
              Target GEO (optional)
              <input
                type="text"
                value={geoRequest}
                onChange={(e) => setGeoRequest(e.target.value)}
                placeholder="US, UK, DE, MA…"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
              />
            </label>

            <label className="block text-xs font-bold text-slate-500 uppercase sm:col-span-2">
              Provisioning notes
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={3}
                placeholder="Rotation rules, profile count, whitelist IPs…"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
              />
            </label>
          </section>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-black/20">
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Order summary
            </p>
            <p className="mt-2 font-poppins text-lg font-bold text-white">
              {product.name}
            </p>
            <p className="text-xs text-cyan-400">{tier.name}</p>

            <dl className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-sm">
              <div className="flex justify-between gap-2 text-slate-400">
                <dt>Subtotal</dt>
                <dd className="font-bold text-slate-200">
                  ${quote.subtotalUsd.toFixed(2)}
                </dd>
              </div>
              {quote.addonsUsd > 0 ? (
                <div className="flex justify-between gap-2 text-slate-400">
                  <dt>Add-ons</dt>
                  <dd className="font-bold text-slate-200">
                    ${quote.addonsUsd.toFixed(2)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-2 border-t border-slate-800 pt-2">
                <dt className="font-bold text-white">Total</dt>
                <dd className="font-poppins text-xl font-black text-cyan-200">
                  ${quote.totalUsd.toFixed(2)}
                </dd>
              </div>
            </dl>

            <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
              Crypto via NOWPayments · USDT, BTC, ETH. Manual delivery 1–24h.
            </p>

            <button
              type="button"
              disabled={isPending || quote.totalUsd < 1}
              onClick={submit}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              Pay with Crypto
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
