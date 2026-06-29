// Qualitative "active window" estimator only — not a pharmacokinetic
// claim, just short/medium/long bucketing for UI purposes, based on a
// peptide's half-life in hours.
export type ActivityBand = {
  label: "Likely active" | "Tapering" | "Likely cleared";
  colorKey: "good" | "amber" | "muted";
};

export function activityBand(halfLifeHours: number | null | undefined, hoursSince: number): ActivityBand {
  const hl = halfLifeHours ?? 4;
  if (hoursSince <= hl) return { label: "Likely active", colorKey: "good" };
  if (hoursSince <= hl * 4) return { label: "Tapering", colorKey: "amber" };
  return { label: "Likely cleared", colorKey: "muted" };
}

export function hoursSince(takenAt: Date): number {
  return (Date.now() - takenAt.getTime()) / 3600000;
}
