import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80"
          alt="Aerial coastline travel inspiration"
          fill
          preload
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            Lisbon / Tokyo / Cape Town
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
            Every stop, cost, note, and memory in one calm workspace.
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 md:p-8">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 font-bold text-white">
              T
            </span>
            <span className="text-xl font-semibold text-white">Traveloop</span>
          </Link>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in to continue planning your itineraries, budgets, and shared trip pages.
          </p>

          <form className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-slate-200">
              Email
              <input
                aria-label="Email address"
                type="email"
                placeholder="priya@example.com"
                className="mt-2 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-100 placeholder:text-slate-600"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Password
              <div className="mt-2 flex h-12 items-center rounded-xl border border-slate-700 bg-slate-950 px-4">
                <input
                  aria-label="Password"
                  type="password"
                  placeholder="Enter password"
                  className="w-full bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Show password"
                  className="text-sm font-semibold text-indigo-300"
                >
                  Show
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" className="h-4 w-4 accent-indigo-500" />
                Remember me
              </label>
              <Link href="/signup" className="font-semibold text-indigo-300">
                Forgot password?
              </Link>
            </div>
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 font-semibold text-white transition hover:scale-[1.02] hover:bg-indigo-400"
            >
              Login <Icon name="arrow" className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 font-semibold text-slate-100 transition hover:border-indigo-400"
            >
              Continue with Google
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-indigo-300">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
