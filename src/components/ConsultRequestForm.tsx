"use client";

import { useState } from "react";

export default function ConsultRequestForm({
  peptideId,
  peptideName,
}: {
  peptideId: string;
  peptideName: string;
}) {
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peptideId, reason, history: history || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-sm text-emerald-300">
        Intake submitted. A licensed provider will review your request before anything is
        prescribed or shipped.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
      <p className="text-sm text-amber-200">
        {peptideName} can&apos;t be added directly — a licensed provider must review your intake
        first.
      </p>
      <label className="mt-3 block text-xs text-gray-400">What are you hoping to address?</label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
        rows={2}
      />
      <label className="mt-2 block text-xs text-gray-400">Relevant medical history</label>
      <textarea
        value={history}
        onChange={(e) => setHistory(e.target.value)}
        placeholder="Conditions, current medications, allergies"
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
        rows={2}
      />
      <label className="mt-2 flex items-start gap-2 text-xs text-gray-400">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
        I understand a licensed provider will review this intake and that nothing is prescribed or
        shipped until that review is complete.
      </label>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <button
        onClick={submit}
        disabled={!reason || !agree || loading}
        className="mt-3 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit for provider review"}
      </button>
    </div>
  );
}
