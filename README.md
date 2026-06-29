# PeptideStack

A full-stack peptide-coaching app: profile-driven peptide recommendations,
stack/dose tracking with automatic keep/cut/add flags, a Stripe-powered shop
(one-time + subscription), and an Anthropic-backed AI assistant grounded in
the user's own profile and stack.

Built with Next.js 16 (App Router, TypeScript), Tailwind CSS, Prisma +
PostgreSQL, NextAuth (Auth.js) v5 with Credentials auth, Stripe, and the
Anthropic SDK.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env` and fill in the values below.

| Variable | Required for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Database | Must point to a real PostgreSQL instance (Vercel Postgres, Neon, Supabase, etc). `prisma generate` works without a live DB; `prisma migrate`/`db push` need a real connection. |
| `NEXTAUTH_SECRET` | Auth | Random secret used to sign session tokens. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Auth | Base URL of the deployed app (e.g. `http://localhost:3000` in dev). |
| `STRIPE_SECRET_KEY` | Shop / checkout | From the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) (test mode). If unset, the shop renders with checkout disabled and a "Stripe not configured" notice instead of crashing. |
| `STRIPE_WEBHOOK_SECRET` | Order status updates | From `stripe listen` (CLI) or your webhook endpoint settings. Used by `src/app/api/webhooks/stripe/route.ts` to mark orders paid/canceled. |
| `ANTHROPIC_API_KEY` | AI assistant | From the [Anthropic console](https://console.anthropic.com/settings/keys). If unset, `/assistant` returns a clear "AI assistant not configured" message instead of crashing. |

### Stripe price IDs

Each seeded `Product` row has optional `stripePriceIdOneTime` and
`stripePriceIdSubscription` columns. If you create matching Products/Prices
in the Stripe dashboard, set those IDs on the corresponding `Product` rows
(via Prisma Studio or a migration) and checkout will use them directly.
If left null, the checkout route falls back to creating an ad-hoc Stripe
Price from the product's `priceOneTimeCents` at checkout time — this works
out of the box in Stripe test mode with no dashboard setup required.

## Database setup

This repo ships with `prisma/schema.prisma` (Postgres provider) and a
seed script (`prisma/seed.ts`) covering ~10 real peptides (BPC-157, TB-500,
Semaglutide, Tirzepatide, CJC-1295/Ipamorelin, Sermorelin, Melanotan II,
GHK-Cu, Epitalon, PT-141) and their shop `Product` counterparts.

Once `DATABASE_URL` points at a real Postgres database:

```bash
npm run db:push     # or: npm run db:migrate (creates a migration)
npm run db:seed      # seeds the peptide catalog + shop products
```

The Prisma client (`@prisma/client`) is already generated against
`prisma/schema.prisma` so the app builds and type-checks without a live
database connection — only actual queries at runtime require one.

## Manual setup still required (not done in this environment)

- **Provision a real Postgres database** and set `DATABASE_URL` (no local
  Postgres server was installed or run here).
- **Run `npm run db:push`** (or `db:migrate`) against that database to
  create the tables, then `npm run db:seed` to load the peptide catalog.
- **Create a Stripe account / test-mode API key** and set
  `STRIPE_SECRET_KEY`. Optionally create Products/Prices in the Stripe
  dashboard and wire their IDs into the seeded `Product` rows for
  `stripePriceIdOneTime` / `stripePriceIdSubscription`.
- **Set up a Stripe webhook endpoint** (`/api/webhooks/stripe`) and set
  `STRIPE_WEBHOOK_SECRET`, e.g. via `stripe listen --forward-to
  localhost:3000/api/webhooks/stripe` in development.
- **Get an Anthropic API key** and set `ANTHROPIC_API_KEY` to enable
  `/assistant`.
- **Generate `NEXTAUTH_SECRET`** and set `NEXTAUTH_URL` for your deployment.

## Project structure highlights

- `prisma/schema.prisma` — User/Account/Session (NextAuth), Profile,
  Peptide, StackItem, DoseLog, Product, Order/OrderItem models.
- `prisma/seed.ts` — peptide catalog + shop product seed data.
- `src/lib/recommend.ts` — deterministic, unit-testable rule-based
  recommendation engine (goal matching + experience/age/BMI adjustments).
- `src/lib/stackAnalysis.ts` — deterministic keep / cut-dose /
  cut-frequency / cut-cycle-length / gap analysis over a user's logged
  dose history vs. catalog guidance.
- `src/lib/auth.ts` — NextAuth v5 Credentials + Prisma adapter config.
- `src/app/api/checkout/route.ts` — Stripe Checkout session creation
  (one-time and subscription modes), gracefully degrading without
  `STRIPE_SECRET_KEY`.
- `src/app/api/assistant/route.ts` — Anthropic-backed chat endpoint,
  injecting the user's profile + stack into the system prompt, gracefully
  degrading without `ANTHROPIC_API_KEY`.
