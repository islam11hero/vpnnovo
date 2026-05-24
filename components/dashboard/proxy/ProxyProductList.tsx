"use client";

import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  PROXY_CATEGORY_LABELS,
  PROXY_PRODUCTS,
  type ProxyCategory,
  type ProxyProduct,
} from "@/lib/proxy-catalog";
import { getProxyProductDetail } from "@/lib/proxy-product-config";

type Props = {
  category: ProxyCategory | "all";
  onCategoryChange: (cat: ProxyCategory | "all") => void;
  onSelectProduct: (productId: string) => void;
};

function startingPrice(product: ProxyProduct): string {
  const detail = getProxyProductDetail(product.id);
  const tier = detail?.tiers[0];
  const price = tier?.unitPriceUsd ?? product.priceUsd;
  const unit = tier?.unitLabel ?? product.unitLabel;
  return `From $${price}/${unit}`;
}

export function ProxyProductList({
  category,
  onCategoryChange,
  onSelectProduct,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = PROXY_PRODUCTS;
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        PROXY_CATEGORY_LABELS[p.category].toLowerCase().includes(q),
    );
  }, [category, query]);

  const grouped = useMemo(() => {
    const map = new Map<ProxyCategory, ProxyProduct[]>();
    for (const p of filtered) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search proxy types…"
          className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/15"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onCategoryChange("all")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
            category === "all"
              ? "bg-cyan-500 text-slate-950"
              : "border border-slate-700 text-slate-400"
          }`}
        >
          All
        </button>
        {(Object.keys(PROXY_CATEGORY_LABELS) as ProxyCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              category === cat
                ? "bg-cyan-500 text-slate-950"
                : "border border-slate-700 text-slate-400"
            }`}
          >
            {PROXY_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([cat, products]) => (
          <section key={cat}>
            <h3 className="mb-2 px-1 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
              {PROXY_CATEGORY_LABELS[cat]}
            </h3>
            <ul className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
              {products.map((product, index) => (
                <li
                  key={product.id}
                  className={
                    index > 0 ? "border-t border-slate-800/80" : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product.id)}
                    className="group flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-900/80"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-poppins text-sm font-bold text-white group-hover:text-cyan-100">
                          {product.name}
                        </p>
                        {product.popular ? (
                          <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-black text-cyan-400 uppercase">
                            Popular
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {product.protocol} · {product.description}
                      </p>
                      <p className="mt-1.5 text-xs font-bold text-cyan-400/90">
                        {startingPrice(product)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-600 transition group-hover:text-cyan-400" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No products match your search.
        </p>
      ) : null}
    </div>
  );
}
