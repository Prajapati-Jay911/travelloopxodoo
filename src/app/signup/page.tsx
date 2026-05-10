import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 md:p-8">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 font-bold text-white">
              T
            </span>
            <span className="text-xl font-semibold text-white">Traveloop</span>
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Step 1 of 2
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                Create your travel profile
              </h1>
            </div>
            <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-slate-800 sm:block">
              <div className="h-full w-1/2 rounded-full bg-indigo-400" />
            </div>
          </div>

          <form className="mt-8 grid gap-4 md:grid-cols-2">
            {["First name", "Last name", "Email address", "Phone number", "City", "Country"].map(
              (field) => (
                <label key={field} className="block text-sm font-medium text-slate-200">
                  {field}
                  <input
                    aria-label={field}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-100 placeholder:text-slate-600"
                    placeholder={field}
                  />
                </label>
              ),
            )}
            <label className="block text-sm font-medium text-slate-200 md:col-span-2">
              Password
              <input
                aria-label="Password"
                type="password"
                className="mt-2 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-100"
                placeholder="Create a secure password"
              />
            </label>
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Password strength</span>
                <span className="text-emerald-300">Strong</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-4/5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <label className="block text-sm font-medium text-slate-200 md:col-span-2">
              Travel preferences
              <textarea
                aria-label="Travel preferences"
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                placeholder="Food, culture, accessibility needs, pace, budget style..."
              />
            </label>
            <button
              type="button"
              className="md:col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 font-semibold text-white transition hover:scale-[1.02] hover:bg-indigo-400"
            >
              Continue <Icon name="arrow" className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
      <section className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80"
          alt="Traveler planning a mountain route"
          fill
          preload
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
      </section>
    </main>
  );
}
