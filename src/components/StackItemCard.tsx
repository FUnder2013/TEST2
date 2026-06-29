"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DoseLog = {
  id: string;
  takenAt: string;
  amount: number;
  unit: string;
  note: string | null;
};

type Peptide = {
  id: string;
  name: string;
  doseUnit: string;
  typicalDoseMin: number;
  typicalDoseMax: number;
  frequency: string;
};

export type StackItemData = {
  id: string;
  status: "ACTIVE" | "PLANNED" | "STOPPED";
  startedAt: string | null;
  peptide: Peptide;
  doseLogs: DoseLog[];
};

export default function StackItemCard({ item }: { item: StackItemData }) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(item.peptide.typicalDoseMin));
  const [unit] = useState(item.peptide.doseUnit);
  const [takenAt, setTakenAt] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [busy, setBusy] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

  async function updateStatus(status: "ACTIVE" | "PLANNED" | "STOPPED") {
    setBusy(true);
    await fetch(`/api/stack/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  async function logDose(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(`/api/stack/${item.id}/doses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        takenAt: new Date(takenAt).toISOString(),
        amount: Number(amount),
        unit,
      }),
    });
    setBusy(false);
    setShowLogForm(false);
    router.refresh();
  }

  const statusColor =
    item.status === "ACTIVE"
      ? "bg-emerald-400/20 text-emerald-300"
      : item.status === "PLANNED"
        ? "bg-indigo-400/20 text-indigo-300"
        : "bg-gray-500/20 text-gray-400";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{item.peptide.name}</h3>
        <span className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${statusColor}`}>
          {item.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Typical: {item.peptide.typicalDoseMin}-{item.peptide.typicalDoseMax}
        {item.peptide.doseUnit} &middot; {item.peptide.frequency}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.status !== "ACTIVE" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("ACTIVE")}
            className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-400/10"
          >
            Mark active
          </button>
        )}
        {item.status !== "PLANNED" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("PLANNED")}
            className="rounded-full border border-indigo-400/40 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-400/10"
          >
            Mark planned
          </button>
        )}
        {item.status !== "STOPPED" && (
          <button
            disabled={busy}
            onClick={() => updateStatus("STOPPED")}
            className="rounded-full border border-gray-500/40 px-3 py-1 text-xs font-medium text-gray-400 hover:bg-gray-500/10"
          >
            Stop
          </button>
        )}
        {item.status === "ACTIVE" && (
          <button
            disabled={busy}
            onClick={() => setShowLogForm((v) => !v)}
            className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-400"
          >
            Log dose
          </button>
        )}
      </div>

      {showLogForm && (
        <form onSubmit={logDose} className="mt-4 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs text-gray-400">Amount ({unit})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400">When</label>
            <input
              type="datetime-local"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="mt-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Save
          </button>
        </form>
      )}

      {item.doseLogs.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-xs font-medium text-gray-500">Recent doses</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-400">
            {item.doseLogs.slice(0, 5).map((log) => (
              <li key={log.id}>
                {new Date(log.takenAt).toLocaleDateString()} — {log.amount}
                {log.unit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
