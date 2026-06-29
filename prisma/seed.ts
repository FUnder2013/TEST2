import { PrismaClient, Goal, PeptideCategory } from "@prisma/client";

const prisma = new PrismaClient();

type PeptideSeed = {
  name: string;
  slug: string;
  category: PeptideCategory;
  goals: Goal[];
  description: string;
  typicalDoseMin: number;
  typicalDoseMax: number;
  doseUnit: string;
  frequency: string;
  cycleWeeksMin: number;
  cycleWeeksMax: number;
  cautions: string;
  priceOneTimeCents: number;
};

const peptides: PeptideSeed[] = [
  {
    name: "BPC-157",
    slug: "bpc-157",
    category: "HEALING_RECOVERY",
    goals: ["RECOVERY", "INJURY_REPAIR", "GENERAL_WELLNESS"],
    description:
      "A synthetic fragment derived from a protective protein found in gastric juice, widely explored for tendon, ligament, and gut healing support.",
    typicalDoseMin: 200,
    typicalDoseMax: 500,
    doseUnit: "mcg",
    frequency: "once or twice daily",
    cycleWeeksMin: 4,
    cycleWeeksMax: 8,
    cautions: "Limited human trial data. Avoid if pregnant or with a history of cancer; consult a physician.",
    priceOneTimeCents: 6499,
  },
  {
    name: "TB-500",
    slug: "tb-500",
    category: "HEALING_RECOVERY",
    goals: ["RECOVERY", "INJURY_REPAIR"],
    description:
      "A synthetic version of a peptide fragment from Thymosin Beta-4, studied for tissue repair, flexibility, and reduced inflammation.",
    typicalDoseMin: 2,
    typicalDoseMax: 5,
    doseUnit: "mg",
    frequency: "twice weekly",
    cycleWeeksMin: 4,
    cycleWeeksMax: 6,
    cautions: "Often stacked with BPC-157. Not studied long-term in humans; avoid with active malignancy.",
    priceOneTimeCents: 7999,
  },
  {
    name: "Semaglutide",
    slug: "semaglutide",
    category: "WEIGHT_LOSS",
    goals: ["FAT_LOSS", "GENERAL_WELLNESS"],
    description:
      "A GLP-1 receptor agonist that slows gastric emptying and reduces appetite, FDA-approved for weight management and type 2 diabetes.",
    typicalDoseMin: 0.25,
    typicalDoseMax: 2.4,
    doseUnit: "mg",
    frequency: "once weekly",
    cycleWeeksMin: 12,
    cycleWeeksMax: 52,
    cautions: "Titrate slowly to manage GI side effects. Contraindicated with personal/family history of MTC or MEN 2.",
    priceOneTimeCents: 22999,
  },
  {
    name: "Tirzepatide",
    slug: "tirzepatide",
    category: "WEIGHT_LOSS",
    goals: ["FAT_LOSS", "GENERAL_WELLNESS"],
    description:
      "A dual GIP/GLP-1 receptor agonist, FDA-approved for type 2 diabetes and weight management, often showing stronger weight-loss results than GLP-1-only therapies.",
    typicalDoseMin: 2.5,
    typicalDoseMax: 15,
    doseUnit: "mg",
    frequency: "once weekly",
    cycleWeeksMin: 12,
    cycleWeeksMax: 52,
    cautions: "Titrate slowly. Contraindicated with personal/family history of MTC or MEN 2; monitor for pancreatitis symptoms.",
    priceOneTimeCents: 27999,
  },
  {
    name: "CJC-1295/Ipamorelin",
    slug: "cjc-1295-ipamorelin",
    category: "GROWTH_HORMONE",
    goals: ["MUSCLE_GAIN", "RECOVERY", "SLEEP", "LONGEVITY"],
    description:
      "A combination of a GHRH analog (CJC-1295) and a selective ghrelin-receptor agonist (Ipamorelin) used to stimulate natural growth hormone pulses.",
    typicalDoseMin: 100,
    typicalDoseMax: 300,
    doseUnit: "mcg",
    frequency: "once daily",
    cycleWeeksMin: 8,
    cycleWeeksMax: 16,
    cautions: "Inject before bed on empty stomach for best effect. May cause water retention or mild flushing initially.",
    priceOneTimeCents: 8999,
  },
  {
    name: "Sermorelin",
    slug: "sermorelin",
    category: "GROWTH_HORMONE",
    goals: ["MUSCLE_GAIN", "RECOVERY", "SLEEP", "LONGEVITY"],
    description:
      "A growth-hormone-releasing hormone (GHRH) analog that stimulates the pituitary to release GH naturally; a gentler, well-studied entry point into GH peptide therapy.",
    typicalDoseMin: 200,
    typicalDoseMax: 500,
    doseUnit: "mcg",
    frequency: "once daily",
    cycleWeeksMin: 8,
    cycleWeeksMax: 24,
    cautions: "Generally well tolerated. Avoid in active malignancy; effects build gradually over weeks.",
    priceOneTimeCents: 7499,
  },
  {
    name: "Melanotan II",
    slug: "melanotan-ii",
    category: "COSMETIC",
    goals: ["SKIN_HAIR", "LIBIDO"],
    description:
      "A synthetic analog of alpha-MSH that stimulates melanin production for tanning effects and has secondary libido-enhancing properties.",
    typicalDoseMin: 0.25,
    typicalDoseMax: 1,
    doseUnit: "mg",
    frequency: "once daily",
    cycleWeeksMin: 2,
    cycleWeeksMax: 4,
    cautions: "Can cause nausea, flushing, and darkening of existing moles/freckles. Not recommended for those with a history of melanoma.",
    priceOneTimeCents: 5999,
  },
  {
    name: "GHK-Cu",
    slug: "ghk-cu",
    category: "COSMETIC",
    goals: ["SKIN_HAIR", "LONGEVITY", "RECOVERY"],
    description:
      "A naturally occurring copper-binding peptide studied for skin remodeling, collagen synthesis, wound healing, and anti-aging effects, used topically or via injection.",
    typicalDoseMin: 1,
    typicalDoseMax: 3,
    doseUnit: "mg",
    frequency: "once daily",
    cycleWeeksMin: 4,
    cycleWeeksMax: 12,
    cautions: "Topical forms are widely available and gentle; injectable forms should be sourced and dosed carefully.",
    priceOneTimeCents: 5499,
  },
  {
    name: "Epitalon",
    slug: "epitalon",
    category: "LONGEVITY",
    goals: ["LONGEVITY", "SLEEP", "GENERAL_WELLNESS"],
    description:
      "A synthetic tetrapeptide derived from the pineal gland protein epithalamin, studied for telomerase activation, circadian rhythm regulation, and longevity research.",
    typicalDoseMin: 5,
    typicalDoseMax: 10,
    doseUnit: "mg",
    frequency: "once daily",
    cycleWeeksMin: 2,
    cycleWeeksMax: 3,
    cautions: "Typically run in short cycles 2-4 times per year. Long-term human data is limited.",
    priceOneTimeCents: 6999,
  },
  {
    name: "PT-141",
    slug: "pt-141",
    category: "SEXUAL_HEALTH",
    goals: ["LIBIDO"],
    description:
      "A melanocortin receptor agonist (bremelanotide) used to address sexual arousal disorders in both men and women, acting on the central nervous system rather than the vascular system.",
    typicalDoseMin: 1,
    typicalDoseMax: 2,
    doseUnit: "mg",
    frequency: "as needed, max 1x/24h",
    cycleWeeksMin: 1,
    cycleWeeksMax: 12,
    cautions: "Can cause nausea, flushing, and transient blood pressure increases. Avoid combining with other vasoactive medications.",
    priceOneTimeCents: 6499,
  },
];

