import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Shop</h1>
      <p className="mt-2 text-gray-400">
        Peptide vials available one-time or as a monthly subscription.
      </p>

      {params.success && (
        <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          Checkout complete (test mode). Thanks for your order!
        </div>
      )}
      {params.canceled && (
        <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
          Checkout canceled.
        </div>
      )}
      {!stripeConfigured && (
        <div className="mt-4 rounded-lg border border-gray-500/30 bg-gray-500/10 px-4 py-3 text-sm text-gray-400">
          Stripe is not configured in this environment. Checkout is disabled
          until STRIPE_SECRET_KEY is set.
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              description: p.description,
              priceOneTimeCents: p.priceOneTimeCents,
            }}
            stripeConfigured={stripeConfigured}
          />
        ))}
      </div>
    </div>
  );
}
