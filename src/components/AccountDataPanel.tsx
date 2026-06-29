"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountDataPanel() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function reset() {
    setLoading(true);
    await fetch("/api/account/reset", { method: "POST" });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Your data</h2>
      <a
        href="/api/account/export"
        className="mt-3 block rounded-lg border border-white/10 px-4 py-2 text-center text-sm font-semibold text-white hover:border-white/30"
      >
        Export all data (JSON)
      </a>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="mt-3 w-full rounded-lg border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-400 hover:border-red-400"
        >
          Reset all logged data
        </button>
      ) : (
        <div className="mt-3 rounded-lg border border-red-400/40 bg-red-400/5 p-3">
          <p className="text-xs text-red-300">
            This permanently deletes your stack, doses, food, weight, sleep, hydration, and
            side-effect history. Your profile and goals are kept.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white"
            >
              Cancel
            </button>
            <button
              onClick={reset}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Confirm reset"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
