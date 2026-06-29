"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOALS = [
  { value: "FAT_LOSS", label: "Fat Loss" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "LONGEVITY", label: "Longevity" },
  { value: "RECOVERY", label: "Recovery" },
  { value: "SKIN_HAIR", label: "Skin & Hair" },
  { value: "COGNITIVE", label: "Cognitive Performance" },
  { value: "LIBIDO", label: "Libido" },
  { value: "SLEEP", label: "Sleep Quality" },
  { value: "INJURY_REPAIR", label: "Injury Repair" },
  { value: "GENERAL_WELLNESS", label: "General Wellness" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<string[]>([]);
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("MALE");
  const [experienceLevel, setExperienceLevel] = useState("BEGINNER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleGoal(value: string) {
    setGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (goals.length === 0) {
      setError("Select at least one goal.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goals,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        age: Number(age),
        sex,
        experienceLevel,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Build your profile</h1>
      <p className="mt-2 text-gray-400">
        We use this to recommend peptides and track your stack against
        typical guidance.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            What are your goals? (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GOALS.map((g) => (
              <button
                type="button"
                key={g.value}
                onClick={() => toggleGoal(g.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  goals.includes(g.value)
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Weight (kg)</label>
            <input
              required
              type="number"
              min={1}
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Height (cm)</label>
            <input
              required
              type="number"
              min={1}
              step="0.1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Age</label>
            <input
              required
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-emerald-400"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Experience level
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-emerald-400"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save profile & see recommendations"}
        </button>
      </form>
    </div>
  );
}
