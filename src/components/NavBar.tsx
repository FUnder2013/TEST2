import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function NavBar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
          PeptideStack
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-gray-300 sm:flex">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/stack" className="hover:text-white">
            My Stack
          </Link>
          <Link href="/shop" className="hover:text-white">
            Shop
          </Link>
          <Link href="/assistant" className="hover:text-white">
            AI Assistant
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-gray-200 transition hover:border-white/40 hover:text-white"
              >
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-200 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
