"use client";

import { useState } from "react";

export default function ReconCalculator() {
  const [vialMg, setVialMg] = useState(5);
  const [bacMl, setBacMl] = useState(2);
  const [doseMcg, setDoseMcg] = useState(250);

  const concentration = vialMg && bacMl ? (vialMg * 1000) / bacMl : 0; // mcg/mL
  const mlPerDose = concentration ? doseMcg / concentration : 0;
  const unitsOn100 = mlPerDose * 100; // insulin syringe units

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        Reconstitution calculator
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400">Vial size (mg)</label>
          <input
            type="number"
            value={vialMg}
            onChange={(e) => setVialMg(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400">BAC water (mL)</label>
          <input
            type="number"
            value={bacMl}
            onChange={(e) => setBacMl(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          />
        </div>
      </div>
      <label className="mt-3 block text-xs text-gray-400">Target dose (mcg)</label>
      <input
        type="number"
        value={doseMcg}
        onChange={(e) => setDoseMcg(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
      />
      <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-center">
        <div>
          <div className="text-[10px] uppercase text-gray-500">Concentration</div>
          <div className="font-mono text-sm font-bold text-emerald-400">
            {concentration.toFixed(1)} mcg/mL
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-gray-500">Volume/dose</div>
          <div className="font-mono text-sm font-bold text-emerald-400">
            {mlPerDose.toFixed(3)} mL
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-gray-500">Syringe units</div>
          <div className="font-mono text-sm font-bold text-emerald-400">
            {unitsOn100.toFixed(1)} U
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Pure unit math based on the numbers you enter — not a dosing recommendation. Confirm your
        target dose with a provider.
      </p>
    </div>
  );
}
