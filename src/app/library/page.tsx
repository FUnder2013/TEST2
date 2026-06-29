import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReconCalculator from "@/components/ReconCalculator";
import ConsultRequestForm from "@/components/ConsultRequestForm";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ consult?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { consult } = await searchParams;
  const catalog = await prisma.peptide.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Peptide library</h1>
      <p className="mt-2 text-gray-400">
        Reference info for every peptide in the catalog, plus a reconstitution calculator.
      </p>

      <div className="mt-8">
        <ReconCalculator />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {catalog.map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{p.name}</h3>
              {p.isRx && (
                <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-semibold text-amber-300">
                  Rx
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-400">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-gray-500">
              <span className="rounded-full border border-white/10 px-2 py-0.5">
                {p.category.replace(/_/g, " ")}
              </span>
              {p.halfLifeHours != null && (
                <span className="rounded-full border border-white/10 px-2 py-0.5">
                  t½ {p.halfLifeHours}h
                </span>
              )}
              {p.researchStatus && (
                <span className="rounded-full border border-white/10 px-2 py-0.5">
                  {p.researchStatus}
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-500">{p.cautions}</p>
            {p.isRx && consult === p.id && (
              <div className="mt-4">
                <ConsultRequestForm peptideId={p.id} peptideName={p.name} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
