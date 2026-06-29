import Link from "next/link";

const PEPTIDES = [
  "BPC-157",
  "TB-500",
  "Semaglutide",
  "Tirzepatide",
  "CJC-1295/Ipamorelin",
  "Sermorelin",
  "Melanotan II",
  "GHK-Cu",
  "Epitalon",
  "PT-141",
];

const FEATURES = [
  {
    title: "Personalized recommendations",
    body: "Tell us your goals, body stats, and experience level. Our rule-based engine matches you to the peptides best suited to fat loss, muscle gain, recovery, longevity, and more.",
  },
  {
    title: "Stack tracking that actually checks your work",
    body: "Log every dose. We compare your real-world history against typical dosage, frequency, and cycle length — and tell you when to keep going, cut back, or fill a gap.",
  },
  {
    title: "Shop with confidence",
    body: "Buy peptide vials one-time or subscribe for recurring delivery. Secure checkout powered by Stripe.",
  },
  {
    title: "An AI coach that knows your stack",
    body: "Chat with an assistant that has your profile and current stack in context, so answers are grounded in your actual protocol — not generic advice.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.25), transparent 50%), radial-gradient(circle at 80% 0%, rgba(99,102,241,0.2), transparent 50%)",
          }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm font-medium text-emerald-300">
            Personalized peptide coaching
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Build your peptide stack
            <span className="block text-emerald-400">with data, not guesswork.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            PeptideStack profiles your goals and body, recommends the right
            compounds, tracks every dose against typical protocols, and gives
            you an AI assistant that actually knows your stack.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-8 py-3 text-base font-semibold text-black transition hover:bg-emerald-400"
            >
              Start your profile
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white transition hover:border-white/40"
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Covering the compounds that matter
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {PEPTIDES.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
              >
                <h3 className="text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-gray-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/10 p-10 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to build a stack that&apos;s actually yours?
          </h2>
          <p className="mt-4 text-gray-300">
            Create a free profile, get matched to the right peptides, and let
            us watch your protocol for you.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-emerald-500 px-8 py-3 text-base font-semibold text-black transition hover:bg-emerald-400"
          >
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
}
