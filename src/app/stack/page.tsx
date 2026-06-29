import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StackItemCard from "@/components/StackItemCard";
import AddPeptidePicker from "@/components/AddPeptidePicker";

export default async function StackPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [stackItems, catalog] = await Promise.all([
    prisma.stackItem.findMany({
      where: { userId: session.user.id },
      include: { peptide: true, doseLogs: { orderBy: { takenAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.peptide.findMany({ orderBy: { name: "asc" } }),
  ]);

  const inStackIds = new Set(stackItems.map((s) => s.peptideId));
  const available = catalog.filter((p) => !inStackIds.has(p.id));

  const serializedItems = stackItems.map((item) => ({
    id: item.id,
    status: item.status,
    startedAt: item.startedAt ? item.startedAt.toISOString() : null,
    peptide: {
      id: item.peptide.id,
      name: item.peptide.name,
      doseUnit: item.peptide.doseUnit,
      typicalDoseMin: item.peptide.typicalDoseMin,
      typicalDoseMax: item.peptide.typicalDoseMax,
      frequency: item.peptide.frequency,
    },
    doseLogs: item.doseLogs.map((d) => ({
      id: d.id,
      takenAt: d.takenAt.toISOString(),
      amount: d.amount,
      unit: d.unit,
      note: d.note,
    })),
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-white">My stack</h1>
      <p className="mt-2 text-gray-400">
        Track what you&apos;re taking, log doses, and we&apos;ll flag anything that
        drifts from typical guidance.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {serializedItems.map((item) => (
          <StackItemCard key={item.id} item={item} />
        ))}
        {serializedItems.length === 0 && (
          <p className="text-gray-400">
            Your stack is empty. Add a peptide below or check your dashboard
            for recommendations.
          </p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Add a peptide</h2>
        <AddPeptidePicker
          peptides={available.map((p) => ({ id: p.id, name: p.name, category: p.category }))}
        />
      </div>
    </div>
  );
}
