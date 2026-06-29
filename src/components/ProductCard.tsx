"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string;
  priceOneTimeCents: number;
};

export default function ProductCard({
  product,
  stripeConfigured,
}: {
  product: Product;
  stripeConfigured: boolean;
}) {
  const [loading, setLoading] = useState<"payment" | "subscription" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(mode: "payment" | "subscription") {
    setError(null);
    setLoading(mode);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed.");
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error.");
      setLoading(null);
    }
  }

  const priceDisplay = (product.priceOneTimeCents / 100).toFixed(2);

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
      <p className="mt-2 flex-1 text-sm text-gray-400">{product.description}</p>
      <p className="mt-4 text-2xl font-bold text-white">${priceDisplay}</p>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => checkout("payment")}
          disabled={!stripeConfigured || loading !== null}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading === "payment" ? "Redirecting..." : "Buy once"}
        </button>
        <button
          onClick={() => checkout("subscription")}
          disabled={!stripeConfigured || loading !== null}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 disabled:opacity-50"
        >
          {loading === "subscription" ? "Redirecting..." : "Subscribe monthly"}
        </button>
      </div>
    </div>
  );
}
