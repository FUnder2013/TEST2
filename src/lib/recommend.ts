import { ExperienceLevel, Goal, Peptide, Sex } from "@prisma/client";

export type ProfileInput = {
  goals: Goal[];
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  experienceLevel: ExperienceLevel;
};

export type Recommendation = {
  peptide: Peptide;
  score: number;
  matchedGoals: Goal[];
  reasons: string[];
};

/**
 * Weight applied per matched goal. Earlier goals in a user's profile are
 * treated as higher priority, so the first goal listed gets the largest
 * boost.
 */
function goalWeight(goalIndex: number): number {
  return Math.max(1, 5 - goalIndex);
}

/**
 * Pure, deterministic rule-based recommendation engine.
 *
 * Scores every peptide in the catalog against the user's profile based on
 * overlap between the user's stated goals and the peptide's known goals,
 * then applies experience-level and age/sex based adjustments and caution
 * surfacing. No randomness, no external calls — same input always produces
 * the same output, which makes this unit-testable.
 */
export function recommendPeptides(
  profile: ProfileInput,
  catalog: Peptide[],
): Recommendation[] {
  const results: Recommendation[] = [];

  for (const peptide of catalog) {
    const matchedGoals = peptide.goals.filter((g) => profile.goals.includes(g));
    if (matchedGoals.length === 0) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    for (const goal of matchedGoals) {
      const idx = profile.goals.indexOf(goal);
      score += goalWeight(idx);
    }
    reasons.push(
      `Matches your goal${matchedGoals.length > 1 ? "s" : ""}: ${matchedGoals
        .map(formatGoal)
        .join(", ")}.`,
    );

    // Experience-level adjustments: beginners are nudged toward
    // gentler / better-studied compounds, advanced users get a small
    // boost toward more aggressive/advanced compounds.
    const advancedCompounds: string[] = ["Melanotan II", "Tirzepatide"];
    const beginnerFriendly: string[] = [
      "BPC-157",
      "Sermorelin",
      "GHK-Cu",
      "Epitalon",
    ];

    if (profile.experienceLevel === "BEGINNER") {
      if (advancedCompounds.includes(peptide.name)) {
        score -= 2;
        reasons.push(
          "Often better suited to more experienced users — proceed cautiously and consult a clinician.",
        );
      }
      if (beginnerFriendly.includes(peptide.name)) {
        score += 1;
        reasons.push("Well-studied and commonly recommended as a starting point.");
      }
    }

    if (profile.experienceLevel === "ADVANCED" && advancedCompounds.includes(peptide.name)) {
      score += 1;
    }

    // Age-based nuance: longevity-oriented compounds score slightly
    // higher for users over 40, since that's the population most likely
    // to be pursuing longevity/recovery goals in practice.
    if (profile.age >= 40 && peptide.category === "LONGEVITY") {
      score += 1;
      reasons.push("Commonly explored by users in your age range for longevity support.");
    }

    // Sex-specific caution surfacing (informational only, never excludes).
    if (peptide.name === "Melanotan II" && profile.sex === "FEMALE") {
      reasons.push("Note: some users report stronger libido/skin-pigmentation effects — start low.");
    }

    // BMI-informed nuance for weight-loss-oriented compounds.
    if (profile.goals.includes("FAT_LOSS") && peptide.category === "WEIGHT_LOSS") {
      const heightM = profile.heightCm / 100;
      const bmi = profile.weightKg / (heightM * heightM);
      if (bmi >= 27) {
        score += 2;
        reasons.push("Your profile suggests a body composition where GLP-1 therapies tend to show strong results.");
      } else if (bmi < 22) {
        score -= 1;
        reasons.push("At your current body composition, effects may be more modest — consider alongside other goals.");
      }
    }

    reasons.push(peptide.cautions);

    results.push({ peptide, score, matchedGoals, reasons });
  }

  return results.sort((a, b) => b.score - a.score);
}

function formatGoal(goal: Goal): string {
  return goal
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
