import { DoseLog, Goal, Peptide, StackItem } from "@prisma/client";
import { ProfileInput } from "@/lib/recommend";

export type StackItemWithRelations = StackItem & {
  peptide: Peptide;
  doseLogs: DoseLog[];
};

export type FlagType = "KEEP" | "CUT_DOSE" | "CUT_FREQUENCY" | "CUT_CYCLE_LENGTH" | "STOPPED";

export type StackFlag = {
  stackItemId: string;
  peptideName: string;
  flag: FlagType;
  message: string;
};

export type GapSuggestion = {
  goal: Goal;
  message: string;
};

export type StackAnalysis = {
  flags: StackFlag[];
  gaps: GapSuggestion[];
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_WEEK = MS_PER_DAY * 7;

/**
 * Deterministic analysis of a user's active stack against the peptide
 * catalog's typical dosage/cycle parameters and the user's stated goals.
 *
 * - "keep taking": dose history is within typical range and cycle length
 *   is within bounds -> KEEP
 * - "cut down": logged average dose exceeds the peptide's typical max,
 *   logged frequency is higher than the recommended cadence, or the
 *   item has been active longer than the typical max cycle length
 * - "consider adding": a goal in the user's profile has no active or
 *   planned stack item covering it
 */
export function analyzeStack(
  profile: ProfileInput,
  stackItems: StackItemWithRelations[],
  catalog: Peptide[],
): StackAnalysis {
  const flags: StackFlag[] = [];
  const now = new Date();

  const activeItems = stackItems.filter((item) => item.status === "ACTIVE");

  for (const item of activeItems) {
    const { peptide, doseLogs } = item;

    if (doseLogs.length === 0) {
      flags.push({
        stackItemId: item.id,
        peptideName: peptide.name,
        flag: "KEEP",
        message: `No doses logged yet for ${peptide.name}. Log a dose to start tracking adherence.`,
      });
      continue;
    }

    const sortedLogs = [...doseLogs].sort(
      (a, b) => a.takenAt.getTime() - b.takenAt.getTime(),
    );

    const avgAmount =
      sortedLogs.reduce((sum, log) => sum + log.amount, 0) / sortedLogs.length;

    // Estimate weekly frequency from the logged history's actual cadence.
    const firstDose = sortedLogs[0].takenAt;
    const lastDose = sortedLogs[sortedLogs.length - 1].takenAt;
    const spanDays = Math.max(
      1,
      (lastDose.getTime() - firstDose.getTime()) / MS_PER_DAY,
    );
    const dosesPerWeek = (sortedLogs.length / spanDays) * 7;

    // Cycle length: time since the item was started.
    const startedAt = item.startedAt ?? firstDose;
    const weeksActive = (now.getTime() - startedAt.getTime()) / MS_PER_WEEK;

    const reasons: string[] = [];
    let flag: FlagType = "KEEP";

    if (avgAmount > peptide.typicalDoseMax) {
      flag = "CUT_DOSE";
      reasons.push(
        `Average logged dose (${avgAmount.toFixed(1)}${peptide.doseUnit}) is above the typical max of ${peptide.typicalDoseMax}${peptide.doseUnit}.`,
      );
    }

    const typicalDosesPerWeek = parseFrequencyToPerWeek(peptide.frequency);
    if (typicalDosesPerWeek && dosesPerWeek > typicalDosesPerWeek * 1.25) {
      flag = "CUT_FREQUENCY";
      reasons.push(
        `You're dosing about ${dosesPerWeek.toFixed(1)}x/week, more often than the typical "${peptide.frequency}" cadence.`,
      );
    }

    if (weeksActive > peptide.cycleWeeksMax) {
      flag = "CUT_CYCLE_LENGTH";
      reasons.push(
        `You've been running ${peptide.name} for ~${Math.round(weeksActive)} weeks, beyond the typical max cycle of ${peptide.cycleWeeksMax} weeks. Consider a break.`,
      );
    }

    if (reasons.length === 0) {
      reasons.push(
        `Dosing looks consistent with typical guidance for ${peptide.name}. Keep going.`,
      );
    }

    flags.push({
      stackItemId: item.id,
      peptideName: peptide.name,
      flag,
      message: reasons.join(" "),
    });
  }

  // Gap analysis: goals not covered by any active or planned stack item.
  const coveredGoals = new Set<Goal>();
  for (const item of stackItems) {
    if (item.status === "ACTIVE" || item.status === "PLANNED") {
      for (const g of item.peptide.goals) {
        coveredGoals.add(g);
      }
    }
  }

  const gaps: GapSuggestion[] = [];
  for (const goal of profile.goals) {
    if (coveredGoals.has(goal)) {
      continue;
    }
    const candidate = catalog.find((p) => p.goals.includes(goal));
    if (candidate) {
      gaps.push({
        goal,
        message: `Your goal "${formatGoal(goal)}" isn't covered by your current stack. Consider adding ${candidate.name}.`,
      });
    }
  }

  return { flags, gaps };
}

function parseFrequencyToPerWeek(frequency: string): number | null {
  const lower = frequency.toLowerCase();
  if (lower.includes("once daily") || lower === "daily") return 7;
  if (lower.includes("twice daily")) return 14;
  if (lower.includes("5x/week") || lower.includes("5 days on")) return 5;
  if (lower.includes("once weekly") || lower.includes("weekly")) return 1;
  if (lower.includes("twice weekly")) return 2;
  if (lower.includes("every other day") || lower.includes("eod")) return 3.5;
  return null;
}

function formatGoal(goal: Goal): string {
  return goal
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
