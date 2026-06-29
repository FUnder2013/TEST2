"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PeptideOption = { id: string; name: string; category: string };

export default function AddPeptidePicker({
  peptides,
}: {
  peptides: PeptideOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(peptides[0]?.id ?? "");
  const [status, setStatus] = useState<"ACTIVE" | "PLANNED">("PLANNED");
  const [loading, setLoading] = useState(false);

  if (peptides.length === 0) {
    return (
      <p className="mt-3 text-sm text-gray-500">
        You&apos;ve added every peptide in the catalog.
      </p>
    );
  }

  async function handleAdd() {
    if (!selected) return;
    setLoading(true);
    await fetch("/api/stack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peptideId: selected, status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-gray-400">Peptide</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
        >
          {peptides.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ACTIVE" | "PLANNED")}
          className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
        </select>
      </div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to stack"}
      </button>
    </div>
  );
}
