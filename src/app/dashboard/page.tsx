import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recommendPeptides } from "@/lib/recommend";
import { analyzeStack } from "@/lib/stackAnalysis";
import AddToStackClientButton from "@/components/AddToStackClientButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, catalog, stackItems] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.peptide.findMany({ orderBy: { name: "asc" } }),
    prisma.stackItem.findMany({
      where: { userId: session.user.id },
      include: { peptide: true, doseLogs: true },
    }),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  const recommendations = recommendPeptides(profile, catalog).slice(0, 5);
  const inStackIds = new Set(stackItems.map((s) => s.peptideId));
  const { flags, gaps } = analyzeStack(profile, stackItems, catalog);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Your dashboard</h1>
        <Link
          href="/onboarding"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          Edit profile
        </Link>
      </div>

      {flags.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Stack status</h2>
          <div className="mt-3 grid gap-3">
            {flags.map((f) => (
              <div
                key={f.stackItemId}
                className={`rounded-xl border p-4 ${
                  f.flag === "KEEP"
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-amber-400/30 bg-amber-400/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{f.peptideName}</span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                      f.flag === "KEEP"
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-amber-400/20 text-amber-300"
                    }`}
                  >
                    {f.flag.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">{f.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {gaps.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Gaps in your stack</h2>
          <div className="mt-3 grid gap-3">
            {gaps.map((g) => (
              <div
                key={g.goal}
                className="rounded-xl border border-indigo-400/30 bg-indigo-400/5 p-4 text-sm text-gray-300"
              >
                {g.message}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Recommended for you</h2>
        <p className="mt-1 text-sm text-gray-400">
          Based on your goals, experience level, and body profile.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {recommendations.map((r) => (
            <div
              key={r.peptide.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{r.peptide.name}</h3>
                {inStackIds.has(r.peptide.id) && (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                    In your stack
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-400">{r.peptide.description}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                {r.peptide.typicalDoseMin}-{r.peptide.typicalDoseMax}
                {r.peptide.doseUnit} &middot; {r.peptide.frequency} &middot;{" "}
                {r.peptide.cycleWeeksMin}-{r.peptide.cycleWeeksMax} wk cycle
              </p>
              {!inStackIds.has(r.peptide.id) && (
                <AddToStackClientButton peptideId={r.peptide.id} />
              )}
            </div>
          ))}
          {recommendations.length === 0 && (
            <p className="text-gray-400">
              No matches yet — try selecting more goals in your profile.
            </p>
          )}
        </div>
      </section>

      <div className="mt-10 flex gap-4">
        <Link
          href="/stack"
          className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Manage my stack
        </Link>
        <Link
          href="/assistant"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white hover:border-white/40"
        >
          Ask the AI assistant
        </Link>
      </div>
    </div>
  );
}