async function main() {
  console.log("Seeding peptide catalog and products...");

  for (const p of peptides) {
    const peptide = await prisma.peptide.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        category: p.category,
        goals: p.goals,
        description: p.description,
        typicalDoseMin: p.typicalDoseMin,
        typicalDoseMax: p.typicalDoseMax,
        doseUnit: p.doseUnit,
        frequency: p.frequency,
        cycleWeeksMin: p.cycleWeeksMin,
        cycleWeeksMax: p.cycleWeeksMax,
        cautions: p.cautions,
      },
      create: {
        name: p.name,
        slug: p.slug,
        category: p.category,
        goals: p.goals,
        description: p.description,
        typicalDoseMin: p.typicalDoseMin,
        typicalDoseMax: p.typicalDoseMax,
        doseUnit: p.doseUnit,
        frequency: p.frequency,
        cycleWeeksMin: p.cycleWeeksMin,
        cycleWeeksMax: p.cycleWeeksMax,
        cautions: p.cautions,
      },
    });

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: `${p.name} Vial`,
        description: p.description,
        priceOneTimeCents: p.priceOneTimeCents,
        peptideId: peptide.id,
      },
      create: {
        name: `${p.name} Vial`,
        slug: p.slug,
        description: p.description,
        priceOneTimeCents: p.priceOneTimeCents,
        peptideId: peptide.id,
        // Stripe price IDs are left null until configured in the Stripe
        // dashboard / env vars. The checkout route falls back gracefully.
        stripePriceIdOneTime: null,
        stripePriceIdSubscription: null,
      },
    });
  }

  console.log(`Seeded ${peptides.length} peptides and products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
