import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    await prisma.order
      .update({
        where: { stripeSessionId: checkoutSession.id },
        data: {
          status: "PAID",
          amountTotal: checkoutSession.amount_total ?? undefined,
        },
      })
      .catch(() => {
        // Order may not exist if it was created outside this app's flow; ignore.
      });
  }

  if (event.type === "checkout.session.expired") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    await prisma.order
      .update({
        where: { stripeSessionId: checkoutSession.id },
        data: { status: "CANCELED" },
      })
      .catch(() => {});
  }

  return NextResponse.json({ received: true });
}
