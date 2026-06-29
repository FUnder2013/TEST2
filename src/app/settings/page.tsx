import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountDataPanel from "@/components/AccountDataPanel";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, orders] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id, mode: "subscription", status: "PAID" },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Profile</h2>
          <Link href="/onboarding" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Edit
          </Link>
        </div>
        {profile ? (
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-300">
            <div>
              <dt className="text-xs text-gray-500">Goals</dt>
              <dd>{profile.goals.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Experience</dt>
              <dd>{profile.experienceLevel}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Weight / Height</dt>
              <dd>{profile.weightKg} kg / {profile.heightCm} cm</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Age / Sex</dt>
              <dd>{profile.age} / {profile.sex}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No profile yet.</p>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Subscriptions
        </h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No active subscriptions.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between text-sm text-gray-300">
                <span>{o.items.map((i) => i.product.name).join(", ")}</span>
                <span className="text-xs text-gray-500">
                  since {o.createdAt.toISOString().slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-gray-500">
          Manage or cancel subscriptions from your Stripe billing portal.
        </p>
      </section>

      <div className="mt-8">
        <AccountDataPanel />
      </div>
    </div>
  );
}
