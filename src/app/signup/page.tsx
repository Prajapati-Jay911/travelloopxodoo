import Image from "next/image";
import Link from "next/link";
import { TopNav } from "@/components/app-shell";
import { Icon } from "@/components/ui";

export default function SignupPage() {
  const fields = [
    "First name",
    "Last name",
    "Email address",
    "Phone number",
    "City",
    "Country",
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_48%,#fff7ed_100%)] text-slate-900">
      <TopNav active="Dashboard" />

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="relative mx-auto grid min-h-[calc(100vh-132px)] max-w-7xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-sky-900/14 lg:grid-cols-[0.95fr_1.05fr]">
          <Image
            src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80"
            alt="Traveler planning a mountain route"
            fill
            preload
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/28 to-white/8" />

          <section className="relative z-10 flex min-h-[520px] items-center px-6 py-12 md:px-12 lg:px-16">
            <div className="max-w-xl text-white">
              <div className="mb-8 inline-flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur">
                  <Icon name="arrow" className="h-5 w-5 -rotate-45" />
                </span>
                <span className="text-3xl font-black tracking-tight">
                  TRAVELOOP
                </span>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-100">
                Registration
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Join The Journey
              </h1>
              <p className="mt-7 max-w-md text-xl font-semibold leading-8 text-white">
                Create your travel profile and start planning brighter trips.
              </p>
              <p className="mt-4 max-w-md text-sm leading-6 text-sky-50">
                Save destinations, track budgets, collect notes, and share your
                itinerary with fellow travelers.
              </p>
            </div>
          </section>

          <section className="relative z-10 flex items-center justify-center px-4 py-8 md:px-10">
            <div className="w-full max-w-2xl rounded-[1.75rem] border border-white/70 bg-white/82 p-6 shadow-2xl shadow-slate-900/18 backdrop-blur-2xl md:p-8">
              <div className="mx-auto mb-7 grid h-24 w-24 place-items-center rounded-full border border-sky-100 bg-white shadow-lg shadow-sky-100">
                <Icon name="profile" className="h-10 w-10 text-sky-500" />
              </div>

              <div className="mb-6 text-center">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff5a3d]">
                  Registration
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  Create your account
                </h2>
              </div>

              <form className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <label
                    key={field}
                    className="block text-sm font-bold text-slate-700"
                  >
                    {field}
                    <input
                      aria-label={field}
                      type={field.includes("Email") ? "email" : "text"}
                      className="mt-2 h-12 w-full rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100 placeholder:text-slate-500"
                      placeholder={field}
                    />
                  </label>
                ))}

                <label className="block text-sm font-bold text-slate-700 md:col-span-2">
                  Additional information
                  <textarea
                    aria-label="Additional information"
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-sky-100 bg-white px-4 py-3 text-slate-900 shadow-sm shadow-sky-100 placeholder:text-slate-500"
                    placeholder="Additional information ..."
                  />
                </label>

                <Link
                  href="/"
                  className="md:col-span-2 flex h-13 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
                >
                  Register Users <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </form>

              <div className="mt-7 border-t border-sky-100 pt-6 text-center">
                <p className="text-sm font-medium text-slate-600">
                  Already registered?
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sm font-black uppercase tracking-wide text-sky-700 transition hover:border-sky-300 hover:bg-white"
                >
                  Login
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
