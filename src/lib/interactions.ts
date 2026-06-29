// Neutral, non-instructional interaction notes sourced from the
// prototype's clinician-reviewed reference set. These flag that a
// combination is discussed in literature/community use — they never
// tell the user what to take, skip, or do.
export const INTERACTION_NOTES: { pair: [string, string]; note: string }[] = [
  {
    pair: ["semaglutide", "tirzepatide"],
    note: "Both are incretin-pathway agonists. Concurrent use is commonly flagged in literature for overlapping GI effects. Confirm with your provider before combining.",
  },
  {
    pair: ["semaglutide", "retatrutide"],
    note: "Both act on overlapping incretin pathways. Stacking GLP-1-class agents is a common provider discussion point — confirm with your prescriber.",
  },
  {
    pair: ["tirzepatide", "retatrutide"],
    note: "Both involve GIP/GLP-1 receptor activity. Overlapping mechanism is commonly discussed in provider visits before combining.",
  },
  {
    pair: ["cjc-1295-ipamorelin", "ipamorelin"],
    note: "Both are growth-hormone secretagogues. Using a combination product alongside a standalone version of one of its components is a common protocol-design question to raise with a provider.",
  },
  {
    pair: ["bpc-157", "tb-500"],
    note: "Frequently stacked in recovery protocols in community use; literature on the combined profile is more limited than for either compound alone — a good topic to raise with a provider.",
  },
  {
    pair: ["melanotan-ii", "pt-141"],
    note: "Both act on melanocortin receptor pathways. Overlapping mechanism is a common discussion point for providers evaluating combined use.",
  },
  {
    pair: ["sermorelin", "cjc-1295-ipamorelin"],
    note: "Both are GHRH-pathway secretagogues. Layering multiple GH-axis compounds is commonly reviewed with a provider before stacking.",
  },
  {
    pair: ["hexarelin", "ipamorelin"],
    note: "Both are ghrelin-receptor agonists. Using two compounds in the same class is a common stacking question for a provider visit.",
  },
];

export function findInteractions(slugs: string[]) {
  const set = new Set(slugs);
  return INTERACTION_NOTES.filter((n) => set.has(n.pair[0]) && set.has(n.pair[1]));
}
