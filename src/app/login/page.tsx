"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import { apiFetch, storeAuth, type AuthPayload } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = await apiFetch<AuthPayload>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      storeAuth(payload);
      if (payload.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/trips");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_48%,#fff7ed_100%)] text-slate-900">
      <TopNav active="Dashboard" />

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="relative mx-auto grid min-h-[calc(100vh-132px)] max-w-7xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-sky-900/14 lg:grid-cols-[1.05fr_0.95fr]">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
            alt="Sunny beach and ocean for travel login"
            fill
            preload
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/28 to-white/8" />

          <section className="relative z-10 flex min-h-[520px] items-center px-6 py-12 md:px-12 lg:px-16">
            <div className="max-w-xl text-white">
              <div className="mb-8 inline-flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/35 bg-white/15 backdrop-blur shadow-lg shadow-black/20">
                  <Image
                    src="/logo.png"
                    alt="Traveloop Logo"
                    fill
                    className="object-cover scale-110"
                  />
                </div>
                <span className="text-3xl font-black tracking-tight">
                  TRAVELOOP
                </span>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-100">
                Travel
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Explore Horizons
              </h1>
              <p className="mt-7 max-w-md text-xl font-semibold leading-8 text-white">
                Where your dream destinations become easy plans.
              </p>
              <p className="mt-4 max-w-md text-sm leading-6 text-sky-50">
                Build trips, budgets, packing lists, notes, and shared pages in
                one bright travel workspace.
              </p>
            </div>
          </section>

          <section className="relative z-10 flex items-center justify-center px-4 py-8 md:px-10">
            <div className="w-full max-w-lg rounded-[1.75rem] border border-white/70 bg-white/78 p-6 shadow-2xl shadow-slate-900/18 backdrop-blur-2xl md:p-9">
              <div className="mx-auto mb-7 grid h-24 w-24 place-items-center rounded-full border border-sky-100 bg-white shadow-lg shadow-sky-100">
                <Icon name="profile" className="h-10 w-10 text-sky-500" />
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-bold text-slate-700">
                  Email
                  <input
                    aria-label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-2 h-13 w-full rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100 placeholder:text-slate-500"
                  />
                </label>

                <label className="block text-sm font-bold text-slate-700">
                  Password
                  <input
                    aria-label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    required
                    className="mt-2 h-13 w-full rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100 placeholder:text-slate-500"
                  />
                </label>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 font-medium text-slate-600">
                    <input type="checkbox" className="h-4 w-4 accent-sky-500" />
                    Remember me
                  </label>
                  <Link href="/signup" className="font-bold text-sky-600">
                    Create account
                  </Link>
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Logging in..." : "Login"} <Icon name="arrow" className="h-4 w-4" />
                </button>
              </form>

              <div className="my-7 flex items-center gap-4 text-sm font-semibold text-slate-500">
                <span className="h-px flex-1 bg-sky-100" />
                secure JWT session
                <span className="h-px flex-1 bg-sky-100" />
              </div>

              <div className="mt-7 border-t border-sky-100 pt-6 text-center">
                <p className="text-sm font-medium text-slate-600">
                  Are you new?
                </p>
                <Link
                  href="/signup"
                  className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sm font-black uppercase tracking-wide text-sky-700 transition hover:border-sky-300 hover:bg-white"
                >
                  Registration
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
