"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToStackClientButton({
  peptideId,
  status = "PLANNED",
  label = "Add to my stack",
}: {
  peptideId: string;
  status?: "ACTIVE" | "PLANNED";
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/stack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peptideId, status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="mt-4 w-full rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
    >
      {loading ? "Adding..." : label}
    </button>
  );
}
