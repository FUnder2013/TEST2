import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  mode: z.enum(["payment", "subscription"]),
});

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY to enable checkout." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || !product.active) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { mode } = parsed.data;
  const priceId =
    mode === "subscription"
      ? product.stripePriceIdSubscription
      : product.stripePriceIdOneTime;

  const origin = req.nextUrl.origin;

  const lineItem: { price?: string; price_data?: Stripe.Checkout.SessionCreateParams.LineItem["price_data"]; quantity: number } = priceId
    ? { price: priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: product.priceOneTimeCents,
          product_data: { name: product.name },
          ...(mode === "subscription" ? { recurring: { interval: "month" as const } } : {}),
        },
      };

  const checkoutSession = await stripe.checkout.sessions.create({
    mode,
    line_items: [lineItem],
    success_url: `${origin}/shop?success=1`,
    cancel_url: `${origin}/shop?canceled=1`,
    customer_email: session.user.email ?? undefined,
    metadata: {
      userId: session.user.id,
      productId: product.id,
      isSubscription: String(mode === "subscription"),
    },
  });

  await prisma.order.create({
    data: {
      userId: session.user.id,
      stripeSessionId: checkoutSession.id,
      mode,
      status: "PENDING",
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            isSubscription: mode === "subscription",
          },
        ],
      },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
